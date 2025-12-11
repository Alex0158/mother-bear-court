/**
 * HTTP請求封裝
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse, ApiError } from '@/types/common';
import { env } from '@/config/env';
import { sessionStorage } from '@/utils/storage';
import { requestWithRetry } from '@/utils/retry';

// 創建axios實例
const request: AxiosInstance = axios.create({
  baseURL: env.apiBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 帶重試的請求方法（用於關鍵操作）
 */
export const requestWithRetryWrapper = async <T = any>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return requestWithRetry(
    () => request(config),
    {
      maxRetries: 3,
      initialDelay: 1000,
      shouldRetry: (error: any) => {
        // 只對網絡錯誤和5xx錯誤重試
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          return true;
        }
        if (error.response?.status >= 500) {
          return true;
        }
        return false;
      },
    }
  );
};

// 請求攔截器
request.interceptors.request.use(
  (config) => {
    // 添加認證Token（如果存在）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加Session ID（快速體驗模式）
    const sessionId = sessionStorage.get();
    if (sessionId && !config.headers['X-Session-Id']) {
      config.headers['X-Session-Id'] = sessionId;
      // 同時添加到查詢參數（後端可能從查詢參數讀取）
      if (config.params) {
        config.params.session_id = sessionId;
      } else {
        config.params = { session_id: sessionId };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // 後端已統一返回ApiResponse格式
    if (data && typeof data === 'object' && 'success' in data) {
      // 如果成功，直接返回
      if (data.success) {
        return response;
      }
      // 如果失敗，轉換為錯誤
      return Promise.reject({
        code: (data as any).error?.code || 'API_ERROR',
        message: (data as any).error?.message || '請求失敗',
        details: (data as any).error?.details,
      });
    }

    // 兼容直接返回數據的情況（舊版本兼容）
    return {
      ...response,
      data: { success: true, data } as ApiResponse,
    };
  },
  (error: AxiosError<ApiError>) => {
    const { response } = error;

    // 處理HTTP錯誤
    if (response) {
      const { status, data } = response;
      
      // 後端統一返回格式：{ success: false, error: { code, message, details } }
      const errorData = (data as any)?.error || data;

      switch (status) {
        case 401:
          // 未認證，清除token並跳轉到登錄頁
          localStorage.removeItem('token');
          // 使用useAuthStore清除狀態（如果可用）
          try {
            // 動態導入避免循環依賴
            import('@/store/authStore').then(({ useAuthStore }) => {
              useAuthStore.getState().logout();
            }).catch(() => {
              // Store可能未初始化，忽略
            });
          } catch {
            // 忽略錯誤
          }
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
          message.error(errorData?.message || '登錄已過期，請重新登錄');
          break;

        case 403:
          message.error(errorData?.message || '無權限訪問此資源');
          break;

        case 404:
          message.error(errorData?.message || '資源不存在');
          break;

        case 422:
          message.error(errorData?.message || '請求參數錯誤');
          break;

        case 429:
          message.error(errorData?.message || '請求過於頻繁，請稍後再試');
          break;

        case 500:
        default:
          message.error(errorData?.message || '服務器錯誤，請稍後再試');
      }

      return Promise.reject({
        code: errorData?.code || `HTTP_${status}`,
        message: errorData?.message || error.message,
        details: errorData?.details,
      });
    }

    // 網絡錯誤
    if (error.request) {
      message.error('網絡連接失敗，請檢查網絡連接');
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '網絡連接失敗',
      });
    }

    // 其他錯誤
    message.error('發生未知錯誤');
    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: error.message,
    });
  }
);

export default request;

