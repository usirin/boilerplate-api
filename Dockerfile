FROM mhart/alpine-node:10.11.0

RUN apk --no-cache add --virtual builds-deps build-base python bash

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
