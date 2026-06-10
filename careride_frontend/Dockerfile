FROM node:18-alpine as build-stage
RUN apk add --no-cache python3 py3-setuptools make g++
WORKDIR /app
COPY package*.json ./
RUN yarn install --ignore-engines
COPY . .
RUN cp .env.prod .env
RUN yarn run build

FROM nginx:1.13

COPY ./deploy/prod/conf_ssl/ /etc/nginx/conf.d/
COPY --from=build-stage /app/dist /usr/share/nginx/html
