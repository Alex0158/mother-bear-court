import { v4 as uuidv4 } from 'uuid';

/**
 * 生成快速體驗模式的Session ID
 * 格式：guest_{timestamp}_{random}
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = uuidv4().substring(0, 8).replace(/-/g, '');
  return `guest_${timestamp}_${random}`;
}

/**
 * 驗證Session ID格式
 */
export function validateSessionId(sessionId: string): boolean {
  // 格式：guest_timestamp_random
  const pattern = /^guest_\d+_[a-z0-9]{8,}$/;
  if (!pattern.test(sessionId)) {
    return false;
  }
  
  // 提取時間戳，檢查是否在合理範圍內（不超過24小時）
  const parts = sessionId.split('_');
  if (parts.length !== 3) {
    return false;
  }
  
  const timestamp = parseInt(parts[1], 10);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24小時
  
  if (timestamp < now - maxAge || timestamp > now + 60000) { // 允許1分鐘誤差
    return false;
  }
  
  return true;
}

/**
 * 生成驗證碼（6位數字）
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 生成邀請碼（6位字母數字）
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

