FROM mcr.microsoft.com/playwright:v1.39.0-jammy

RUN npm i -g playwright @playwright/test

WORKDIR /app/

RUN npm link playwright @playwright/test
COPY scripts/generate-screenshots.js generate-screenshots.mjs

CMD ["node", "generate-screenshots.mjs"]