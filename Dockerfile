ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

FROM base AS dev
COPY ./package*.json ./
RUN npm install
USER node
COPY . .
EXPOSE 3000
CMD npm run dev

FROM base AS test
COPY ./package*.json ./
RUN npm install
USER node
COPY . .
EXPOSE 3001
CMD npm run test-app
