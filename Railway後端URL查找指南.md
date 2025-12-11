# Railway 後端 URL 查找指南

**項目**：熊媽媽法庭  
**目的**：找到 Railway 部署的後端 URL，用於配置 Vercel 前端環境變量

---

## 🎯 查找 Railway 後端 URL 的步驟

### 方法 1：從 Settings → Networking（推薦）

1. **登錄 Railway Dashboard**
   - 訪問：https://railway.app/dashboard
   - 使用你的 GitHub 帳號登錄

2. **選擇項目和服務**
   - 在左側項目列表中，找到並點擊你的項目（例如：`mother-bear-court`）
   - 點擊 **backend** 服務（或你的後端服務名稱）

3. **進入 Settings**
   - 在服務頁面頂部，點擊 **「Settings」** 標籤

4. **查看 Networking**
   - 在 Settings 頁面中，向下滾動找到 **「Networking」** 區塊
   - 查看 **「Public Domain」** 或 **「Custom Domain」** 部分

5. **找到 URL**
   - 你會看到類似這樣的 URL：
     ```
     https://mother-bear-court-backend-production.up.railway.app
     ```
     或
     ```
     https://xxx.railway.app
     ```

6. **複製完整 URL**
   - 點擊 URL 旁邊的複製按鈕，或手動複製
   - **這是你的後端 URL**

---

### 方法 2：從 Deployments 頁面

1. **進入 Deployments**
   - 在服務頁面，點擊 **「Deployments」** 標籤

2. **查看最新部署**
   - 點擊最新的部署記錄

3. **查看部署詳情**
   - 在部署詳情頁面，查找 **「Public URL」** 或 **「Domain」** 信息
   - 通常顯示在頁面頂部或右側

---

### 方法 3：從服務主頁面

1. **查看服務概覽**
   - 在服務主頁面（Overview），查看右上角或頂部
   - 有時會直接顯示 Public URL

2. **查看日誌**
   - 點擊 **「Logs」** 標籤
   - 有時在日誌中會顯示服務的 URL

---

## 🔍 如果找不到 URL 怎麼辦？

### 情況 1：沒有 Public Domain

**問題**：在 Settings → Networking 中沒有看到 Public Domain

**解決方案**：
1. 在 Settings → Networking 頁面
2. 找到 **「Generate Domain」** 或 **「Create Public Domain」** 按鈕
3. 點擊按鈕生成一個公共域名
4. Railway 會自動生成一個 URL（格式：`https://xxx-production.up.railway.app`）

### 情況 2：服務還沒有部署成功

**問題**：服務還在構建或部署中

**解決方案**：
1. 檢查 Deployments 標籤
2. 確認最新部署狀態為 **「Active」** 或 **「Success」**
3. 如果還在構建中，等待部署完成
4. 部署成功後，URL 會自動生成

### 情況 3：服務已暫停

**問題**：服務可能因為不活動而暫停

**解決方案**：
1. 檢查服務狀態
2. 如果服務已暫停，點擊 **「Restart」** 或 **「Deploy」** 按鈕
3. 等待服務重新啟動
4. 重新啟動後，URL 會恢復

---

## 📋 URL 格式說明

Railway 的 URL 通常有兩種格式：

### 格式 1：標準格式
```
https://xxx.railway.app
```
例如：
```
https://mother-bear-court-backend.railway.app
```

### 格式 2：生產環境格式
```
https://xxx-production.up.railway.app
```
例如：
```
https://mother-bear-court-backend-production.up.railway.app
```

**兩種格式都可以使用！**

---

## ✅ 驗證 URL 是否正確

找到 URL 後，可以通過以下方式驗證：

### 1. 測試健康檢查端點

在瀏覽器中訪問：
```
https://你的RailwayURL/health
```

**預期結果**：
- 如果返回 JSON 響應（如：`{"status":"ok"}`），說明 URL 正確 ✅
- 如果返回 404 或無法訪問，說明 URL 不正確或服務未運行 ❌

### 2. 使用 curl 測試

在終端運行：
```bash
curl https://你的RailwayURL/health
```

**預期結果**：
- 返回 JSON 響應，說明 URL 正確 ✅
- 返回錯誤，說明 URL 不正確或服務未運行 ❌

---

## 🎯 找到 URL 後的下一步

### 步驟 1：記錄完整 URL

記錄你找到的 URL，例如：
```
https://mother-bear-court-backend-production.up.railway.app
```

### 步驟 2：構建完整的 API URL

在 Vercel 環境變量中，你需要使用：
```
https://你的RailwayURL/api/v1
```

例如：
```
https://mother-bear-court-backend-production.up.railway.app/api/v1
```

### 步驟 3：在 Vercel 配置

1. 登錄 Vercel Dashboard
2. 選擇你的項目
3. 進入 Settings → Environment Variables
4. 添加：
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://你的RailwayURL/api/v1`
5. 選擇環境（Production, Preview, Development）
6. 點擊 Save

---

## 📸 視覺指引

### Railway Dashboard 結構

```
Railway Dashboard
├── Projects（左側）
│   └── 你的項目
│       └── Services（服務列表）
│           └── backend（後端服務）
│               ├── Overview（概覽）
│               ├── Deployments（部署）
│               ├── Logs（日誌）
│               ├── Metrics（指標）
│               └── Settings（設置）⭐ 在這裡找 URL
│                   └── Networking（網絡設置）⭐ URL 在這裡
```

---

## 🚨 常見問題

### Q1: 我看到了多個 URL，應該用哪個？

**A**: 使用 **Public Domain** 或 **Production URL**。如果有自定義域名，也可以使用自定義域名。

### Q2: URL 格式是 `xxx.up.railway.app` 還是 `xxx.railway.app`？

**A**: 兩種都可以！Railway 可能使用不同的格式，只要 URL 能正常訪問就可以。

### Q3: 我複製的 URL 沒有 `https://` 前綴，需要加嗎？

**A**: 是的！在 Vercel 環境變量中，必須包含 `https://` 前綴：
- ✅ 正確：`https://xxx.railway.app/api/v1`
- ❌ 錯誤：`xxx.railway.app/api/v1`

### Q4: 我的服務名稱是什麼？

**A**: 在 Railway Dashboard 中，服務名稱通常顯示在：
- 左側服務列表中
- 服務頁面的標題
- 通常是 `backend` 或你創建服務時設置的名稱

---

## 📞 需要幫助？

如果按照以上步驟仍然找不到 URL，請檢查：

1. ✅ 服務是否已成功部署？
2. ✅ 服務狀態是否為 "Active"？
3. ✅ 是否在正確的服務頁面？
4. ✅ 是否在 Settings → Networking 頁面？

如果問題仍然存在，可以：
- 查看 Railway 文檔：https://docs.railway.app
- 檢查 Railway 服務狀態
- 嘗試重新部署服務

---

**最後更新**：2024年12月

