/**
 * @file MIND MASTERY — i18n initialization.
 *
 * Sets up i18next with Russian as the default (and only) language.
 * Import this module once at the app root: `import '@/i18n';`
 *
 * UI chrome strings are loaded from src/i18n/locales/ru.ts.
 * Practice narration texts live in content/texts/ and are loaded at runtime.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: ru,
    },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
