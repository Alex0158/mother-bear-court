/**
 * 輪詢Hook（統一版本）
 */

import { useRef, useEffect, useState, useCallback } from 'react';

type PollingFunction<T> = () => Promise<T | null>;

interface PollingResult {
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

/**
 * 通用輪詢Hook
 * @param fn - 輪詢函數，返回數據或null
 * @param interval - 輪詢間隔（毫秒）
 * @param condition - 停止條件函數，返回true時停止輪詢
 */
export const usePolling = <T>(
  fn: PollingFunction<T>,
  interval: number,
  condition: (data: T | null) => boolean = (data) => data !== null
): PollingResult => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  const conditionRef = useRef(condition);
  const [isPolling, setIsPolling] = useState(false);

  // Update refs if fn or condition changes
  useEffect(() => {
    fnRef.current = fn;
    conditionRef.current = condition;
  }, [fn, condition]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPolling(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (timerRef.current) {
      stopPolling();
    }

    const poll = async () => {
      try {
        const data = await fnRef.current();
        if (conditionRef.current(data)) {
          stopPolling();
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Optionally stop polling on error or implement retry logic
        // stopPolling();
      }
    };

    timerRef.current = setInterval(poll, interval);
    setIsPolling(true);
    poll(); // Run immediately on start
  }, [interval, stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return { startPolling, stopPolling, isPolling };
};
