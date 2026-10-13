FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3001 DB_FILE_NAME=file:/data/couplegoats.db
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/openapi.yaml ./openapi.yaml
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
