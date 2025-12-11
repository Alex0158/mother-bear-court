# Supabase 連接字符串獲取詳細指南

**項目**：熊媽媽法庭  
**更新時間**：2024年12月

---

## 🎯 目標

獲取 Supabase 數據庫連接字符串（`DATABASE_URL`），用於連接後端應用程序。

---

## 📋 完整步驟（附詳細說明）

### Step 1: 登錄 Supabase

1. **訪問 Supabase 控制台**
   - 網址：https://app.supabase.com/
   - 使用你的 GitHub/Google 賬號登錄

2. **如果還沒有項目，先創建項目**
   - 點擊「New Project」
   - 填寫項目信息：
     - **Name**: `Mother Bear Court`（或任意名稱）
     - **Database Password**: 設置強密碼（**請記住這個密碼！**）
     - **Region**: 選擇離你最近的區域（如：Southeast Asia (Singapore)）
   - 點擊「Create new project」
   - 等待項目創建完成（約 2 分鐘）

---

### Step 2: 找到連接字符串（方法一：推薦）

#### 方法 A：通過 Connect 按鈕（最簡單）

1. **進入項目主頁**
   - 登錄後，點擊你的項目（如：`Mother Bear Court`）

2. **點擊「Connect」按鈕**
   - 在項目頁面**左上角**或**頂部導航欄**，找到「**Connect**」按鈕
   - 點擊它

3. **選擇連接方式**
   - 在彈出的窗口中，你會看到多種連接方式
   - 選擇「**Direct connection**」（直接連接）或「**Connection Pooler**」（連接池）
   - **推薦使用「Connection Pooler」**（更穩定）

4. **查看連接字符串**
   - 在「Connection string」部分，你會看到類似這樣的字符串：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   - 或者（如果使用連接池）：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
   ```

5. **複製連接字符串**
   - 點擊連接字符串旁邊的「**Copy**」按鈕
   - **重要**：將 `[YOUR-PASSWORD]` 替換為你創建項目時設置的數據庫密碼

---

#### 方法 B：通過 Settings（設置）

如果找不到「Connect」按鈕，使用這個方法：

1. **進入項目設置**
   - 在項目頁面左側，點擊「**Settings**」（設置）圖標（齒輪圖標）
   - 或直接訪問：`https://app.supabase.com/project/[你的項目ID]/settings/database`

2. **選擇 Database（數據庫）**
   - 在設置菜單中，點擊「**Database**」

3. **找到連接字符串**
   - 向下滾動，找到「**Connection string**」或「**Connection info**」部分
   - 你會看到多個選項：
     - **URI**：完整的連接字符串
     - **Connection Pooler**：連接池字符串（推薦）
     - **Direct connection**：直接連接字符串

4. **選擇並複製**
   - 點擊「**URI**」標籤
   - 複製連接字符串
   - 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

5. **替換密碼**
   - 將 `[YOUR-PASSWORD]` 替換為你的數據庫密碼

---

### Step 3: 獲取或重置數據庫密碼

如果你忘記了數據庫密碼：

1. **進入設置**
   - Settings → Database

2. **找到 Database password**
   - 在「Database password」部分
   - 點擊「**Reset database password**」按鈕

3. **設置新密碼**
   - 輸入新密碼（**請記住！**）
   - 確認密碼
   - 點擊「**Reset password**」

4. **更新連接字符串**
   - 使用新密碼更新連接字符串中的 `[YOUR-PASSWORD]`

---

### Step 4: 構建完整的連接字符串

連接字符串格式：

```
postgresql://postgres:[你的密碼]@db.[項目ID].supabase.co:5432/postgres?sslmode=require
```

**示例**：
```
postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

**各部分說明**：
- `postgresql://` - 協議
- `postgres` - 用戶名（默認）
- `:MyPassword123` - 密碼（你設置的）
- `@db.abcdefghijklmnop.supabase.co` - 主機地址
- `:5432` - 端口（PostgreSQL 默認端口）
- `/postgres` - 數據庫名稱（默認）
- `?sslmode=require` - SSL 模式（必須）

