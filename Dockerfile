ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base AS dev
COPY ./package*.json ./
RUN npm install
USER node
COPY . .
CMD npm run dev
