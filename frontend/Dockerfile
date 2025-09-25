# Stage 1: build React app
FROM node:20 AS build

WORKDIR /app

# Копируем только файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости строго по package-lock.json
RUN npm ci --legacy-peer-deps --registry=https://registry.npmjs.org/

# Копируем весь код и собираем фронтенд
COPY . .
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш конфиг
COPY nginx.conf /etc/nginx/conf.d/

# Копируем собранный билд
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
