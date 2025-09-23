# Этап сборки React
FROM node:20 AS build

WORKDIR /app

# Копируем package.json и ставим зависимости
COPY package*.json ./
RUN npm install

# Копируем весь фронтенд и собираем билд
COPY . .
RUN npm run build

# Этап nginx для отдачи статики
FROM nginx:stable-alpine

# Копируем собранный билд React в папку nginx
COPY --from=build /app/dist /usr/share/nginx/html
