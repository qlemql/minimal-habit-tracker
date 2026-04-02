import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingStore {
  completed: boolean;
  setCompleted: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      completed: false,
      setCompleted: () => set({ completed: true }),
      resetOnboarding: () => set({ completed: false }),
    }),
    {
      name: 'onboarding-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => persisted as any,
    }
  )
);
