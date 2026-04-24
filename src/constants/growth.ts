export type GrowthStageId = 'seed' | 'sprout' | 'leaf' | 'stem' | 'bud' | 'bloom';

export interface GrowthStage {
  id: GrowthStageId;
  threshold: number;
  emoji: string;
  label: string;
}

export const GROWTH_STAGES: readonly GrowthStage[] = [
  { id: 'seed', threshold: 0, emoji: '🌰', label: '씨앗' },
  { id: 'sprout', threshold: 3, emoji: '🌱', label: '발아' },
  { id: 'leaf', threshold: 7, emoji: '🌿', label: '떡잎' },
  { id: 'stem', threshold: 14, emoji: '🎋', label: '줄기' },
  { id: 'bud', threshold: 30, emoji: '🌷', label: '꽃봉오리' },
  { id: 'bloom', threshold: 50, emoji: '🌸', label: '개화' },
] as const;

const PROXIMITY_HINT_DAYS = 3;

export function getCurrentStage(flowDays: number): GrowthStage {
  let current = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) {
    if (flowDays >= stage.threshold) current = stage;
  }
  return current;
}

export function getNextStage(flowDays: number): GrowthStage | null {
  for (const stage of GROWTH_STAGES) {
    if (stage.threshold > flowDays) return stage;
  }
  return null;
}

export function getDaysUntilNextStage(flowDays: number): number | null {
  const next = getNextStage(flowDays);
  return next ? next.threshold - flowDays : null;
}

export function shouldShowProximityHint(flowDays: number): boolean {
  const remaining = getDaysUntilNextStage(flowDays);
  return remaining !== null && remaining > 0 && remaining <= PROXIMITY_HINT_DAYS;
}
