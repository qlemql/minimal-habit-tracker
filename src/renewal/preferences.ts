import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { copies } from './copy';
import type { Language } from './copy';
const code = getLocales()[0]?.languageCode;
const initial: Language = code === 'ko' || code === 'ja' ? code : code === 'zh' ? 'zh-TW' : 'en';
interface Preferences {
  language: Language;
  welcomed: boolean;
  example: boolean;
  setLanguage: (language: Language) => void;
  welcome: () => void;
  setExample: (value: boolean) => void;
}
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      language: initial,
      welcomed: false,
      example: false,
      setLanguage: (language) => set({ language }),
      welcome: () => set({ welcomed: true }),
      setExample: (example) => set({ example }),
    }),
    { name: 'ssak-preferences', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
export const useCopy = () => copies[usePreferences((state) => state.language)];
