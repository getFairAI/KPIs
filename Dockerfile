FROM node:current-alpine3.20

RUN mkdir -p /home/node/client/node_modules && chown -R node:node /home/node/client

WORKDIR /home/node/client

COPY src/ ./src
COPY package.json ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY postcss.config.js ./
COPY vite.config.ts ./
COPY index.html ./

USER node

RUN npm install && npm run build

COPY --chown=node:node . .

# no need to expose anything, just build files for the client