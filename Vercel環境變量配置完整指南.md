# Vercel 環境變量配置完整指南

**項目**：熊媽媽法庭  
**目的**：在 Vercel 配置前端環境變量，連接 Railway 後端  
**後端 URL**：https://mother-bear-court-production.up.railway.app  
**最後更新**：2024年12月

---

## 🎯 配置目標

在 Vercel 中配置以下環境變量：
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://mother-bear-court-production.up.railway.app/api/v1`

---

## 📋 詳細步驟

### 步驟 1：登錄 Vercel Dashboard

1. **訪問 Vercel Dashboard**
   - 網址：https://vercel.com/dashboard
   - 使用 GitHub 帳號登錄（如果還沒登錄）

2. **確認登錄成功**
   - 你應該看到 Vercel Dashboard 主頁面
   - 顯示你的項目列表

---

### 步驟 2：選擇項目

1. **找到你的項目**
   - 在項目列表中，找到 `mother-bear-court`（或你的項目名稱）
   - 點擊項目名稱進入項目詳情頁面

2. **確認項目頁面**
   - 你應該看到項目的概覽頁面
   - 頂部有標籤欄：Overview、Deployments、Analytics、Settings 等

---

### 步驟 3：進入環境變量設置

1. **點擊 Settings 標籤**
   - 在項目頁面頂部，點擊 **"Settings"** 標籤

2. **找到 Environment Variables 區塊**
   - 在 Settings 頁面左側，找到 **"Environment Variables"** 選項
   - 點擊它，或直接向下滾動到 Environment Variables 區塊

3. **確認環境變量頁面**
   - 你應該看到一個表格或列表，顯示現有的環境變量（如果有的話）
   - 有一個 **"Add New"** 或 **"Add"** 按鈕

---

### 步驟 4：添加環境變量

#### 4.1 點擊添加按鈕

1. **點擊 "Add New" 或 "+" 按鈕**
   - 通常在環境變量列表的頂部或右側

2. **打開添加環境變量表單**
   - 會彈出一個表單或展開一個輸入區域

#### 4.2 填寫環境變量信息

在表單中填寫：

1. **Key（變量名）**
   - 輸入：`VITE_API_BASE_URL`
   - ⚠️ **重要**：必須完全一致，區分大小寫

2. **Value（變量值）**
   - 輸入：`https://mother-bear-court-production.up.railway.app/api/v1`
   - ⚠️ **重要**：
     - 必須包含 `https://` 前綴
     - 必須包含 `/api/v1` 後綴
     - 不要有多餘的空格

3. **Environment（環境）**
   - 選擇要應用的環境：
     - ✅ **Production**（生產環境）- 必須選擇
     - ✅ **Preview**（預覽環境）- 建議選擇
     - ✅ **Development**（開發環境）- 可選
   - 可以同時選擇多個環境

#### 4.3 保存環境變量

1. **點擊 "Save" 或 "Add" 按鈕**
   - 保存環境變量

2. **確認保存成功**
   - 環境變量應該出現在列表中
   - 顯示你剛才添加的 Key 和 Value（Value 可能被隱藏為 `****`）

---

### 步驟 5：驗證配置

#### 5.1 檢查環境變量列表

確認環境變量已正確添加：
- Key: `VITE_API_BASE_URL`
- Value: `https://mother-bear-court-production.up.railway.app/api/v1`（或顯示為 `****`）
- Environment: Production, Preview（根據你的選擇）

#### 5.2 檢查 Value 是否正確

如果 Value 顯示為 `****`（隱藏），可以：
1. 點擊環境變量右側的 **"Edit"** 或 **"..."** 按鈕
2. 查看或編輯 Value
3. 確認值正確後關閉

---

### 步驟 6：重新部署前端

**重要**：添加環境變量後，必須重新部署前端才能生效！

#### 方法 A：手動重新部署（推薦）

1. **進入 Deployments 標籤**
   - 在項目頁面頂部，點擊 **"Deployments"** 標籤

2. **找到最新部署**
   - 在部署列表中，找到最新的部署記錄

3. **觸發重新部署**
   - 點擊最新部署右側的 **"..."** 菜單（三個點）
   - 選擇 **"Redeploy"**
   - 確認重新部署

4. **等待部署完成**
   - 部署狀態會顯示為 "Building" → "Ready"
   - 通常需要 1-3 分鐘

#### 方法 B：等待自動部署

- 如果你推送新的代碼到 GitHub，Vercel 會自動觸發新的部署
- 新部署會自動使用最新的環境變量

---

## 🖼️ 視覺指引

### Vercel Dashboard 結構

```
Vercel Dashboard
├── 左側邊欄
│   └── Projects（項目列表）
│       └── mother-bear-court（你的項目）
│           ├── Overview（概覽）
│           ├── Deployments（部署）⭐ 重新部署在這裡
│           ├── Analytics（分析）
│           └── Settings（設置）⭐ 環境變量在這裡
│               └── Environment Variables（環境變量）⭐
│
└── 主內容區
    └── 根據選中的標籤顯示不同內容
```

### 環境變量配置界面

