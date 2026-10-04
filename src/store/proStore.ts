import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface ProStore {
  isPro: boolean;
  setPro: (value: boolean) => void;
}
export const useProStore = create<ProStore>()(
  persist((set) => ({ isPro: false, setPro: (isPro) => set({ isPro }) }), {
    name: 'pro-store',
    version: 2,
    storage: createJSONStorage(() => AsyncStorage),
    migrate: () => ({ isPro: false }),
  }),
);