---

### Step 5: 配置到項目中

1. **打開 `backend/.env` 文件**

2. **更新 `DATABASE_URL`**
   ```env
   DATABASE_URL=postgresql://postgres:你的密碼@db.xxxxx.supabase.co:5432/postgres?sslmode=require
   ```

3. **保存文件**

4. **驗證配置**
   ```bash
   cd backend
   ./scripts/validate-env.sh
   ```

---

## 🔍 找不到連接字符串的常見問題

### 問題 1：找不到「Connect」按鈕

**解決方案**：
- 使用「方法 B：通過 Settings」
- 直接訪問：`https://app.supabase.com/project/[你的項目ID]/settings/database`

### 問題 2：連接字符串中顯示 `[YOUR-PASSWORD]`

**解決方案**：
- 這是正常的，Supabase 不會顯示你的實際密碼
- 你需要手動將 `[YOUR-PASSWORD]` 替換為你創建項目時設置的密碼

### 問題 3：忘記數據庫密碼

**解決方案**：
- Settings → Database → Reset database password
- 設置新密碼後，更新連接字符串

### 問題 4：連接字符串格式不正確

**正確格式**：
```
postgresql://postgres:密碼@主機:端口/數據庫?sslmode=require
```

**檢查要點**：
- ✅ 以 `postgresql://` 開頭
- ✅ 包含 `postgres:` 用戶名
- ✅ 包含 `:密碼@` 密碼部分
- ✅ 包含 `@db.xxxxx.supabase.co` 主機
- ✅ 包含 `:5432` 端口
- ✅ 包含 `/postgres` 數據庫名
- ✅ 包含 `?sslmode=require` SSL 參數

---

## 📸 界面位置說明（文字描述）

### 主頁面布局

```
┌─────────────────────────────────────────┐
│  Supabase Logo    [Connect] [Settings] │  ← 頂部導航欄
├─────────────────────────────────────────┤
│                                         │
│  項目名稱: Mother Bear Court            │
│                                         │
│  [Connect] 按鈕 ← 點擊這裡              │
│                                         │
│  或                                     │
│                                         │
│  左側菜單:                              │
│  - Table Editor                         │
│  - SQL Editor                           │
│  - Authentication                       │
│  - Storage                              │
│  - Settings ⚙️ ← 點擊這裡              │
│                                         │
└─────────────────────────────────────────┘
```

### Settings 頁面布局

```
Settings
├── General
├── API
├── Database ← 點擊這裡
│   ├── Connection string
│   │   └── URI: postgresql://postgres:[YOUR-PASSWORD]@...
│   └── Database password
│       └── [Reset database password]
├── Auth
└── ...
```

---

## ✅ 驗證連接字符串

### 方法 1：使用驗證腳本

```bash
cd backend
./scripts/validate-env.sh
```

應該看到：
```
✅ DATABASE_URL - 已設置
✅ DATABASE_URL 格式正確
```

### 方法 2：測試數據庫連接

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate deploy
```

如果連接成功，會看到：
```
✅ 數據庫遷移成功
```

---

## 🆘 需要幫助？

如果仍然找不到連接字符串，請告訴我：

1. **你現在在哪個頁面？**
   - 項目主頁？
   - Settings 頁面？
   - 其他頁面？

2. **你看到了什麼？**
   - 截圖描述
   - 或告訴我頁面上的按鈕和選項

3. **你已經創建項目了嗎？**
   - 如果沒有，我們先創建項目
   - 如果已創建，項目名稱是什麼？

我可以根據你的具體情況提供更詳細的指導！

---

## 📝 快速檢查清單

- [ ] 已登錄 Supabase
- [ ] 已創建項目
- [ ] 已記住數據庫密碼
- [ ] 已找到連接字符串
- [ ] 已替換 `[YOUR-PASSWORD]` 為實際密碼
- [ ] 已添加 `?sslmode=require` 參數
- [ ] 已更新 `backend/.env` 文件
- [ ] 已驗證連接字符串格式

---

**最後更新**：2024年12月

