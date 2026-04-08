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

export const creamColors = {
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceLight: '#FFF1E6',
  textPrimary: '#2D2016',
  textSecondary: '#8C7B6B',
  textMuted: '#B5A899',
  accent: '#5B8C6A',
  success: '#4CAF50',
  inactive: '#EDE5DA',
  danger: '#D94040',
} as const;

// 기본값 (크림 모드)
export const colors = creamColors;

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

// 해금 가능 아이콘 (흐름 달성으로 해금)
export const unlockableIcons = [
  '🎵', '🧠', '🌿', '☕',   // 14일 해금
  '🔥', '⭐', '🌙', '💎',   // 50일 해금
] as const;

// 해금 가능 색상 (흐름 달성으로 해금)
export const unlockableColors = [
  '#FF5C93', '#00B4D8',       // 7일 해금 (핑크, 스카이블루)
  '#E8A838', '#8B5CF6', '#06D6A0', // 30일 해금 (골드, 인디고, 민트)
] as const;
