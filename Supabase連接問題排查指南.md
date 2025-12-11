# Supabase 連接問題排查指南

## 問題描述

錯誤信息：`P1001: Can't reach database server at db.pfxrglsjgmpfyiwyxzou.supabase.co:5432`

這表示 Railway 部署的應用無法連接到 Supabase 數據庫。

## 可能原因和解決方案

### 1. Supabase 項目狀態檢查

**檢查項目是否暫停：**

1. 登錄 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的項目
3. 檢查項目狀態：
   - ✅ **Active（活動）** - 正常
   - ⚠️ **Paused（暫停）** - 需要恢復項目
   - ❌ **Deleted（已刪除）** - 需要創建新項目

**如果項目暫停：**
- 點擊 "Restore" 或 "Resume" 恢復項目
- 免費版項目在 7 天不活動後會自動暫停

### 2. IP 白名單設置

**Supabase 默認允許所有 IP 連接，但需要確認：**

1. 進入 Supabase Dashboard
2. 導航到 **Settings** > **Database**
3. 檢查 **Connection Pooling** 設置：
   - **Pooling Mode**: 應設置為 "Transaction" 或 "Session"
   - **IP Restrictions**: 確認沒有設置 IP 白名單限制

**如果使用連接池：**
- Supabase 提供兩種連接方式：
  - **Direct Connection**（直接連接）：`postgresql://...`
  - **Connection Pooling**（連接池）：`postgresql://...?pgbouncer=true`

**建議：**
- 對於 Railway 部署，使用 **Direct Connection**（直接連接）
- 連接池 URL 格式：`postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true`

### 3. DATABASE_URL 配置檢查

**當前配置格式：**
```
postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```

**檢查項目：**

1. **密碼 URL 編碼**
   - 原始密碼：`CJ291800@`
   - URL 編碼後：`CJ291800%40` ✅
   - `@` 符號必須編碼為 `%40`

2. **SSL 模式**
   - `?sslmode=require` ✅ 正確
   - Supabase 要求 SSL 連接

3. **端口**
   - 直接連接：`5432` ✅
   - 連接池：`6543`

4. **主機名**
   - 格式：`db.[PROJECT_REF].supabase.co`
   - 當前：`db.pfxrglsjgmpfyiwyxzou.supabase.co` ✅

### 4. Railway 環境變量配置

**在 Railway Dashboard 中檢查：**

1. 進入 Railway 項目
2. 選擇你的服務（backend）
3. 進入 **Variables** 標籤
4. 確認 `DATABASE_URL` 的值：

**正確格式示例：**
```
postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```

**常見錯誤：**
- ❌ `postgresql://postgres:CJ291800@...` （密碼未編碼）
- ❌ `postgres://...` （缺少 `ql`）
- ❌ 缺少 `?sslmode=require`

### 5. 網絡連接測試

**在 Railway 中測試連接：**

1. 進入 Railway Dashboard
2. 選擇你的服務
3. 點擊 **Deployments** > 選擇最新部署
4. 點擊 **View Logs** 查看詳細日誌

**日誌中應該看到：**
```
info: 數據庫連接信息 {
  hostname: 'db.pfxrglsjgmpfyiwyxzou.supabase.co',
  port: '5432',
  database: '/postgres',
  username: 'postgres',
  hasPassword: true
}
```

### 6. 使用 Supabase Connection Pooling（可選）

**如果直接連接失敗，嘗試使用連接池：**

1. 在 Supabase Dashboard 中：
   - **Settings** > **Database** > **Connection Pooling**
   - 啟用 Connection Pooling

2. 獲取連接池 URL：
   - 格式：`postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - 或在 Dashboard 中複製 **Connection String (Pooled)**

3. 更新 Railway 環境變量：
   - 將 `DATABASE_URL` 更新為連接池 URL
   - 注意：端口改為 `6543`，並添加 `?pgbouncer=true`

**連接池 URL 示例：**
```
postgresql://postgres.pfxrglsjgmpfyiwyxzou:CJ291800%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### 7. Supabase 配額檢查

**免費版限制：**

- **數據庫大小**：500 MB
- **帶寬**：5 GB/月
- **連接數**：有限制（但通常足夠）

**檢查配額：**
1. Supabase Dashboard > **Settings** > **Usage**
2. 確認沒有超限

### 8. 驗證連接字符串

**在本地測試連接（如果可能）：**

```bash
# 使用 psql 測試（如果已安裝）
psql "postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require"

# 或使用 Prisma 測試
cd backend
npx prisma db pull
```

**注意：** 本地可能無法連接（IP 限制），但可以驗證 URL 格式。

## 快速修復步驟

### 步驟 1：檢查 Supabase 項目狀態

1. 登錄 [Supabase Dashboard](https://app.supabase.com)
2. 確認項目狀態為 **Active**

### 步驟 2：驗證 DATABASE_URL

在 Railway Dashboard 中檢查 `DATABASE_URL`：

**正確格式：**
```
postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```

**如果密碼未編碼：**
- 原始：`CJ291800@`
- 編碼後：`CJ291800%40`

### 步驟 3：嘗試連接池（如果直接連接失敗）

1. 在 Supabase Dashboard 獲取連接池 URL
2. 更新 Railway 的 `DATABASE_URL`
3. 重新部署

### 步驟 4：檢查 Railway 日誌

查看 Railway 部署日誌，確認：
- ✅ 沒有 OpenSSL 錯誤
- ✅ 數據庫連接信息正確顯示
- ✅ 錯誤信息是否提供更多線索

## 診斷工具

### 在 Railway 中查看連接診斷

應用啟動時會輸出詳細的連接信息：

```
info: 數據庫連接信息 {
  hostname: 'db.pfxrglsjgmpfyiwyxzou.supabase.co',
  port: '5432',
  database: '/postgres',
  username: 'postgres',
  hasPassword: true
}
```

### 錯誤代碼參考

- **P1001**: 無法到達數據庫服務器
  - 檢查網絡連接、IP 白名單、項目狀態
  
- **P1000**: 認證失敗
  - 檢查用戶名、密碼、URL 編碼

- **P1017**: 服務器關閉連接
  - 檢查連接池設置、配額限制

## 推薦配置

### 生產環境推薦

**使用直接連接（當前配置）：**
```
postgresql://postgres:[ENCODED_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

**優點：**
- 簡單直接
- 無需額外配置

**缺點：**
- 連接數有限制

### 高並發場景推薦

**使用連接池：**
```
postgresql://postgres.[PROJECT_REF]:[ENCODED_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

**優點：**
- 更好的連接管理
- 適合高並發

**缺點：**
- 需要額外配置
- 某些 Prisma 功能可能受限

## 聯繫支持

如果以上步驟都無法解決問題：

1. **Supabase 支持**
   - 在 Supabase Dashboard 提交工單
   - 或查看 [Supabase 文檔](https://supabase.com/docs)

2. **Railway 支持**
   - 在 Railway Dashboard 提交工單
   - 或查看 [Railway 文檔](https://docs.railway.app)

## 相關文檔

- `Railway部署OpenSSL問題修復.md` - OpenSSL 問題修復
- `Railway環境變量配置指南.md` - 環境變量配置
- `Railway數據庫連接問題修復.md` - 數據庫連接問題

