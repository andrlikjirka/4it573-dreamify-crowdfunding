ARG NODE_VERSION=21.6.2

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

FROM base as dev
EXPOSE 3000
USER node
COPY ../ .
RUN --mount=type=bind,source=../package.json,target=package.json \
    --mount=type=bind,source=../package-lock.json,target=/package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
CMD npm run dev
