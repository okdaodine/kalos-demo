# 1. 构建基础镜像
FROM alpine:3.15 AS base
#纯净版镜像

ENV NODE_ENV=production \
  APP_PATH=/app

WORKDIR $APP_PATH

# 使用apk命令安装 nodejs
RUN apk add --no-cache --update nodejs=16.13.1-r0

# 2. 基于基础镜像安装项目依赖
FROM base AS install

COPY package.json ./

RUN npm install

# 3. 基于基础镜像进行最终构建
FROM base

# 拷贝 上面生成的 node_modules 文件夹复制到最终的工作目录下
COPY --from=install $APP_PATH/node_modules ./node_modules

# 拷贝当前目录下的所有文件(除了.dockerignore里排除的)，都拷贝到工作目录下
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
