import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  // 잠금화면(또는 알림센터) 알림에 "완료" 액션 버튼 노출 여부
  lockScreenActionEnabled: boolean;
  setLockScreenActionEnabled: (enabled: boolean) => void;

  // 50일 자동 졸업 제안 — habitId당 1회만 발동. 거절(또는 수락) 후 다시 안 묻기.
  graduationProposedFor: Record<string, boolean>;
  markGraduationProposed: (habitId: string) => void;
  hasGraduationBeenProposed: (habitId: string) => boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      lockScreenActionEnabled: true,

      setLockScreenActionEnabled: (enabled) =>
        set({ lockScreenActionEnabled: enabled }),

      graduationProposedFor: {},

      markGraduationProposed: (habitId) =>
        set((state) => ({
          graduationProposedFor: { ...state.graduationProposedFor, [habitId]: true },
        })),

      hasGraduationBeenProposed: (habitId) => !!get().graduationProposedFor[habitId],
    }),
    {
      name: 'settings-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
