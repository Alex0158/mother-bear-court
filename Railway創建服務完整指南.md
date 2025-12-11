# Railway 創建服務完整指南

**項目**：熊媽媽法庭  
**目的**：從零開始在 Railway 創建後端服務並部署

---

## 🎯 第一步：確認當前狀態

### 請先告訴我：

1. **你已經註冊 Railway 帳號了嗎？**
   - ✅ 已註冊
   - ❌ 還沒註冊

2. **你現在在 Railway Dashboard 看到什麼？**
   - 看到項目列表（但沒有項目）？
   - 看到一個項目（但沒有服務）？
   - 看到其他內容？

---

## 📋 完整步驟（從零開始）

### 步驟 1：登錄 Railway

1. **訪問 Railway Dashboard**
   - 網址：https://railway.app/dashboard
   - 使用 GitHub 帳號登錄（推薦）

2. **確認登錄成功**
   - 你應該看到 Railway Dashboard 主頁面

---

### 步驟 2：創建新項目（如果還沒有項目）

#### 方法 A：從 GitHub 倉庫創建（推薦）

1. **點擊 "New Project" 按鈕**
   - 在 Dashboard 頂部或左側，找到 **"New Project"** 或 **"+"** 按鈕
   - 點擊它

2. **選擇 "Deploy from GitHub repo"**
   - 你會看到幾個選項：
     - Deploy from GitHub repo（從 GitHub 倉庫部署）⭐ 選這個
     - Empty Project（空項目）
     - Template（模板）

3. **連接 GitHub 倉庫**
   - 如果還沒連接 GitHub，Railway 會要求你授權
   - 授權後，選擇你的倉庫：`Alex0158/mother-bear-court`

4. **選擇要部署的服務**
   - Railway 會自動檢測你的項目結構
   - 它可能會問你：要部署哪個目錄？
   - **選擇 `backend` 目錄** ⭐

5. **Railway 會自動創建服務**
   - 服務名稱可能是 `backend` 或 `mother-bear-court-backend`
   - Railway 會自動開始構建和部署

#### 方法 B：創建空項目，然後添加服務

1. **點擊 "New Project"**
2. **選擇 "Empty Project"**
3. **給項目命名**（例如：`mother-bear-court`）
4. **點擊 "Add Service"** 或 **"+"** 按鈕
5. **選擇 "GitHub Repo"**
6. **選擇你的倉庫**：`Alex0158/mother-bear-court`
7. **選擇 `backend` 目錄**

---

### 步驟 3：配置服務設置

創建服務後，Railway 會自動檢測並開始構建。但你需要配置一些設置：

#### 3.1 設置根目錄

1. **進入服務設置**
   - 點擊你剛創建的服務
   - 點擊頂部的 **"Settings"** 標籤

2. **設置 Root Directory**
   - 在 Settings 頁面，找到 **"Root Directory"** 或 **"Working Directory"**
   - 設置為：`backend`
   - 點擊 **"Save"**

#### 3.2 設置構建命令（如果需要）

Railway 通常會自動檢測，但如果需要手動設置：

1. **在 Settings 頁面**
2. **找到 "Build Command"**
3. **設置為**：`npm ci && npm run build`
4. **找到 "Start Command"**
5. **設置為**：`npm start`

---

### 步驟 4：配置環境變量

**重要**：在部署前配置環境變量！

1. **進入服務的 Variables 頁面**
   - 點擊服務
   - 點擊頂部的 **"Variables"** 標籤

2. **添加必需的環境變量**

點擊 **"+ New Variable"** 按鈕，添加以下變量：

| 變量名 | 值 | 說明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:CJ291800%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` | Supabase 連接字符串（已 URL 編碼） |
| `JWT_SECRET` | `eF1/rfA9pR7tvAV5sHkHdGn6bZ6iOcknJaDycyjf5S0=` | JWT 密鑰 |
| `OPENAI_API_KEY` | `sk-xxxxx`（從 OpenAI 獲取） | OpenAI API 密鑰 |
| `NODE_ENV` | `production` | 環境模式 |
| `PORT` | `3000` | 端口（Railway 會自動設置，但可以手動設置） |

3. **保存環境變量**
   - 每個變量添加後，點擊 **"Add"** 或 **"Save"**
   - Railway 會自動保存並觸發重新部署

---

### 步驟 5：等待部署完成

1. **查看部署狀態**
   - 點擊 **"Deployments"** 標籤
   - 查看最新的部署狀態
   - 等待狀態變為 **"Active"** 或 **"Success"**

2. **查看構建日誌**
   - 點擊最新的部署
   - 查看 **"Logs"** 標籤
   - 確認沒有錯誤

---

### 步驟 6：獲取服務 URL

部署成功後，獲取服務的公共 URL：

1. **進入 Settings → Networking**
   - 點擊服務
   - 點擊 **"Settings"** 標籤
   - 向下滾動到 **"Networking"** 區塊

2. **生成 Public Domain**
   - 如果沒有看到 Public Domain，點擊 **"Generate Domain"** 按鈕
   - Railway 會自動生成一個 URL（格式：`https://xxx-production.up.railway.app`）

