import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  // 잠금화면(또는 알림센터) 알림에 "완료" 액션 버튼 노출 여부
  lockScreenActionEnabled: boolean;
  setLockScreenActionEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      lockScreenActionEnabled: true,

      setLockScreenActionEnabled: (enabled) =>
        set({ lockScreenActionEnabled: enabled }),
    }),
    {
      name: 'settings-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
