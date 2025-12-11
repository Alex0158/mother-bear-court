/**
 * 環境變量配置
 */

interface EnvConfig {
  apiBaseURL: string;
  appTitle: string;
  appDescription: string;
  isDevelopment: boolean;
  isProduction: boolean;
  gaTrackingId?: string;
  sentryDSN?: string;
}

export const env: EnvConfig = {
  apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  appTitle: import.meta.env.VITE_APP_TITLE || '熊媽媽法庭',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || '大愛、包容、保護、呵護，為您的關係提供公正溫暖的判決。',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
  sentryDSN: import.meta.env.VITE_SENTRY_DSN,
};

