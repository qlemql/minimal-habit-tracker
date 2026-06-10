import { UNLOCK_PACKS, PACK_IDS, PackId } from './theme';

// ────────────────────────────────────────────────────────────────────────────
// 마일스톤 — 흐름 일수 도달 시 팩 1개 해금
// 4개 milestone × 4개 팩 = 마지막은 자동 (남은 1개)
// ────────────────────────────────────────────────────────────────────────────

export interface UnlockMilestone {
  flowDays: number;
  /** true면 사용자가 남은 팩 중 선택, false면 마지막 1개 자동 */
  selectable: boolean;
}

export const UNLOCK_MILESTONES: readonly UnlockMilestone[] = [
  { flowDays: 7, selectable: true },
  { flowDays: 21, selectable: true },
  { flowDays: 50, selectable: true },
  { flowDays: 100, selectable: false },
];

// ────────────────────────────────────────────────────────────────────────────
// 사용자 unlocked 상태 기반 헬퍼
// ────────────────────────────────────────────────────────────────────────────

/** 해금된 팩들의 아이콘/색상 평탄화 */
export function getUnlockedItemsFromPacks(unlockedPacks: readonly PackId[]): {
  icons: string[];
  colors: string[];
} {
  const icons: string[] = [];
  const colors: string[] = [];
  for (const id of unlockedPacks) {
    icons.push(...UNLOCK_PACKS[id].icons);
    colors.push(...UNLOCK_PACKS[id].colors);
  }
  return { icons, colors };
}

/** 특정 아이콘/색상이 속한 팩 (없으면 null — 기본 셋) */
export function getPackOfItem(
  item: string,
  type: 'icon' | 'color'
): PackId | null {
  for (const id of PACK_IDS) {
    const pack = UNLOCK_PACKS[id];
    const list = type === 'icon' ? pack.icons : pack.colors;
    if (list.includes(item)) return id;
  }
  return null;
}

/** 사용자가 그 아이템을 사용 가능한지 */
export function isItemUnlocked(
  item: string,
  type: 'icon' | 'color',
  unlockedPacks: readonly PackId[]
): boolean {
  const pack = getPackOfItem(item, type);
  if (pack === null) return true; // 기본 셋은 항상 unlock
  return unlockedPacks.includes(pack);
}

/** 흐름 일수 → 도달 가능한 milestone 수 */
export function countReachedMilestones(maxFlowDays: number): number {
  return UNLOCK_MILESTONES.filter((m) => maxFlowDays >= m.flowDays).length;
}

/** 다음 milestone까지 남은 일수 (모두 도달했으면 null) */
export function getDaysUntilNextMilestone(maxFlowDays: number): {
  milestone: UnlockMilestone;
  daysLeft: number;
} | null {
  const next = UNLOCK_MILESTONES.find((m) => m.flowDays > maxFlowDays);
  if (!next) return null;
  return { milestone: next, daysLeft: next.flowDays - maxFlowDays };
}

/** previousMax → currentMax 사이에 새로 도달한 milestone들 */
export function getNewlyReachedMilestones(
  previousMaxFlow: number,
  currentMaxFlow: number
): UnlockMilestone[] {
  return UNLOCK_MILESTONES.filter(
    (m) => previousMaxFlow < m.flowDays && currentMaxFlow >= m.flowDays
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 레거시 호환 — v1.2.x까지 사용된 API. 새 코드는 위 함수를 직접 사용.
// 호출 시 unlockedPacks가 비어 있다고 가정 — 점진적 마이그레이션용.
// ────────────────────────────────────────────────────────────────────────────

export interface RewardTier {
  flowDays: number;
  icons?: readonly string[];
  colors?: readonly string[];
}

export const REWARD_TIERS: RewardTier[] = UNLOCK_MILESTONES.map((m) => ({
  flowDays: m.flowDays,
}));

/** 레거시 — maxFlowDays만 받음. 새 코드는 getUnlockedItemsFromPacks 사용 */
export function getUnlockedItems(_maxFlowDays: number): {
  icons: string[];
  colors: string[];
} {
  // 새 시스템에선 사용자 unlockedPacks가 필요 — 빈 결과 반환 (호출처 마이그레이션 필요)
  return { icons: [], colors: [] };
}

/** 레거시 — 특정 아이템이 속한 milestone 일수 */
export function getRequiredFlowDays(item: string, type: 'icon' | 'color'): number {
  const pack = getPackOfItem(item, type);
  if (pack === null) return 0; // 기본 셋
  // 팩이 어느 milestone에 도달했을 때 받을 수 있는지는 사용자 선택에 따라 다름.
  // 단순 표시 용도라면 첫 milestone(7일)을 반환.
  return UNLOCK_MILESTONES[0].flowDays;
}

/** 레거시 — 새 시스템에선 milestone만 반환 (icons/colors는 사용자 선택 후 결정) */
export function getNewlyUnlockedTiers(
  previousMaxFlow: number,
  currentMaxFlow: number
): RewardTier[] {
  return getNewlyReachedMilestones(previousMaxFlow, currentMaxFlow).map((m) => ({
    flowDays: m.flowDays,
  }));
}
