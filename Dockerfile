FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src/ src/
RUN npm ci && npm run build && npm prune --omit=dev

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist/ dist/
COPY --from=build /app/node_modules/ node_modules/
COPY package.json ./
ENV NODE_ENV=production
USER node
ENTRYPOINT ["node", "dist/index.js"]
