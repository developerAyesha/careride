FROM node:14-alpine as build-stage
WORKDIR /app
COPY ../careride_front/package*.json ./
RUN yarn install
COPY ../careride_front/ .
RUN cp .env.production .env
RUN yarn run build

FROM nginx:1.13

COPY ./conf/ /etc/nginx/conf.d/
#COPY ./conf_ssl/ /etc/nginx/conf.d/

COPY --from=build-stage ../careride_front/app/dist /usr/share/nginx/html
#ENTRYPOINT ["/docker-entrypoint.sh"]
