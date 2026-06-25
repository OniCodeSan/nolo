# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json vite.config.js index.html ./
COPY public ./public
COPY src ./src
# Il .env (solo VITE_* pubbliche) è montato come secret SOLO durante questo
# RUN: Vite lo legge a build-time per bakare le var, ma NON finisce in alcun
# layer dell'immagine (niente secret server-side congelati). Build con:
#   docker build --secret id=dotenv,src=.env ...
RUN --mount=type=secret,id=dotenv,target=/app/.env,required=false npm run build

FROM nginx:alpine AS prod
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Normalizza i permessi: i file copiati da public/ ereditano i mode
# restrittivi dell'host (700) e nginx non riuscirebbe a leggerli (403).
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
