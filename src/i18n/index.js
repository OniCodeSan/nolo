import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ALL_CODES } from './langs.js';
import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';

// i18next con 6 lingue: italiano (default, a root) + en/es/de/pt/fr (prefisso URL).
// La lingua effettiva è guidata dall'URL (main.jsx: changeLanguage sul prefisso).
// Le chiavi mancanti nelle lingue tradotte ricadono sull'italiano (fallbackLng).
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      en: { translation: en },
      es: { translation: es },
      de: { translation: de },
      pt: { translation: pt },
      fr: { translation: fr },
    },
    fallbackLng: 'it',
    supportedLngs: ALL_CODES,
    nonExplicitSupportedLngs: true, // 'en-GB' → 'en'
    interpolation: { escapeValue: false }, // React già lo fa
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'moviq_lang',
    },
    returnEmptyString: false,
  });

export default i18n;
