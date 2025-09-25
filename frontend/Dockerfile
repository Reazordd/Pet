# --- Сборка фронтенда ---
FROM node:20 AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
COPY .npmrc ./
RUN npm install --legacy-peer-deps

# Копируем всё приложение и билдим
COPY . .
RUN npm run build

# --- Nginx для отдачи статики ---
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг и копируем свой
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

# Копируем готовую сборку фронтенда
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
