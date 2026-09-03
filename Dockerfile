FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS build
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_USE_MOCK_API=false
ARG NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API \
    NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL=$NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL \
    NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001
WORKDIR /app
RUN addgroup -S nodejs -g 1001 \
    && adduser -S nextjs -u 1001 -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
