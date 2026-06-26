import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PackId, PACK_IDS } from '@/constants/theme';
import { UNLOCK_MILESTONES } from '@/constants/rewards';

interface RewardStore {
  /** 지금까지 달성한 최대 흐름 일수 (어떤 습관이든) */
  maxFlowEver: number;
  /** 이미 해금된 팩 목록 */
  unlockedPacks: PackId[];
  /** 다음 마일스톤에 받기로 미리 골라둔 팩 (없으면 null — 도달 시 다이얼로그) */
  selectedUpcomingPack: PackId | null;
  /** UnlockToast로 표시할 방금 해금된 팩 */
  pendingPackUnlock: PackId | null;
  /** 사용자가 미리 선택 안 한 채로 도달한 milestone — 다이얼로그 표시용 (flowDays) */
  pendingMilestoneChoice: number | null;

  /** 흐름 변경 시 호출 — 도달한 milestone 평가 + 자동/대기 unlock */
  checkUnlocks: (currentMaxFlow: number) => void;
  /** 통계 화면에서 다음 milestone에 받을 팩 미리 골라둠 */
  chooseUpcomingPack: (id: PackId | null) => void;
  /** 마일스톤 도달 다이얼로그에서 사용자가 팩 확정 */
  confirmMilestoneChoice: (id: PackId) => void;
  /** UnlockToast 닫기 */
  dismissPackUnlock: () => void;
}

/** 남은(아직 해금 안 된) 팩 */
function remainingPacks(unlocked: PackId[]): PackId[] {
  return PACK_IDS.filter((p) => !unlocked.includes(p));
}

export const useRewardStore = create<RewardStore>()(
  persist(
    (set, get) => ({
      maxFlowEver: 0,
      unlockedPacks: [],
      selectedUpcomingPack: null,
      pendingPackUnlock: null,
      pendingMilestoneChoice: null,

      checkUnlocks: (currentMaxFlow: number) => {
        const s = get();
        // 처리 대기 중인 보상 UI가 있으면, 그게 닫힐 때까지 대기 — 한 번에 하나만
        if (s.pendingMilestoneChoice != null || s.pendingPackUnlock != null) return;
        if (currentMaxFlow <= s.maxFlowEver) return;

        // maxFlowEver 다음으로 '새로 도달한' 첫 마일스톤 하나만 처리
        const next = UNLOCK_MILESTONES.find(
          (m) => m.flowDays > s.maxFlowEver && m.flowDays <= currentMaxFlow
        );
        if (!next) {
          set({ maxFlowEver: currentMaxFlow });
          return;
        }

        const remaining = remainingPacks(s.unlockedPacks);
        if (remaining.length === 0) {
          set({ maxFlowEver: currentMaxFlow });
          return;
        }

        // 진도는 이 마일스톤까지만 — 다음 것은 보상 UI가 닫힌 뒤 다음 checkUnlocks에서
        if (!next.selectable || remaining.length === 1) {
          // 100일(자동) 또는 남은 게 1개 — 자동 해금 + 토스트
          set({
            maxFlowEver: next.flowDays,
            unlockedPacks: [...s.unlockedPacks, remaining[0]],
            pendingPackUnlock: remaining[0],
          });
        } else if (s.selectedUpcomingPack && remaining.includes(s.selectedUpcomingPack)) {
          // 미리 골라둔 게 있으면 자동 적용 + 토스트
          set({
            maxFlowEver: next.flowDays,
            unlockedPacks: [...s.unlockedPacks, s.selectedUpcomingPack],
            pendingPackUnlock: s.selectedUpcomingPack,
            selectedUpcomingPack: null,
          });
        } else {
          // 안 골랐음 — 선택 다이얼로그. maxFlowEver는 confirm 시 전진
          // (다이얼로그 도중 앱 종료돼도 재진입 시 다시 떠서 보상 누락 방지)
          set({ pendingMilestoneChoice: next.flowDays });
        }
      },

      chooseUpcomingPack: (id) => {
        set({ selectedUpcomingPack: id });
      },

      confirmMilestoneChoice: (id) => {
        // 다이얼로그에서 직접 고른 순간이 곧 보상 확인 — 토스트 중복 노출 안 함
        // 확정 시점에 진도(maxFlowEver)를 해당 마일스톤까지 전진
        const { unlockedPacks, maxFlowEver, pendingMilestoneChoice } = get();
        set({
          unlockedPacks: [...unlockedPacks, id],
          maxFlowEver: Math.max(maxFlowEver, pendingMilestoneChoice ?? maxFlowEver),
          pendingMilestoneChoice: null,
          selectedUpcomingPack: null,
        });
      },

      dismissPackUnlock: () => {
        set({ pendingPackUnlock: null });
      },
    }),
    {
      name: 'reward-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: any, version: number) => {
        // v1 → v2 마이그레이션: 기존 lastNotifiedTier/pendingUnlock 제거, unlockedPacks 빈 배열로 시작
        // maxFlowEver는 그대로 → 다음 checkUnlocks에서 도달 milestone 평가됨
        if (version < 2) {
          return {
            maxFlowEver: persisted?.maxFlowEver ?? 0,
            unlockedPacks: [],
            selectedUpcomingPack: null,
            pendingPackUnlock: null,
            pendingMilestoneChoice: null,
          };
        }
        return persisted;
      },
      partialize: (state) => ({
        maxFlowEver: state.maxFlowEver,
        unlockedPacks: state.unlockedPacks,
        selectedUpcomingPack: state.selectedUpcomingPack,
      }),
    }
  )
);
