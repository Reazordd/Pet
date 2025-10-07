# ==========================
# Stage 1 — Build React/Vite
# ==========================
FROM node:20 AS build

WORKDIR /app

# Копируем package.json и package-lock.json/yarn.lock
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходники
COPY . .

# Сборка проекта (Vite)
RUN npm run build   # Создаёт /app/dist

# ==========================
# Stage 2 — Nginx
# ==========================
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Копируем свой конфиг nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронтенд из Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Прокси API через /api/ к backend
# (это уже настроено в default.conf)

# Открываем порт
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
