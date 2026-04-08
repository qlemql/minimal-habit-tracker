import { unlockableIcons, unlockableColors } from './theme';

export interface RewardTier {
  flowDays: number;
  label: string;
  description: string;
  icons?: readonly string[];
  colors?: readonly string[];
}

/**
 * 해금 테이블
 * 흐름(이어가기) N일 달성 시 새로운 아이콘/색상이 자동 해금
 */
export const REWARD_TIERS: RewardTier[] = [
  {
    flowDays: 7,
    label: '7일 흐름',
    description: '새로운 색상 2개 해금',
    colors: [unlockableColors[0], unlockableColors[1]],
  },
  {
    flowDays: 14,
    label: '14일 흐름',
    description: '새로운 아이콘 4개 해금',
    icons: [unlockableIcons[0], unlockableIcons[1], unlockableIcons[2], unlockableIcons[3]],
  },
  {
    flowDays: 30,
    label: '30일 흐름',
    description: '프리미엄 색상 3개 해금',
    colors: [unlockableColors[2], unlockableColors[3], unlockableColors[4]],
  },
  {
    flowDays: 50,
    label: '50일 흐름',
    description: '프리미엄 아이콘 4개 해금',
    icons: [unlockableIcons[4], unlockableIcons[5], unlockableIcons[6], unlockableIcons[7]],
  },
];

/**
 * 특정 흐름 일수에서 해금된 모든 아이콘/색상 반환
 */
export function getUnlockedItems(maxFlowDays: number): {
  icons: string[];
  colors: string[];
} {
  const icons: string[] = [];
  const colors: string[] = [];

  for (const tier of REWARD_TIERS) {
    if (maxFlowDays >= tier.flowDays) {
      if (tier.icons) icons.push(...tier.icons);
      if (tier.colors) colors.push(...tier.colors);
    }
  }

  return { icons, colors };
}

/**
 * 특정 아이콘/색상이 해금되려면 필요한 흐름 일수 반환
 * 해금 불필요(기본 항목)이면 0 반환
 */
export function getRequiredFlowDays(item: string, type: 'icon' | 'color'): number {
  for (const tier of REWARD_TIERS) {
    const items = type === 'icon' ? tier.icons : tier.colors;
    if (items?.includes(item)) return tier.flowDays;
  }
  return 0;
}

/**
 * 새로 해금된 티어 찾기
 * previousMax → currentMax 사이에 해금된 티어들 반환
 */
export function getNewlyUnlockedTiers(
  previousMaxFlow: number,
  currentMaxFlow: number
): RewardTier[] {
  return REWARD_TIERS.filter(
    (tier) => previousMaxFlow < tier.flowDays && currentMaxFlow >= tier.flowDays
  );
}
