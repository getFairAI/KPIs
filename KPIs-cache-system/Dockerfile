FROM node:current-alpine3.20

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY src/ ./src
COPY package.json ./
COPY graphql.config.ts ./
COPY tsconfig.json ./
COPY build.ts ./

USER node

RUN npm install && npm run build

COPY --chown=node:node . .

EXPOSE 3005

CMD [ "node", "dist/index.js" ]