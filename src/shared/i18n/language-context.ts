import { createContext } from 'react';

export type Language = 'vi' | 'en';

export type TranslationValues = Record<string, number | string>;

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: TranslationValues) => string;
  formatDate: (value: Date | number | string) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
