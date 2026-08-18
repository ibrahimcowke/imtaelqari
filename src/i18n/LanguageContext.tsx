import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type AppLanguage, type TranslationKey } from './translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, defaultText?: string) => string;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('imta_app_lang') as AppLanguage;
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar'; // Default classical Arabic
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      localStorage.setItem('imta_app_lang', language);
    }
  }, [language, dir]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: TranslationKey, defaultText?: string): string => {
    const langDict = translations[language];
    if (langDict && key in langDict) {
      return langDict[key];
    }
    const fallbackDict = translations.ar;
    if (fallbackDict && key in fallbackDict) {
      return fallbackDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
        dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
