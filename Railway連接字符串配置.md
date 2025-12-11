# Railway 連接字符串配置

## ✅ 獲取到的連接池 URL

**原始格式**:
```
postgresql://postgres.pfxrglsjgmpfyiwyxzou:[YOUR-PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres
```

## 🔧 完整配置步驟

### 步驟 1: 處理密碼 URL 編碼

**你的密碼**: `CJ291800@`  
**URL 編碼後**: `CJ291800%40`

### 步驟 2: 構建完整連接字符串

**完整連接字符串**:
```
postgresql://postgres.pfxrglsjgmpfyiwyxzou:CJ291800%40@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**關鍵點**:
- ✅ 用戶名: `postgres.pfxrglsjgmpfyiwyxzou`
- ✅ 密碼: `CJ291800%40` (URL 編碼)
- ✅ 主機: `aws-1-eu-west-2.pooler.supabase.com`
- ✅ 端口: `5432` (Session Pooler 使用此端口)
- ✅ 數據庫: `postgres`
- ✅ 參數: `?pgbouncer=true&sslmode=require`

### 步驟 3: 更新 Railway 環境變量

1. 登錄 [Railway Dashboard](https://railway.app)
2. 選擇你的項目
3. 選擇 **backend** 服務
4. 點擊 **Variables** 標籤
5. 找到 `DATABASE_URL` 變量
6. 點擊 **Edit** (✏️)
7. **刪除舊值**，貼上新的連接字符串:
   ```
   postgresql://postgres.pfxrglsjgmpfyiwyxzou:CJ291800%40@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
   ```
8. 點擊 **Save** 或 **Update**

### 步驟 4: 等待重新部署

- Railway 會自動檢測環境變量變化
- 自動觸發重新部署（通常 1-2 分鐘）

### 步驟 5: 檢查部署日誌

在 Railway Dashboard 中查看最新部署的日誌，應該看到：

```
✅ info: 數據庫連接信息 {
  hostname: 'aws-1-eu-west-2.pooler.supabase.com',
  port: '5432',
  database: '/postgres',
  username: 'postgres.pfxrglsjgmpfyiwyxzou',
  hasPassword: true
}
✅ info: 數據庫連接成功並驗證通過
✅ info: 服務器運行在端口 8080
```

---

## 📋 連接字符串對比

### 直接連接（IPv6，不兼容 Railway）
```
postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```
- ❌ 主機: `db.pfxrglsjgmpfyiwyxzou.supabase.co`
- ❌ 端口: `5432`
- ❌ 用戶名: `postgres`
- ❌ **不兼容 IPv4**

### Session Pooler（IPv4 兼容，推薦）
```
postgresql://postgres.pfxrglsjgmpfyiwyxzou:CJ291800%40@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```
- ✅ 主機: `aws-1-eu-west-2.pooler.supabase.com`
- ✅ 端口: `5432`
- ✅ 用戶名: `postgres.pfxrglsjgmpfyiwyxzou`
- ✅ **兼容 IPv4**

---

## ⚠️ 重要注意事項

### 1. 密碼 URL 編碼

**必須編碼**:
- `@` → `%40`
- 其他特殊字符也需要編碼

### 2. 連接參數

**必須包含**:
- `?pgbouncer=true` - 啟用連接池
- `&sslmode=require` - 要求 SSL 連接

### 3. Session Pooler vs Transaction Pooler

**Session Pooler** (當前使用):
- 端口: `5432`
- 適合需要會話級功能的應用
- 支持更多 PostgreSQL 功能

**Transaction Pooler**:
- 端口: `6543`
- 更輕量級
- 適合簡單的 CRUD 操作

---

## 🎯 預期結果

使用 Session Pooler 後：

1. ✅ Railway 可以成功連接到 Supabase
2. ✅ 數據庫連接成功
3. ✅ 應用正常運行
4. ✅ 所有 API 端點正常工作

---

## 🔍 驗證連接

### 在 Railway 日誌中檢查

部署成功後，應該看到：

```
info: 數據庫連接信息 {
  hostname: 'aws-1-eu-west-2.pooler.supabase.com',
  port: '5432',
  ...
}
info: 數據庫連接成功並驗證通過
```

### 測試 API

```bash
# 健康檢查
curl https://your-railway-url.railway.app/health

# 數據庫健康檢查
curl https://your-railway-url.railway.app/health/ready
```

---

## ✅ 完成檢查清單

- [x] 獲取 Session Pooler 連接字符串
- [ ] 密碼已 URL 編碼（`CJ291800%40`）
- [ ] 已添加 `?pgbouncer=true&sslmode=require`
- [ ] 已更新 Railway `DATABASE_URL`
- [ ] Railway 已重新部署
- [ ] 檢查部署日誌確認連接成功

---

## 📚 相關文檔

- `立即修復Railway連接問題.md` - 快速操作指南
- `Railway連接Supabase網絡問題解決方案.md` - 詳細解決方案

