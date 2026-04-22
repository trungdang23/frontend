import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  Language,
  LanguageContext,
  LanguageContextValue,
  TranslationValues,
} from '@/shared/i18n/language-context';
import vi from '@/shared/i18n/locales/vi.json';

function applyDocumentLanguage(language: Language) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
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
  const language: Language = 'vi';

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const messages = vi;

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
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));
    },
    [],
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: () => undefined,
      t,
      formatDate,
    }),
    [formatDate, language, t],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}
