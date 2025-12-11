# 熊媽媽法庭 - API文檔

## 基礎信息

- **Base URL**: `http://localhost:3000/api/v1`
- **認證方式**: JWT Token (Bearer Token)
- **響應格式**: JSON

## 統一響應格式

### 成功響應
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 錯誤響應
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": {}
  }
}
```

## 認證相關

### 1. 用戶註冊
**POST** `/auth/register`

**請求體**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "用戶暱稱"
}
```

### 2. 用戶登錄
**POST** `/auth/login`

**請求體**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. 發送驗證碼
**POST** `/auth/send-verification-code`

**請求體**:
```json
{
  "email": "user@example.com",
  "type": "register"
}
```

## Session管理（快速體驗模式）

### 1. 創建Session
**GET** `/sessions/create`

**響應**:
```json
{
  "success": true,
  "data": {
    "session_id": "guest_1704067200_abc123",
    "expires_at": "2024-01-02T00:00:00Z"
  }
}
```

## 案件相關

### 1. 創建案件（快速體驗模式）
**POST** `/cases/quick`

**請求頭**:
```
X-Session-Id: guest_1704067200_abc123
```

**請求體**:
```json
{
  "plaintiff_statement": "發生了什麼事？我的感受是什麼？我希望對方怎麼做？",
  "defendant_statement": "發生了什麼事？我的感受是什麼？我希望對方怎麼做？",
  "evidence_urls": ["https://..."]
}
```

### 2. 創建案件（完整模式）
**POST** `/cases`

**請求頭**:
```
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "pairing_id": "uuid",
  "plaintiff_statement": "...",
  "defendant_statement": "...",
  "evidence_urls": ["https://..."]
}
```

### 3. 獲取案件詳情
**GET** `/cases/:id`

**查詢參數**（快速體驗模式）:
```
?session_id=guest_1704067200_abc123
```

### 4. 上傳證據
**POST** `/cases/:id/evidence`

**Content-Type**: `multipart/form-data`

**表單數據**:
- `files`: 文件（最多3個）

## 判決相關

### 1. 生成判決
**POST** `/judgments/generate/:id`

**說明**: `:id` 為案件ID

### 2. 獲取判決詳情
**GET** `/judgments/:id`

**說明**: `:id` 為判決ID

## 和好方案相關

### 1. 生成和好方案
**POST** `/judgments/:id/reconciliation-plans`

**請求體**（可選）:
```json
{
  "preferences": {
    "difficulty": "easy",
    "duration": 7,
    "types": ["activity", "communication"]
  }
}
```

### 2. 獲取和好方案列表
**GET** `/judgments/:id/reconciliation-plans`

**查詢參數**:
```
?difficulty=easy&type=activity
```

### 3. 選擇和好方案
**POST** `/reconciliation-plans/:id/select`

## 執行相關

### 1. 確認執行
**POST** `/execution/confirm`

**請求體**:
```json
{
  "plan_id": "uuid"
}
```

### 2. 執行打卡
**POST** `/execution/checkin`

**請求體**:
```json
{
  "plan_id": "uuid",
  "notes": "執行感受...",
  "photos": ["https://..."]
}
```

### 3. 獲取執行狀態
**GET** `/execution/status?plan_id=uuid`

## 錯誤碼

| 錯誤碼 | HTTP狀態碼 | 說明 |
|--------|-----------|------|
| `UNAUTHORIZED` | 401 | 未認證 |
| `FORBIDDEN` | 403 | 無權限 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `VALIDATION_ERROR` | 400 | 驗證失敗 |
| `RATE_LIMIT_EXCEEDED` | 429 | 請求過於頻繁 |
| `AI_SERVICE_ERROR` | 503 | AI服務錯誤 |

## 限流規則

- 認證接口：每5分鐘10次
- 註冊接口：每小時5次
- 驗證碼接口：每郵箱每5分鐘1次
- AI接口：每小時10次
- 其他接口：每分鐘100次