3. **複製 URL**
   - 複製完整的 URL
   - 這就是你的後端 URL！

---

## 🎯 快速檢查清單

### 創建服務前
- [ ] 已註冊 Railway 帳號
- [ ] 已登錄 Railway Dashboard
- [ ] GitHub 倉庫已準備好（`Alex0158/mother-bear-court`）

### 創建服務時
- [ ] 已創建新項目或選擇現有項目
- [ ] 已從 GitHub 倉庫部署
- [ ] 已選擇 `backend` 目錄
- [ ] 已設置 Root Directory 為 `backend`

### 配置環境變量
- [ ] 已添加 `DATABASE_URL`
- [ ] 已添加 `JWT_SECRET`
- [ ] 已添加 `OPENAI_API_KEY`
- [ ] 已添加 `NODE_ENV=production`

### 部署後
- [ ] 部署狀態為 "Active" 或 "Success"
- [ ] 已生成 Public Domain
- [ ] 已複製後端 URL
- [ ] 已測試健康檢查端點（`/health`）

---

## 🖼️ Railway Dashboard 界面說明

### Dashboard 主頁面結構

```
Railway Dashboard
├── 左側邊欄
│   ├── Projects（項目列表）
│   │   └── 你的項目名稱
│   │       └── Services（服務列表）⭐ 這裡應該有你的服務
│   └── Settings（帳號設置）
│
└── 主內容區
    ├── 項目概覽（如果選擇了項目）
    └── 服務列表（如果選擇了服務）
```

### 服務頁面結構

```
服務頁面（backend）
├── 頂部標籤欄
│   ├── Overview（概覽）
│   ├── Deployments（部署）⭐ 查看部署狀態
│   ├── Logs（日誌）⭐ 查看實時日誌
│   ├── Metrics（指標）
│   ├── Variables（環境變量）⭐ 配置環境變量
│   └── Settings（設置）⭐ 配置服務設置
│
└── 主內容區
    └── 根據選中的標籤顯示不同內容
```

---

## 🚨 常見問題

### Q1: 我點擊 "New Project" 後沒有看到 "Deploy from GitHub repo" 選項

**A**: 
- 確認你已經連接了 GitHub 帳號
- 如果沒有，點擊 "Connect GitHub" 或 "Authorize GitHub"
- 授權後再試

### Q2: Railway 沒有自動檢測到 `backend` 目錄

**A**:
1. 創建服務後，進入 Settings
2. 設置 Root Directory 為 `backend`
3. 保存後，Railway 會重新構建

### Q3: 部署失敗，提示找不到 `package.json`

**A**:
- 確認 Root Directory 設置為 `backend`
- 確認 `backend` 目錄中有 `package.json` 文件
- 檢查 GitHub 倉庫中 `backend/package.json` 是否存在

### Q4: 構建成功但服務無法啟動

**A**:
- 檢查環境變量是否正確配置
- 查看 Logs 標籤中的錯誤信息
- 確認 `DATABASE_URL` 是否正確

### Q5: 我找不到服務在哪裡

**A**:
1. 確認你在正確的項目中
2. 在左側邊欄，點擊項目名稱
3. 展開後應該看到 Services 列表
4. 如果沒有服務，需要先創建服務（參考步驟 2）

---

## 📞 需要幫助？

如果按照以上步驟仍然遇到問題，請告訴我：

1. **你現在在 Railway Dashboard 的哪個頁面？**
   - 截圖或描述你看到的內容

2. **你已經完成了哪些步驟？**
   - 已註冊帳號？
   - 已創建項目？
   - 已創建服務？

3. **你遇到了什麼具體問題？**
   - 找不到某個按鈕？
   - 部署失敗？
   - 其他問題？

---

## ✅ 完成後的下一步

服務創建並部署成功後：

1. **記錄後端 URL**
   - 格式：`https://xxx-production.up.railway.app`
   - 完整 API URL：`https://xxx-production.up.railway.app/api/v1`

2. **在 Vercel 配置前端環境變量**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://你的RailwayURL/api/v1`

3. **測試連接**
   - 訪問：`https://你的RailwayURL/health`
   - 應該返回 JSON 響應

---

**最後更新**：2024年12月

