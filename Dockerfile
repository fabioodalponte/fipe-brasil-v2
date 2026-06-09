FROM node:22-alpine AS deps

WORKDIR /app

# Usamos o Chromium do Alpine no prerender; nao baixamos o do puppeteer.
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build

WORKDIR /app

# Chromium do sistema para o snapshot de prerender (scripts/prerender.ts).
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .

# `npm run build` encadeia: prebuild (sitemap) -> tsc -> vite build -> prerender.
# Requer FIPE_DATABASE_URL no ambiente de build (mesma exigencia do sitemap).
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4173

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/vite.config.ts ./vite.config.ts

EXPOSE 4173

CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}"]
