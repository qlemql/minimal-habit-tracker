export const darkColors = {
  background: '#0D0D0D',
  surface: '#161616',
  surfaceLight: '#232323',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#666666',
  accent: '#4A90D9',
  success: '#51CF66',
  inactive: '#2A2A2A',
  danger: '#FF6B6B',
} as const;

export const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#EBEBEB',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#757575',
  accent: '#3A7BC8',
  success: '#40A850',
  inactive: '#D9D9D9',
  danger: '#E04040',
} as const;

// 기본값 (다크 모드)
export const colors = darkColors;

export const habitColors = [
  '#4A90D9',
  '#7B68EE',
  '#FF6B6B',
  '#51CF66',
  '#FFD43B',
  '#FF922B',
  '#DA77F2',
  '#20C997',
] as const;

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
