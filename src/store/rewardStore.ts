import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REWARD_TIERS, getNewlyUnlockedTiers, RewardTier } from '@/constants/rewards';

interface RewardStore {
  /** 지금까지 달성한 최대 흐름 일수 (어떤 습관이든) */
  maxFlowEver: number;
  /** 마지막으로 해금 알림을 표시한 티어의 flowDays */
  lastNotifiedTier: number;
  /** 현재 표시할 해금 알림 (null이면 없음) */
  pendingUnlock: RewardTier | null;

  /** 흐름 변경 시 호출 — 새 해금이 있으면 pendingUnlock 설정 */
  checkUnlocks: (currentMaxFlow: number) => void;
  /** 해금 알림 확인 후 호출 */
  dismissUnlock: () => void;
}

export const useRewardStore = create<RewardStore>()(
  persist(
    (set, get) => ({
      maxFlowEver: 0,
      lastNotifiedTier: 0,
      pendingUnlock: null,

      checkUnlocks: (currentMaxFlow: number) => {
        const { maxFlowEver, lastNotifiedTier } = get();

        if (currentMaxFlow <= maxFlowEver) return;

        const newTiers = getNewlyUnlockedTiers(maxFlowEver, currentMaxFlow);

        set({ maxFlowEver: currentMaxFlow });

        if (newTiers.length > 0) {
          // 가장 높은 티어만 알림 (여러 개 동시 해금 시)
          const highestTier = newTiers[newTiers.length - 1];
          if (highestTier.flowDays > lastNotifiedTier) {
            set({
              pendingUnlock: highestTier,
              lastNotifiedTier: highestTier.flowDays,
            });
          }
        }
      },

      dismissUnlock: () => {
        set({ pendingUnlock: null });
      },
    }),
    {
      name: 'reward-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted) => persisted as any,
      partialize: (state) => ({
        maxFlowEver: state.maxFlowEver,
        lastNotifiedTier: state.lastNotifiedTier,
      }),
    }
  )
);
