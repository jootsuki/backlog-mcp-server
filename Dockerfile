# ベースイメージ
FROM node:18-alpine as base

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 開発環境
FROM base as development
RUN npm install
RUN npm install -g ts-node-dev
COPY . .
CMD ["npm", "run", "dev"]

# ビルド環境
FROM base as build
RUN npm install
COPY . .
RUN npm run build
RUN chmod +x build/index.js

# 本番環境
FROM node:18-alpine as production
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/build ./build
RUN npm install --production
CMD ["node", "build/index.js"]