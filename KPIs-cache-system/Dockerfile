FROM node:current-alpine3.20 AS base

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY src/ ./src
COPY package.json ./
COPY graphql.config.ts ./
COPY tsconfig.json ./
COPY build.ts ./

USER node

# -- install dependencies stage
FROM base AS install
RUN npm install 

# -- build stage
FROM install AS build
RUN npm run build


EXPOSE 3005

CMD [ "node", "dist/index.js" ]