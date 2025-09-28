# --- Stage 1: билд фронтенда ---
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
# убираем node_modules из проекта и ставим заново под linux
RUN rm -rf node_modules
RUN npm install --legacy-peer-deps --include=dev

COPY . .

RUN npm run build

# --- Stage 2: Nginx для отдачи статики ---
FROM nginx:stable-alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY ../nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

