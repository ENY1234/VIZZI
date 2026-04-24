import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { LANGUAGES, type Translations, translations } from '../translations';

const LANGUAGE_KEY = 'vizzi_language';

type LanguageContextType = {
  t: Translations;
  language: string;
  setLanguage: (code: string) => Promise<void>;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  t: translations.en,
  language: 'en',
  setLanguage: async () => {},
  isRTL: false,
});

function detectSystemLanguage(): string {
  const locale = Localization.getLocales()?.[0]?.languageCode ?? 'en';
  return translations[locale] ? locale : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      const lang = stored ?? detectSystemLanguage();
      applyLanguage(lang);
    })();
  }, []);

  function applyLanguage(code: string) {
    const lang = translations[code] ? code : 'en';
    const langInfo = LANGUAGES.find((l: { code: string; rtl: boolean }) => l.code === lang);
    const isRTL = langInfo?.rtl ?? false;
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
    setLanguageState(lang);
  }

  async function setLanguage(code: string) {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    applyLanguage(code);
  }

  const isRTL = LANGUAGES.find((l: { code: string; rtl: boolean }) => l.code === language)?.rtl ?? false;

  return (
    <LanguageContext.Provider value={{ t: translations[language], language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
