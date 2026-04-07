FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 proxy

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=proxy:nodejs index.js package.json ./

USER proxy

EXPOSE 8080

CMD ["node", "index.js"]
