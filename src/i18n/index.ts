import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ko from './locales/ko.json';
import en from './locales/en.json';

const SUPPORTED_LOCALES = ['ko', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function pickInitialLocale(): SupportedLocale {
  const primary = Localization.getLocales()[0]?.languageCode;
  return primary === 'ko' ? 'ko' : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: pickInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
