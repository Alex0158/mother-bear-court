# GitHub 推送和 Vercel 部署指南

**項目**：熊媽媽法庭  
**更新時間**：2024年12月

---

## 🎯 概述

**是的，Vercel 需要項目在 GitHub 上才能部署。**

當前狀態：
- ❌ 項目尚未初始化 Git
- ❌ 代碼尚未推送到 GitHub
- ✅ `.gitignore` 已配置（會保護敏感文件）

---

## 📋 完整步驟

### Step 1: 初始化 Git 倉庫（本地）

#### 1.1 初始化 Git

```bash
cd /Users/alex/Desktop/CJ
git init
```

#### 1.2 配置 Git 用戶信息（如果還沒配置）

```bash
git config user.name "你的名字"
git config user.email "你的郵箱"
```

#### 1.3 檢查 .gitignore

確認 `.gitignore` 已包含：
- `.env` 文件（保護敏感信息）
- `node_modules/`
- `dist/`
- `logs/`
- 其他不需要版本控制的文件

#### 1.4 添加所有文件

```bash
git add .
```

#### 1.5 創建初始提交

```bash
git commit -m "Initial commit: 熊媽媽法庭 MVP"
```

---

### Step 2: 在 GitHub 創建倉庫

#### 2.1 登錄 GitHub

1. 訪問 https://github.com
2. 登錄你的賬號

#### 2.2 創建新倉庫

1. 點擊右上角「**+**」→「**New repository**」
2. 填寫倉庫信息：
   - **Repository name**: `mother-bear-court`（或你喜歡的名稱）
   - **Description**: `熊媽媽法庭 - AI 輔助判決系統`
   - **Visibility**: 
     - **Public**（公開，免費）
     - **Private**（私有，需要 GitHub Pro，或使用免費額度）
   - **不要**勾選「Initialize this repository with a README」（我們已經有代碼了）
3. 點擊「**Create repository**」

#### 2.3 複製倉庫 URL

創建完成後，GitHub 會顯示倉庫 URL，格式：
```
https://github.com/你的用戶名/mother-bear-court.git
```

---

### Step 3: 推送代碼到 GitHub

#### 3.1 添加遠程倉庫

```bash
cd /Users/alex/Desktop/CJ
git remote add origin https://github.com/你的用戶名/mother-bear-court.git
```

#### 3.2 推送代碼

```bash
git branch -M main
git push -u origin main
```

**注意**：如果使用 HTTPS，可能需要輸入 GitHub 用戶名和密碼（或 Personal Access Token）

---

### Step 4: 在 Vercel 部署

#### 4.1 登錄 Vercel

1. 訪問 https://vercel.com
2. 點擊「**Sign Up**」或「**Log In**」
3. 選擇「**Continue with GitHub**」
4. 授權 Vercel 訪問你的 GitHub 賬號

#### 4.2 導入項目

1. 登錄後，點擊「**Add New Project**」或「**New Project**」
2. 在「**Import Git Repository**」中，找到你的倉庫（`mother-bear-court`）
3. 點擊「**Import**」

#### 4.3 配置項目設置

**重要配置**：

1. **Project Name**: `mother-bear-court`（或你喜歡的名稱）

2. **Root Directory**: 
   - 點擊「**Edit**」
   - 選擇 `frontend`（因為前端代碼在 frontend 目錄）

3. **Framework Preset**: 
   - 選擇「**Vite**」（Vercel 通常會自動檢測）

4. **Build Command**: 
   - `npm run build`

5. **Output Directory**: 
   - `dist`

6. **Install Command**: 
   - `npm install`

#### 4.4 配置環境變量（重要）

在「**Environment Variables**」部分，添加前端需要的環境變量：

```
VITE_API_URL=https://your-backend.railway.app
```

**注意**：如果後端還沒部署，可以先填一個臨時值，部署後再更新。

#### 4.5 部署

1. 點擊「**Deploy**」
2. 等待構建完成（約 2-5 分鐘）
3. 部署成功後，你會獲得一個 URL（如：`https://mother-bear-court.vercel.app`）

---

## 🔒 安全注意事項

### 1. 確保敏感文件不被提交

檢查 `.gitignore` 是否包含：
```
.env
.env.local
.env.*.local
node_modules/
dist/
logs/
```

### 2. 檢查已提交的文件

在推送前，檢查是否有敏感信息：

```bash
git log --all --full-history -- "*env*"
```

### 3. 如果已經提交了敏感文件

如果意外提交了 `.env` 文件：

```bash
# 從 Git 歷史中移除（但保留本地文件）
git rm --cached backend/.env
git rm --cached frontend/.env

# 提交更改
git commit -m "Remove .env files from version control"

# 推送到 GitHub
git push
```

---

## ✅ 驗證清單

### Git 初始化
- [ ] 已初始化 Git 倉庫
- [ ] 已配置用戶信息
- [ ] 已檢查 `.gitignore`
- [ ] 已創建初始提交

### GitHub 倉庫
- [ ] 已在 GitHub 創建倉庫
- [ ] 已添加遠程倉庫
- [ ] 已推送代碼到 GitHub
- [ ] 已確認代碼在 GitHub 上可見

### Vercel 部署
- [ ] 已登錄 Vercel
- [ ] 已導入 GitHub 倉庫
- [ ] 已配置項目設置（Root Directory: `frontend`）
- [ ] 已配置環境變量
- [ ] 已成功部署
- [ ] 已獲得部署 URL

---

## 🆘 常見問題

### Q1: 推送時要求輸入密碼

**解決方案**：
- 使用 Personal Access Token（推薦）
- 訪問：https://github.com/settings/tokens
- 創建新 Token，選擇 `repo` 權限
- 使用 Token 作為密碼

### Q2: Vercel 找不到項目

**解決方案**：
- 確認 Root Directory 設置為 `frontend`
- 確認倉庫已成功推送到 GitHub

### Q3: 構建失敗

**解決方案**：
- 檢查構建日誌
- 確認 `package.json` 存在
- 確認 `npm install` 可以正常運行

### Q4: 環境變量在哪裡配置？

**解決方案**：
- Vercel Dashboard → 項目 → Settings → Environment Variables
- 添加 `VITE_API_URL` 等變量

---

## 📝 下一步

部署完成後：

1. **測試前端**
   - 訪問 Vercel 提供的 URL
   - 測試基本功能

2. **配置後端部署**（Railway）
   - 參考：`快速部署行動清單.md`

3. **更新環境變量**
   - 在 Vercel 中更新 `VITE_API_URL` 為實際後端 URL

---

**最後更新**：2024年12月

