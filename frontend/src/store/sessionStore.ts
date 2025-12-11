/**
 * Session狀態管理（快速體驗模式）
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session } from '@/types/session';
import { createSession } from '@/services/api/session';
import { sessionStorage } from '@/utils/storage';

interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,

      createSession: async () => {
        // 如果已有Session，直接返回
        const existingSessionId = sessionStorage.get();
        if (existingSessionId) {
          set({
            session: {
              session_id: existingSessionId,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const session = await createSession();
          sessionStorage.set(session.session_id);
          set({ session, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || '創建Session失敗',
            isLoading: false,
          });
        }
      },

      clearSession: () => {
        sessionStorage.remove();
        set({ session: null, error: null });
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

