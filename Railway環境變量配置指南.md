# Railway 環境變量配置指南

**項目**：熊媽媽法庭  
**錯誤時間**：2024年12月  
**錯誤類型**：缺少必需的環境變量

---

## 🔍 錯誤分析

### 錯誤信息

```
Error: 缺少必需的環境變量: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
```

### 問題原因

應用已經成功構建並啟動，但在運行時缺少必需的环境变量。這些環境變量需要在 Railway Dashboard 中配置。

---

## ✅ 解決方案：在 Railway 配置環境變量

### 步驟 1：進入 Railway Dashboard

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 選擇你的項目（mother-bear-court-backend）
3. 點擊服務（Service）

### 步驟 2：添加環境變量

1. 在服務頁面，點擊 **「Variables」** 標籤
2. 點擊 **「+ New Variable」** 按鈕
3. 添加以下環境變量：

#### 必需的環境變量

| 變量名 | 值 | 說明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:CJ291800@@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require` | Supabase 數據庫連接字符串 |
| `JWT_SECRET` | `eF1/rfA9pR7tvAV5sHkHdGn6bZ6iOcknJaDycyjf5S0=` | JWT 密鑰（從 backend/.env 複製） |
| `OPENAI_API_KEY` | `sk-xxxxx`（從 OpenAI 獲取） | OpenAI API 密鑰 |

#### 可選的環境變量（有默認值）

| 變量名 | 值 | 說明 |
|--------|-----|------|
| `PORT` | `3000` | 服務端口（Railway 會自動設置） |
| `NODE_ENV` | `production` | 環境模式 |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | OpenAI 模型 |
| `OPENAI_MAX_TOKENS` | `2000` | 最大 token 數 |
| `OPENAI_DAILY_LIMIT` | `1000` | 每日限制 |
| `JWT_EXPIRES_IN` | `7d` | JWT 過期時間 |
| `FRONTEND_URL` | `你的 Vercel 前端 URL` | 前端 URL（部署後設置） |
| `ALLOWED_ORIGINS` | `你的 Vercel 前端 URL,http://localhost:5173` | 允許的來源（部署後設置） |

---

## 📋 詳細配置步驟

### 1. 配置 DATABASE_URL

```
變量名：DATABASE_URL
值：postgresql://postgres:CJ291800@@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```

### 2. 配置 JWT_SECRET

```
變量名：JWT_SECRET
值：eF1/rfA9pR7tvAV5sHkHdGn6bZ6iOcknJaDycyjf5S0=
```

### 3. 配置 OPENAI_API_KEY

```
變量名：OPENAI_API_KEY
值：sk-xxxxx（從 OpenAI 獲取）
```

---

## 🎯 配置完成後的驗證

### 自動重新部署

配置環境變量後，Railway 會自動重新部署服務。你應該會看到：

1. **構建成功**：Docker 構建完成
2. **啟動成功**：應用正常啟動
3. **日誌正常**：沒有環境變量錯誤

### 檢查日誌

在 Railway Dashboard → Deployments → 最新的部署 → Logs，應該看到：

```
✅ 數據庫連接成功
✅ 服務器運行在端口 3000
```

而不是：

```
❌ Error: 缺少必需的環境變量
```

---

## 🚨 常見問題

### 問題 1：環境變量設置後仍然報錯

**解決方案**：
- 確認變量名完全正確（大小寫敏感）
- 確認值沒有多餘的空格
- 等待 Railway 重新部署完成（通常需要 1-2 分鐘）

### 問題 2：DATABASE_URL 連接失敗

**解決方案**：
- 確認 Supabase 數據庫正在運行
- 確認連接字符串格式正確
- 檢查 Supabase Dashboard 中的數據庫狀態

### 問題 3：OPENAI_API_KEY 無效

**解決方案**：
- 確認 API Key 沒有過期
- 確認 API Key 有足夠的額度
- 檢查 OpenAI Dashboard 中的 API 狀態

---

## 📊 環境變量清單

### 必須配置（3 個）

- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `OPENAI_API_KEY`

### 建議配置（部署後）

- `FRONTEND_URL` - 前端部署後設置
- `ALLOWED_ORIGINS` - 前端部署後設置

### 可選配置（有默認值）

- `PORT` - Railway 自動設置
- `NODE_ENV` - 默認為 `production`
- `OPENAI_MODEL` - 默認為 `gpt-3.5-turbo`
- `OPENAI_MAX_TOKENS` - 默認為 `2000`
- `OPENAI_DAILY_LIMIT` - 默認為 `1000`
- `JWT_EXPIRES_IN` - 默認為 `7d`

---

## ✅ 下一步

1. **配置環境變量**：在 Railway Dashboard 中添加上述 3 個必需的環境變量
2. **等待重新部署**：Railway 會自動重新部署
3. **驗證部署**：檢查日誌確認應用正常啟動
4. **運行數據庫遷移**：部署成功後運行 `npm run prisma:migrate deploy`

---

**最後更新**：2024年12月

