# frontend/Dockerfile
# Stage: build
FROM node:20 AS build

WORKDIR /app

# Настройки npm, повышаем надёжность скачивания
RUN npm config set registry https://registry.npmjs.org \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

COPY package*.json ./

# ставим зависимости (prefer npm ci, но fallback на npm install)
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

# Сборка приложения (Vite)
RUN npm run build

# Stage: production nginx
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг и копируем наш
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Копируем собранный билд
COPY --from=build /app/dist /usr/share/nginx/html

# Если нужны brotli утилиты, можно установить, но не использовать директиву brotli в конфиге nginx
RUN apk add --no-cache brotli

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