```
Environment Variables 頁面
├── 頂部
│   └── "Add New" 按鈕 ⭐ 點擊這裡添加
│
├── 環境變量列表
│   └── 表格或列表顯示現有環境變量
│       ├── Key 列
│       ├── Value 列（可能隱藏為 ****）
│       ├── Environment 列
│       └── Actions 列（Edit/Delete）
│
└── 添加表單（點擊 Add New 後顯示）
    ├── Key 輸入框 ⭐ 輸入：VITE_API_BASE_URL
    ├── Value 輸入框 ⭐ 輸入：https://.../api/v1
    ├── Environment 選擇框 ⭐ 選擇：Production, Preview
    └── Save 按鈕 ⭐ 點擊保存
```

---

## ✅ 配置檢查清單

### 配置前
- [ ] 已登錄 Vercel Dashboard
- [ ] 已找到項目（mother-bear-court）
- [ ] 已進入 Settings → Environment Variables

### 配置時
- [ ] Key 正確：`VITE_API_BASE_URL`（完全一致，區分大小寫）
- [ ] Value 正確：`https://mother-bear-court-production.up.railway.app/api/v1`
  - [ ] 包含 `https://` 前綴
  - [ ] 包含 `/api/v1` 後綴
  - [ ] 沒有多餘空格
- [ ] Environment 已選擇：Production（必須）、Preview（建議）

### 配置後
- [ ] 環境變量已出現在列表中
- [ ] 已重新部署前端（手動或自動）
- [ ] 部署狀態為 "Ready"

---

## 🚨 常見問題

### Q1: 找不到 Environment Variables 選項

**A**: 
- 確認你在正確的項目中
- 確認你點擊了 Settings 標籤
- 在 Settings 頁面左側菜單中查找 "Environment Variables"
- 或直接向下滾動，找到 Environment Variables 區塊

### Q2: 添加後 Value 顯示為 `****`，如何確認是否正確？

**A**:
- 點擊環境變量右側的 "Edit" 按鈕
- 可以查看和編輯 Value
- 確認值正確後保存

### Q3: Key 應該是什麼？`VITE_API_URL` 還是 `VITE_API_BASE_URL`？

**A**: 
- **必須使用**：`VITE_API_BASE_URL`
- **不要使用**：`VITE_API_URL`
- 原因：前端代碼中使用的是 `VITE_API_BASE_URL`（見 `frontend/src/config/env.ts`）

### Q4: Value 需要包含 `/api/v1` 嗎？

**A**: 
- **是的，必須包含** `/api/v1` 後綴
- 完整格式：`https://你的RailwayURL/api/v1`
- 例如：`https://mother-bear-court-production.up.railway.app/api/v1`

### Q5: 配置後前端還是無法連接後端

**A**: 
檢查以下幾點：
1. ✅ 環境變量是否已保存
2. ✅ 是否已重新部署前端
3. ✅ Key 是否完全正確（`VITE_API_BASE_URL`）
4. ✅ Value 是否包含完整 URL 和 `/api/v1` 後綴
5. ✅ 部署狀態是否為 "Ready"
6. ✅ 在瀏覽器控制台檢查 `import.meta.env.VITE_API_BASE_URL` 的值

### Q6: 如何驗證環境變量是否生效？

**A**: 
部署完成後，在瀏覽器控制台運行：
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```
應該顯示：`https://mother-bear-court-production.up.railway.app/api/v1`

---

## 🔍 驗證配置是否正確

### 方法 1：檢查部署日誌

1. 進入 Deployments 標籤
2. 點擊最新部署
3. 查看 Build Logs
4. 確認沒有環境變量相關錯誤

### 方法 2：檢查瀏覽器控制台

1. 打開前端應用
2. 打開瀏覽器開發者工具（F12）
3. 在 Console 中運行：
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```
4. 應該顯示你配置的 URL

### 方法 3：測試 API 請求

1. 打開前端應用
2. 打開瀏覽器開發者工具 → Network 標籤
3. 執行一個會調用後端 API 的操作
4. 查看 Network 請求，確認請求 URL 正確

---

## 📝 完整配置示例

### 環境變量配置

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://mother-bear-court-production.up.railway.app/api/v1` | Production, Preview |

### 配置後的預期行為

1. **構建時**：Vite 會將 `VITE_API_BASE_URL` 注入到前端代碼中
2. **運行時**：前端通過 `import.meta.env.VITE_API_BASE_URL` 訪問後端 API
3. **API 請求**：所有 API 請求會發送到 `https://mother-bear-court-production.up.railway.app/api/v1`

---

## 🎯 快速參考

### 必須配置的環境變量

```env
VITE_API_BASE_URL=https://mother-bear-court-production.up.railway.app/api/v1
```

### 配置步驟總結

1. 登錄 Vercel Dashboard
2. 選擇項目 → Settings → Environment Variables
3. 點擊 "Add New"
4. Key: `VITE_API_BASE_URL`
5. Value: `https://mother-bear-court-production.up.railway.app/api/v1`
6. Environment: Production, Preview
7. 點擊 Save
8. 重新部署前端

---

## 📞 需要幫助？

如果按照以上步驟仍然遇到問題，請告訴我：

1. **你現在在 Vercel Dashboard 的哪個頁面？**
2. **你看到了什麼內容？**
3. **你遇到了什麼具體問題？**
   - 找不到 Environment Variables？
   - 添加後不生效？
   - 其他問題？

---

**最後更新**：2024年12月

