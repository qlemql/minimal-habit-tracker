export const colors = {
  // 배경
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#262626',

  // 텍스트
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#666666',

  // 습관 색상 프리셋
  habitColors: [
    '#4A90D9', // 블루
    '#7B68EE', // 퍼플
    '#FF6B6B', // 레드
    '#51CF66', // 그린
    '#FFD43B', // 옐로우
    '#FF922B', // 오렌지
    '#DA77F2', // 핑크
    '#20C997', // 틸
  ],

  // 상태
  success: '#51CF66',
  inactive: '#333333',
  danger: '#FF6B6B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const habitIcons = [
  '💧', '🏃', '📖', '🧘', '💪',
  '🍎', '😴', '✍️', '🎯', '🧹',
  '💊', '🚶',
] as const;
