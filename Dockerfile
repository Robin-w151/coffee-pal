FROM oven/bun AS build-stage

WORKDIR /app/

COPY package.json yarn.lock .npmrc /app/

RUN bun install

COPY postcss.config.js svelte.config.js tailwind.config.ts theme.ts tsconfig.json vite.config.ts /app/
COPY src/ /app/src/
COPY static/ /app/static/

ENV USE_ADAPTER_BUN=true

RUN bunx svelte-kit sync
RUN bun run build


FROM oven/bun AS deploy-stage

WORKDIR /app/

COPY --from=build-stage /app/build/ /app/
RUN chown -R 10000:10000 /app/

USER 10000:10000

EXPOSE 3000

CMD ["bun", "index.js"]
