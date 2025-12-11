# 使用Node.js官方鏡像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安裝所有依賴（包括 devDependencies，用於構建）
RUN npm ci

# 生成Prisma Client
RUN npx prisma generate

# 複製源代碼
COPY . .

# 構建TypeScript
RUN npm run build

# 清理 devDependencies（可選，減小鏡像大小）
# 注意：保留 prisma 以便運行遷移
RUN npm prune --production --no-save prisma @prisma/client

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]

