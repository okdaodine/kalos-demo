FROM node:16.13.2 AS base

ENV NODE_ENV=production \
  APP_PATH=/app

WORKDIR $APP_PATH

FROM base AS install

COPY package.json ./

RUN npm install

FROM base

COPY --from=install $APP_PATH/node_modules ./node_modules

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
