FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY ./ .
RUN yarn run build

FROM nginx:alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf.template .
ENV DOLAR=$
CMD envsubst < nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'