import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observeHydration } from '@/renewal/persistenceHealth';
interface ProStore {
  isPro: boolean;
  setPro: (value: boolean) => void;
}
export const useProStore = create<ProStore>()(
  persist<ProStore, [], [], Pick<ProStore, 'isPro'>>((set) => ({ isPro: false, setPro: (isPro) => set({ isPro }) }), {
    name: 'pro-store',
    version: 2,
    onRehydrateStorage: observeHydration('pro-store'),
    storage: createJSONStorage(() => AsyncStorage),
    migrate: () => ({ isPro: false }),
  }),
);
