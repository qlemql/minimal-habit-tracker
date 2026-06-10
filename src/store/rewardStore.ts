import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PackId, PACK_IDS } from '@/constants/theme';
import {
  UNLOCK_MILESTONES,
  getNewlyReachedMilestones,
} from '@/constants/rewards';

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
        const { maxFlowEver, unlockedPacks, selectedUpcomingPack } = get();
        if (currentMaxFlow <= maxFlowEver) return;

        const reached = getNewlyReachedMilestones(maxFlowEver, currentMaxFlow);
        set({ maxFlowEver: currentMaxFlow });

        // 도달한 milestone들을 순서대로 처리
        let workingUnlocked = [...unlockedPacks];
        let workingSelected = selectedUpcomingPack;

        for (const m of reached) {
          const remaining = remainingPacks(workingUnlocked);
          if (remaining.length === 0) continue;

          // selectable=false (100일) 또는 남은 게 1개면 자동
          if (!m.selectable || remaining.length === 1) {
            const auto = remaining[0];
            workingUnlocked = [...workingUnlocked, auto];
            set({
              unlockedPacks: workingUnlocked,
              pendingPackUnlock: auto,
            });
            continue;
          }

          // 미리 선택한 게 있고 아직 해금 안 됐으면 자동 사용
          if (workingSelected && remaining.includes(workingSelected)) {
            workingUnlocked = [...workingUnlocked, workingSelected];
            set({
              unlockedPacks: workingUnlocked,
              pendingPackUnlock: workingSelected,
              selectedUpcomingPack: null,
            });
            workingSelected = null;
            continue;
          }

          // 안 골랐음 — 다이얼로그 표시 (한 번에 하나만)
          set({ pendingMilestoneChoice: m.flowDays });
          break; // 사용자가 다이얼로그 처리할 때까지 다음 milestone 대기
        }
      },

      chooseUpcomingPack: (id) => {
        set({ selectedUpcomingPack: id });
      },

      confirmMilestoneChoice: (id) => {
        const { unlockedPacks } = get();
        set({
          unlockedPacks: [...unlockedPacks, id],
          pendingPackUnlock: id,
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
