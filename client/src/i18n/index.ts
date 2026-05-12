import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

import es from './locales/es.json';
import en from './locales/en.json';
import pt from './locales/pt.json';

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
  },
  fallbackLng: 'es',
  detection: {
    lookupCookie: 'i18n_lang',
    caches: ['cookie'],
  },
});

const cookieLang = Cookies.get('i18n_lang');
if (cookieLang) {
  i18n.changeLanguage(cookieLang);
}

export default i18n;
