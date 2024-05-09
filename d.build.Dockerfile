FROM oven/bun:debian AS build-stage

RUN apt update && apt install -yq git && apt-get clean

WORKDIR /app/

COPY package.json pnpm-lock.yaml .npmrc /app/

RUN bun install

COPY .env postcss.config.js svelte.config.js tailwind.config.ts theme.ts tsconfig.json vite.config.ts /app/
COPY src/ /app/src/
COPY static/ /app/static/
COPY .git/ /app/.git/

ENV USE_ADAPTER_BUN=true

RUN bunx svelte-kit sync
RUN bun run build


FROM oven/bun:debian AS deploy-stage

WORKDIR /app/

COPY --from=build-stage /app/build/ /app/
RUN chown -R 10000:10000 /app/

USER 10000:10000

EXPOSE 3000

CMD ["bun", "index.js"]
