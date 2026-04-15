import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Language,
  LanguageContext,
  LanguageContextValue,
  TranslationValues,
} from '@/shared/i18n/language-context';
import en from '@/shared/i18n/locales/en.json';
import vi from '@/shared/i18n/locales/vi.json';

const LANGUAGE_STORAGE_KEY = 'journey.language';

const dictionaries = {
  en,
  vi,
} as const;

function applyDocumentLanguage(language: Language) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage = window.localStorage;

  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function'
  ) {
    return null;
  }

  return storage;
}

function getInitialLanguage(): Language {
  const storage = getStorage();
  const storedLanguage = storage?.getItem(LANGUAGE_STORAGE_KEY);

  if (storedLanguage === 'vi' || storedLanguage === 'en') {
    applyDocumentLanguage(storedLanguage);
    return storedLanguage;
  }

  applyDocumentLanguage('vi');
  return 'vi';
}

function getMessageValue(source: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source);

  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const value = values[key];

    return value === undefined ? `{{${key}}}` : String(value);
  });
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    applyDocumentLanguage(language);

    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const messages = dictionaries[language];

  const t = useCallback(
    (key: string, values?: TranslationValues) => {
      const message = getMessageValue(messages, key);

      if (!message) {
        return key;
      }

      return interpolate(message, values);
    },
    [messages],
  );

  const formatDate = useCallback(
    (value: Date | number | string) => {
      const locale = language === 'vi' ? 'vi-VN' : 'en-US';

      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));
    },
    [language],
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      formatDate,
    }),
    [formatDate, language, t],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}
