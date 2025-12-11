# 使用Node.js官方鏡像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安裝依賴
RUN npm ci --only=production

# 生成Prisma Client
RUN npx prisma generate

# 複製源代碼
COPY . .

# 構建TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["npm", "start"]

