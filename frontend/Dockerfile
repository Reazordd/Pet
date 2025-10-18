# ===============================
# 🧱 1️⃣ Стадия сборки (Node)
# ===============================
FROM node:20 AS build

WORKDIR /app

# Используем стабильный npm registry
RUN npm config set registry https://registry.npmjs.org

# Копируем package.json и package-lock.json (чтобы кешировать зависимости)
COPY package*.json ./

# Устанавливаем зависимости (с кешом)
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Копируем весь проект
COPY . .

# Собираем Vite-проект
RUN npm run build


# ===============================
# 🚀 2️⃣ Стадия продакшена (Nginx)
# ===============================
FROM nginx:stable-alpine

# Удаляем стандартный конфиг nginx и добавляем свой
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Устанавливаем Brotli для сжатия
RUN apk add --no-cache brotli

# Копируем собранный фронтенд из первой стадии
COPY --from=build /app/dist /usr/share/nginx/html

# Порт 80 — HTTP
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
