# 後端 API 測試指南

**項目**：熊媽媽法庭  
**後端 URL**：https://mother-bear-court-production.up.railway.app  
**最後更新**：2024年12月

---

## 🎯 測試方法

### 方法 1：瀏覽器直接訪問（最簡單）

#### 1.1 健康檢查端點

**URL**：
```
https://mother-bear-court-production.up.railway.app/health
```

**操作步驟**：
1. 打開瀏覽器（Chrome、Safari、Firefox 等）
2. 在地址欄輸入上述 URL
3. 按 Enter

**預期結果**：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-11T16:57:33.342Z",
    "uptime": 2989,
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 679
      },
      "environment": {
        "status": "healthy"
      }
    },
    "responseTime": 679,
    "version": "1.0.0"
  },
  "meta": {
    "request_id": "49ac5547-e28f-4c3f-91b9-88690667101c",
    "timestamp": "2025-12-11T16:57:33.342Z"
  }
}
```

**✅ 成功標誌**：
- 看到 JSON 格式的響應
- `status: "healthy"`
- `database.status: "healthy"`
- `environment.status: "healthy"`

---

#### 1.2 其他健康檢查端點

**就緒檢查**：
```
https://mother-bear-court-production.up.railway.app/health/ready
```

**存活檢查**：
```
https://mother-bear-court-production.up.railway.app/health/live
```

---

### 方法 2：使用 curl 命令（終端）

#### 2.1 基本健康檢查

在終端運行：
```bash
curl https://mother-bear-court-production.up.railway.app/health
```

**預期輸出**：
```json
{"success":true,"data":{"status":"healthy",...}}
```

#### 2.2 格式化輸出（更易讀）

```bash
curl https://mother-bear-court-production.up.railway.app/health | python3 -m json.tool
```

或使用 `jq`（如果已安裝）：
```bash
curl https://mother-bear-court-production.up.railway.app/health | jq
```

#### 2.3 查看響應頭信息

```bash
curl -i https://mother-bear-court-production.up.railway.app/health
```

#### 2.4 測試所有健康檢查端點

```bash
# 基本健康檢查
curl https://mother-bear-court-production.up.railway.app/health

# 就緒檢查
curl https://mother-bear-court-production.up.railway.app/health/ready

# 存活檢查
curl https://mother-bear-court-production.up.railway.app/health/live
```

---

### 方法 3：使用 Postman 或類似工具

#### 3.1 Postman 設置

1. **創建新請求**
   - 方法：`GET`
   - URL：`https://mother-bear-court-production.up.railway.app/health`

2. **發送請求**
   - 點擊 "Send" 按鈕

3. **查看響應**
   - 狀態碼應該是 `200 OK`
   - 響應體應該是 JSON 格式

#### 3.2 測試其他端點

創建多個請求：
- `GET /health`
- `GET /health/ready`
- `GET /health/live`

---

### 方法 4：使用瀏覽器開發者工具

1. **打開開發者工具**
   - Chrome/Edge: `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Safari: `Cmd+Option+I`
   - Firefox: `F12` 或 `Cmd+Option+I`

2. **切換到 Network 標籤**
   - 查看所有網絡請求

3. **訪問健康檢查 URL**
   - 在地址欄輸入 URL
   - 按 Enter

4. **查看請求詳情**
   - 點擊 Network 標籤中的請求
   - 查看：
     - Status: `200 OK`
     - Response: JSON 響應內容
     - Headers: 響應頭信息
     - Timing: 響應時間

---

## 📊 響應數據解讀

### 健康檢查響應結構

```json
{
  "success": true,                    // 請求是否成功
  "data": {
    "status": "healthy",              // 整體健康狀態
    "timestamp": "2025-12-11T...",    // 檢查時間
    "uptime": 2989,                   // 服務運行時間（秒）
    "checks": {
      "database": {
        "status": "healthy",          // 數據庫狀態
        "responseTime": 679           // 數據庫響應時間（毫秒）
      },
      "environment": {
        "status": "healthy"           // 環境變量狀態
      }
    },
    "responseTime": 679,              // 總響應時間（毫秒）
    "version": "1.0.0"                // 服務版本
  },
  "meta": {
    "request_id": "...",               // 請求 ID
    "timestamp": "2025-12-11T..."     // 請求時間戳
  }
}
```

### 狀態說明

| 狀態值 | 含義 | 是否正常 |
|--------|------|----------|
| `"healthy"` | 健康，一切正常 | ✅ 是 |
| `"unhealthy"` | 不健康，有問題 | ❌ 否 |
| `"degraded"` | 降級，部分功能不可用 | ⚠️ 部分 |

### 響應時間說明

- **數據庫響應時間**：數據庫查詢耗時（毫秒）
  - `< 100ms`：優秀
  - `100-500ms`：良好
  - `500-1000ms`：可接受
  - `> 1000ms`：需要優化

- **總響應時間**：整個健康檢查的耗時（毫秒）
  - 通常與數據庫響應時間相近

---

## 🧪 完整測試腳本

### 創建測試腳本

創建文件 `scripts/test-backend.sh`：

```bash
#!/bin/bash

