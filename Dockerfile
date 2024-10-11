# -- setup workdir stage
FROM node:current-alpine3.20 AS base

RUN mkdir -p /home/node/client/node_modules && chown -R node:node /home/node/client

WORKDIR /home/node/client

COPY src/ ./src
COPY public/ ./public
COPY package.json ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY postcss.config.js ./
COPY vite.config.ts ./
COPY index.html ./

USER node

# -- install dependencies stage

FROM base AS install
RUN npm install

# -- build stage
FROM install AS build
RUN npm run build

# no need to expose anything, just build files for the client