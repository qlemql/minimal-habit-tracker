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
  // 완료 표시 (Olive — 모드별 채도 조정)
  completionBorder: '#8AAD75',
  completionBg: '#1B2418',
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
  // 완료 표시 (Olive — 따뜻한 녹색, 크림 친화)
  completionBorder: '#6B8E5A',
  completionBg: '#EFF3E5',
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

// ────────────────────────────────────────────────────────────────────────────
// 해금 팩 (v1.3+) — 카테고리 기반 4개 팩
// 마일스톤(7/21/50/100일)마다 4개 중 1개 선택 (마지막은 자동)
// 아이콘은 iOS Apple Color + Android Noto Emoji 양쪽 호환 보장 (Unicode 9.0 이하, 스킨톤 modifier X)
// ────────────────────────────────────────────────────────────────────────────

export type PackId = 'health' | 'mind' | 'creator' | 'nature';

export interface UnlockPack {
  id: PackId;
  emoji: string; // 대표 이모지
  icons: readonly string[]; // 신규 아이콘 5개
  colors: readonly string[]; // 신규 색상 3개
}

export const UNLOCK_PACKS: Record<PackId, UnlockPack> = {
  health: {
    id: 'health',
    emoji: '🏃',
    icons: ['🏃', '🏋️', '🥗', '🥤', '😴'],
    colors: ['#E08A6B', '#E8A538', '#D94040'],
  },
  mind: {
    id: 'mind',
    emoji: '🦋',
    icons: ['✨', '📝', '🌙', '💭', '🦋'],
    colors: ['#9580CC', '#2C3E5F', '#6B8FB5'],
  },
  creator: {
    id: 'creator',
    emoji: '🎨',
    icons: ['🎨', '✏️', '🎵', '📷', '🎸'],
    colors: ['#D86BA8', '#D4A55B', '#20C997'],
  },
  nature: {
    id: 'nature',
    emoji: '🌳',
    icons: ['🌳', '🌻', '🌷', '🍀', '🌿'],
    colors: ['#3D7950', '#6B8E5A', '#7A8C5C'],
  },
};

export const PACK_IDS: readonly PackId[] = ['health', 'mind', 'creator', 'nature'];

/** 모든 팩의 아이콘을 평탄화 — add/edit 화면 grid 렌더링용 */
export const allPackIcons: readonly string[] = PACK_IDS.flatMap((id) => UNLOCK_PACKS[id].icons);
/** 모든 팩의 색상을 평탄화 */
export const allPackColors: readonly string[] = PACK_IDS.flatMap((id) => UNLOCK_PACKS[id].colors);

// ────────────────────────────────────────────────────────────────────────────
// 레거시 호환 — v1.2.x 까지 사용된 평탄 배열. 새 코드는 UNLOCK_PACKS 직접 사용.
// ────────────────────────────────────────────────────────────────────────────
export const unlockableIcons = allPackIcons;
export const unlockableColors = allPackColors;
