import { unlockableIcons, unlockableColors } from './theme';

export interface RewardTier {
  flowDays: number;
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
    colors: [unlockableColors[0], unlockableColors[1]],
  },
  {
    flowDays: 14,
    icons: [unlockableIcons[0], unlockableIcons[1], unlockableIcons[2], unlockableIcons[3]],
  },
  {
    flowDays: 30,
    colors: [unlockableColors[2], unlockableColors[3], unlockableColors[4]],
  },
  {
    flowDays: 50,
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