BASE_URL="https://mother-bear-court-production.up.railway.app"

echo "🧪 測試後端 API..."
echo ""

echo "1. 測試基本健康檢查..."
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""

echo "2. 測試就緒檢查..."
curl -s "$BASE_URL/health/ready" | python3 -m json.tool
echo ""

echo "3. 測試存活檢查..."
curl -s "$BASE_URL/health/live" | python3 -m json.tool
echo ""

echo "✅ 測試完成！"
```

**使用方法**：
```bash
chmod +x scripts/test-backend.sh
./scripts/test-backend.sh
```

---

## 🚨 常見問題排查

### 問題 1：無法訪問 URL

**症狀**：
- 瀏覽器顯示 "無法訪問此網站"
- curl 返回 "Connection refused"

**可能原因**：
- 服務未部署或已停止
- URL 不正確
- 網絡問題

**解決方案**：
1. 檢查 Railway Dashboard，確認服務狀態為 "Active"
2. 確認 URL 正確（包含 `https://`）
3. 檢查 Railway 部署日誌

---

### 問題 2：返回 404 Not Found

**症狀**：
- 瀏覽器顯示 404 錯誤
- curl 返回 `{"error":"Not Found"}`

**可能原因**：
- 路由配置錯誤
- 端點路徑不正確

**解決方案**：
1. 確認端點路徑正確（`/health`，不是 `/api/v1/health`）
2. 檢查後端路由配置
3. 查看 Railway 部署日誌

---

### 問題 3：返回 500 Internal Server Error

**症狀**：
- 瀏覽器顯示 500 錯誤
- 響應中包含錯誤信息

**可能原因**：
- 數據庫連接失敗
- 環境變量缺失
- 代碼錯誤

**解決方案**：
1. 查看 Railway 部署日誌
2. 檢查環境變量配置
3. 檢查數據庫連接狀態

---

### 問題 4：響應時間過長

**症狀**：
- `responseTime > 5000ms`
- 請求超時

**可能原因**：
- 數據庫連接慢
- 服務器資源不足
- 網絡延遲

**解決方案**：
1. 檢查數據庫連接配置
2. 檢查 Railway 服務資源使用情況
3. 優化數據庫查詢

---

## ✅ 測試檢查清單

### 基本測試
- [ ] 健康檢查端點可訪問
- [ ] 返回 JSON 格式響應
- [ ] `status: "healthy"`
- [ ] `database.status: "healthy"`
- [ ] `environment.status: "healthy"`

### 性能測試
- [ ] 響應時間 < 2000ms
- [ ] 數據庫響應時間 < 1000ms
- [ ] 服務穩定運行（uptime 持續增長）

### 其他端點測試
- [ ] `/health/ready` 可訪問
- [ ] `/health/live` 可訪問

---

## 📝 測試記錄模板

### 測試時間
- 日期：_____________
- 時間：_____________

### 測試結果
- 健康檢查：✅ / ❌
- 數據庫狀態：✅ / ❌
- 環境變量：✅ / ❌
- 響應時間：_____ ms

### 備註
_________________________________

---

## 🔗 相關資源

- **Railway Dashboard**: https://railway.app/dashboard
- **健康檢查端點**: https://mother-bear-court-production.up.railway.app/health
- **API 文檔**: 參考項目中的 API 設計文檔

---

**最後更新**：2024年12月

