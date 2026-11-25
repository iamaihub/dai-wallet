import { Platform, NativeModules } from 'react-native';
import { SUPPORTED_LANGUAGES } from '../constants';

// NOTE: The full translations object has been moved out of App.js for cleanliness.
// For even better open-source structure, these can be split into individual files:
//   src/i18n/locales/en.js, zh.js, es.js, etc.

import { translations } from './translations';

export { SUPPORTED_LANGUAGES };

// Older builds stored ISO codes. The site uses cn / arab / farsi / hk.
const CODE_ALIAS = {
  zh: 'cn', cn: 'cn', yue: 'hk', hk: 'hk',
  ar: 'arab', arab: 'arab',
  fa: 'farsi', farsi: 'farsi', pes: 'farsi',
};

export function normalizeLanguageCode(code) {
  const raw = String(code || '').toLowerCase().replace(/_/g, '-');
  if (!raw) return 'en';
  if (
    raw.startsWith('zh-hk') || raw.startsWith('zh-mo') || raw.startsWith('zh-tw') ||
    raw.startsWith('zh-hant') || raw.startsWith('yue')
  ) return 'hk';
  if (raw === 'en-sg' || raw.startsWith('en-sg')) return 'sg';
  if (CODE_ALIAS[raw]) return CODE_ALIAS[raw];
  const primary = raw.split('-')[0];
  if (primary === 'zh') return 'cn';
  if (CODE_ALIAS[primary]) return CODE_ALIAS[primary];
  return primary;
}

const warnedLanguages = new Set();

export function createTranslator(lang) {
  const code = normalizeLanguageCode(lang);
  return (key, params = {}) => {
    const hasLang = !!translations[code];
    const dict = hasLang ? translations[code] : (translations.en || {});

    if (!hasLang && code !== 'en' && !warnedLanguages.has(code)) {
      warnedLanguages.add(code);
      console.warn(`[i18n] No full translations found for language "${code}". Falling back to English. (Add data to src/i18n/translations.js)`);
    }

    let str = dict[key] !== undefined
      ? dict[key]
      : (translations.en?.[key] !== undefined ? translations.en[key] : key);

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(k => {
        const val = params[k] != null ? String(params[k]) : '';
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), val);
      });
    }
    return str;
  };
}

export function detectDefaultLanguage() {
  try {
    let locale = 'en';
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings || {};
      locale = settings.AppleLocale ||
               (settings.AppleLanguages && settings.AppleLanguages[0]) ||
               'en';
    } else {
      locale = NativeModules.I18nManager?.localeIdentifier || 'en_US';
    }

    const code = normalizeLanguageCode(locale);
    const supported = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return supported ? code : 'en';
  } catch {
    return 'en';
  }
}

// Convenience hook-style helper (can be expanded with useContext later)
export function useI18n(language, changeLanguage) {
  const t = createTranslator(language);
  return { t, language, changeLanguage };
}
