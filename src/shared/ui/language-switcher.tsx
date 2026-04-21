import { cn } from '@/shared/lib/cn';
import { Language } from '@/shared/i18n/language-context';
import { useI18n } from '@/shared/i18n/use-i18n';

const languages: Language[] = ['vi', 'en'];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      aria-label={t('common.language.label')}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white/72 p-1"
      role="group"
    >
      {languages.map((item) => (
        <button
          aria-pressed={language === item}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold transition',
            language === item
              ? 'bg-[var(--color-forest)] text-white'
              : 'text-[var(--color-ink-soft)] hover:bg-white hover:text-[var(--color-forest)]',
          )}
          key={item}
          onClick={() => setLanguage(item)}
          type="button"
        >
          {t(`common.language.${item}`)}
        </button>
      ))}
    </div>
  );
}
