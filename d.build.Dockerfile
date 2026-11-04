FROM node:24-slim AS build-stage

RUN apt update && apt install -yq git && apt-get clean
RUN corepack enable

WORKDIR /app/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

# Skips husky's git hooks; they aren't needed in the image.
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

COPY .env tsconfig.json vite.config.ts /app/
COPY src/ /app/src/
COPY static/ /app/static/
COPY .git/ /app/.git/

ARG APP_MODE=dev
ENV PUBLIC_APP_MODE=$APP_MODE
ENV USE_ADAPTER_NODE=true

RUN pnpm build


FROM node:24-slim AS deploy-stage

WORKDIR /app/

# All packages are devDependencies and get bundled into build/, so no node_modules are needed.
# package.json is still required for "type": "module".
COPY --from=build-stage /app/build/ /app/build/
COPY --from=build-stage /app/package.json /app/
RUN chown -R 10000:10000 /app/

USER 10000:10000

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build"]
