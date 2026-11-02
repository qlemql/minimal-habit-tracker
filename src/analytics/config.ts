// Public ingest configuration. Never put a Personal API key here.
export const analyticsConfig = {
  token: process.env.EXPO_PUBLIC_POSTHOG_TOKEN || '',
  host: 'https://us.i.posthog.com',
  enabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
  environment: process.env.EXPO_PUBLIC_ANALYTICS_ENV === 'production' ? 'production' : 'test',
};
