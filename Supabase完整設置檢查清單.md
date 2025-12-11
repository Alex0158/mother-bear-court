# Supabase 完整設置檢查清單

## 📋 必須完成的設置步驟

### ✅ 步驟 1: 創建 Supabase 項目

1. 登錄 [Supabase Dashboard](https://app.supabase.com)
2. 創建新項目或選擇現有項目
3. **項目名稱**: `mother-bear-court`（或你選擇的名稱）
4. **數據庫密碼**: 記住密碼（用於 DATABASE_URL）
5. **區域**: 選擇離你最近的區域（如 `Southeast Asia (Singapore)`）

**檢查項目：**
- [ ] 項目已創建
- [ ] 項目狀態為 **Active**（不是 Paused）
- [ ] 記下了數據庫密碼

---

### ✅ 步驟 2: 獲取連接字符串

1. 在 Supabase Dashboard 中，進入你的項目
2. 導航到 **Settings** > **Database**
3. 找到 **Connection string** 部分
4. 選擇 **URI** 格式
5. 複製連接字符串

**連接字符串格式：**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**重要：**
- 將 `[YOUR-PASSWORD]` 替換為你的實際密碼
- 如果密碼包含特殊字符（如 `@`），必須進行 URL 編碼：
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`

**示例：**
- 原始密碼：`CJ291800@`
- URL 編碼後：`CJ291800%40`
- 完整連接字符串：
```
postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
```

**檢查項目：**
- [ ] 已獲取連接字符串
- [ ] 密碼已正確 URL 編碼
- [ ] 已添加 `?sslmode=require` 參數

---

### ✅ 步驟 3: 檢查項目狀態（**最重要**）

**這是導致連接失敗的最常見原因！**

1. 在 Supabase Dashboard 中，進入你的項目
2. 檢查項目狀態：

**狀態說明：**
- ✅ **Active** - 項目正常運行，可以連接
- ⚠️ **Paused** - 項目已暫停，**無法連接**
- ❌ **Deleted** - 項目已刪除

**如果項目暫停：**
1. 點擊項目卡片上的 **"Restore"** 或 **"Resume"** 按鈕
2. 等待項目恢復（通常需要 1-2 分鐘）
3. 確認狀態變為 **Active**

**免費版項目暫停規則：**
- 項目在 **7 天不活動** 後會自動暫停
- 暫停後需要手動恢復
- 恢復後數據不會丟失

**檢查項目：**
- [ ] 項目狀態為 **Active**
- [ ] 如果暫停，已點擊恢復

---

### ✅ 步驟 4: 檢查 IP 白名單設置

**Supabase 默認允許所有 IP 連接，但需要確認：**

1. 在 Supabase Dashboard 中
2. 導航到 **Settings** > **Database**
3. 找到 **Connection Pooling** 部分
4. 檢查 **IP Restrictions** 設置

**推薦設置：**
- **IP Restrictions**: 留空或設置為 `0.0.0.0/0`（允許所有 IP）
- 如果設置了特定 IP，需要添加 Railway 的 IP 範圍

**注意：**
- Railway 使用動態 IP，無法預先設置
- 建議允許所有 IP 或留空

**檢查項目：**
- [ ] IP 白名單未設置限制
- [ ] 或已設置為允許所有 IP

---

### ✅ 步驟 5: 數據庫表結構創建

**應用會在啟動時自動創建表，但需要先能連接數據庫。**

**自動創建（推薦）：**
- Railway 部署時，應用會自動運行 `prisma db push`
- 這會根據 `prisma/schema.prisma` 創建所有表

**手動創建（如果自動失敗）：**

1. 在 Supabase Dashboard 中
2. 導航到 **SQL Editor**
3. 運行以下 SQL（如果需要手動創建）：

```sql
-- 注意：Prisma 會自動創建表，通常不需要手動執行
-- 只有在自動創建失敗時才需要手動執行
```

**檢查項目：**
- [ ] 應用已成功連接數據庫
- [ ] 表結構已創建（通過應用自動創建或手動創建）

---

### ✅ 步驟 6: 檢查數據庫擴展（Extensions）

**Prisma 使用的功能檢查：**

1. 在 Supabase Dashboard 中
2. 導航到 **Database** > **Extensions**
3. 確認以下擴展已啟用（如果需要）：

**通常不需要額外擴展：**
- Prisma 使用 `@default(uuid())`，Supabase 默認支持
- Prisma 使用 `@default(now())`，PostgreSQL 默認支持

**可選擴展（如果將來需要）：**
- `pgcrypto` - 加密功能
- `uuid-ossp` - UUID 生成（但 Supabase 已有內建支持）

**檢查項目：**
- [ ] 確認不需要額外擴展（Prisma 使用標準 PostgreSQL 功能）

---

### ✅ 步驟 7: 配置 Railway 環境變量

**在 Railway Dashboard 中設置：**

1. 進入 Railway 項目
2. 選擇 backend 服務
3. 進入 **Variables** 標籤
4. 添加或更新以下環境變量：

**必需環境變量：**

```env
DATABASE_URL=postgresql://postgres:CJ291800%40@db.pfxrglsjgmpfyiwyxzou.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=你的JWT密鑰（至少32字符）
OPENAI_API_KEY=你的OpenAI API密鑰
```

**檢查項目：**
- [ ] `DATABASE_URL` 已正確設置
- [ ] 密碼已 URL 編碼
- [ ] 包含 `?sslmode=require`
- [ ] 其他必需環境變量已設置

---

### ✅ 步驟 8: 驗證連接（可選）

**在 Supabase Dashboard 中測試連接：**

1. 導航到 **Settings** > **Database**
2. 找到 **Connection string** 部分
3. 點擊 **Test connection**（如果有此選項）

**或使用 Supabase SQL Editor：**

1. 導航到 **SQL Editor**
2. 運行簡單查詢：
```sql
SELECT version();
```

**檢查項目：**
- [ ] 可以執行 SQL 查詢
- [ ] 數據庫響應正常

---

## 🔍 常見問題排查

### 問題 1: 無法連接數據庫（P1001 錯誤）

**可能原因：**
1. ❌ 項目已暫停（最常見）
2. ❌ IP 白名單限制
3. ❌ DATABASE_URL 配置錯誤
4. ❌ 密碼未正確 URL 編碼

**解決方案：**
1. 檢查項目狀態，確保為 **Active**
2. 檢查 IP 白名單設置
3. 驗證 DATABASE_URL 格式
4. 確認密碼已正確編碼

---

### 問題 2: 認證失敗（P1000 錯誤）

**可能原因：**
1. ❌ 密碼錯誤
2. ❌ 密碼未正確 URL 編碼
3. ❌ 用戶名錯誤

**解決方案：**
1. 在 Supabase Dashboard 中重置數據庫密碼
2. 更新 DATABASE_URL 中的密碼
3. 確認密碼已正確 URL 編碼

---

### 問題 3: 表結構未創建

**可能原因：**
1. ❌ 數據庫連接失敗
2. ❌ Prisma 遷移未執行
3. ❌ 權限不足

**解決方案：**
1. 先解決連接問題
2. 確認應用可以連接數據庫
3. 檢查 Railway 日誌，確認遷移已執行

---

## 📝 完整檢查清單

### Supabase 設置

- [ ] 項目已創建
- [ ] 項目狀態為 **Active**
- [ ] 已獲取連接字符串
- [ ] 密碼已正確 URL 編碼
- [ ] IP 白名單未設置限制（或允許所有 IP）
- [ ] 數據庫擴展已檢查（通常不需要）

### Railway 設置

- [ ] `DATABASE_URL` 環境變量已設置
- [ ] 連接字符串格式正確
- [ ] 包含 `?sslmode=require`
- [ ] 其他必需環境變量已設置

### 驗證

- [ ] Railway 部署成功
- [ ] 應用可以連接數據庫
- [ ] 表結構已創建
- [ ] 健康檢查端點返回正常

---

## 🚨 最常見的遺漏

### 1. 項目暫停（**最常見**）

**症狀：**
- 無法連接數據庫
- 錯誤：`P1001: Can't reach database server`

**解決：**
- 在 Supabase Dashboard 中恢復項目

### 2. 密碼未 URL 編碼

**症狀：**
- 認證失敗
- 錯誤：`P1000: Authentication failed`

**解決：**
- 將密碼中的特殊字符進行 URL 編碼
- `@` → `%40`

### 3. 缺少 SSL 模式

**症狀：**
- 連接失敗
- SSL 相關錯誤

**解決：**
- 在 DATABASE_URL 中添加 `?sslmode=require`

---

## 📚 相關文檔

- `Supabase連接問題排查指南.md` - 詳細排查步驟
- `Railway數據庫連接問題深度分析.md` - 問題分析
- `Railway環境變量配置指南.md` - 環境變量配置

---

## ✅ 快速檢查命令

**在 Railway 日誌中應該看到：**

```
✅ info: 數據庫連接信息 {...}
✅ info: 數據庫遷移完成
✅ info: 數據庫連接成功並驗證通過
```

**如果看到錯誤：**
- 參考上面的常見問題排查
- 檢查 Supabase 項目狀態
- 驗證 DATABASE_URL 配置

