import {
  Check,
  Copy,
  ExternalLink,
  Lock,
  Megaphone,
  X,
} from 'lucide-react';
import type { Trip, TripVisibility } from '@/features/trips/types/trip';
import type { JournalVisibility } from '@/features/journal/types/journal';
import { useI18n } from '@/shared/i18n/use-i18n';
import { cn } from '@/shared/lib/cn';
import {
  useState,
} from 'react';

export type ProfileShareTargetKind = 'journal' | 'planner';
export type ProfileShareVisibility = TripVisibility | JournalVisibility;

export type ProfileShareTarget = {
  kind: ProfileShareTargetKind;
  trip: Trip;
  image: string;
  metadata: string;
  publicPath: string;
  title: string;
  visibility: ProfileShareVisibility;
};

type ProfileShareModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSaveVisibility: (visibility: ProfileShareVisibility) => Promise<void>;
  target: ProfileShareTarget;
};

const SHARE_MODES: Array<{
  icon: typeof Lock;
  value: ProfileShareVisibility;
}> = [
  {
    icon: Lock,
    value: 'private',
  },
  {
    icon: Megaphone,
    value: 'public',
  },
];

export function ProfileShareModal({
  isSaving,
  onClose,
  onSaveVisibility,
  target,
}: ProfileShareModalProps) {
  const { t } = useI18n();
  const [selectedVisibility, setSelectedVisibility] = useState<ProfileShareVisibility>(
    target.visibility,
  );
  const [didCopy, setDidCopy] = useState(false);
  const shareUrl = buildShareUrl(target.publicPath);
  const isLinkVisible = selectedVisibility !== 'private';

  const copyShareLink = async () => {
    if (!isLinkVisible) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setDidCopy(true);
    } catch {
      setDidCopy(false);
    }
  };

  return (
    <div
      aria-labelledby="profile-share-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#251b15]/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <section className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[0.85rem] border border-[#eadbc5] bg-[#fffdfa] p-5 shadow-[0_24px_70px_rgba(37,27,21,0.28)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="section-label">{t('profile.share.eyebrow')}</p>
            <h2
              className="mt-1 font-cursive text-[2rem] font-bold leading-none text-[#251b15]"
              id="profile-share-title"
            >
              {target.kind === 'journal'
                ? t('profile.share.titleJournal')
                : t('profile.share.titlePlanner')}
            </h2>
          </div>
          <button
            aria-label={t('profile.share.close')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c5ab] bg-white text-[#6b4938] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" strokeWidth={2.3} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <img
            alt={target.title}
            className="h-40 w-full rounded-[0.65rem] object-cover shadow-[0_12px_24px_rgba(76,51,33,0.16)] sm:h-full"
            src={target.image}
          />
          <div className="rounded-[0.65rem] border border-[#eadbc5] bg-[#fff8ea]/70 p-4">
            <p className="font-marker text-[0.95rem] leading-tight text-[#8b6244]">
              {target.metadata}
            </p>
            <h3 className="mt-2 font-cursive text-[1.7rem] font-bold leading-none text-[#251b15]">
              {target.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#5f5146]">
              {t('profile.share.description')}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-marker text-[1rem] font-bold leading-tight text-[#3d332b]">
            {t('profile.share.modeLabel')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SHARE_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedVisibility === mode.value;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'min-h-[8rem] rounded-[0.65rem] border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25',
                    isSelected
                      ? 'border-[#3a5d25]/45 bg-[#f1ffd8] shadow-[0_6px_0_#c6d999]'
                      : 'border-[#eadbc5] bg-white/75 hover:-translate-y-0.5',
                  )}
                  key={mode.value}
                  onClick={() => {
                    setSelectedVisibility(mode.value);
                    setDidCopy(false);
                  }}
                  type="button"
                >
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1d9] text-[#6b4938]">
                    <Icon className="h-5 w-5" strokeWidth={2.3} />
                  </span>
                  <span className="block font-marker text-[1rem] font-bold leading-none text-[#251b15]">
                    {t(`profile.share.modes.${mode.value}.title`)}
                  </span>
                  <span className="mt-2 block text-sm leading-5 text-[#5f5146]">
                    {t(`profile.share.modes.${mode.value}.description`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[0.65rem] border border-dashed border-[#d8c5ab] bg-[#fff8ea]/55 p-4">
          {isLinkVisible ? (
            <>
              <label
                className="mb-2 block font-marker text-[0.95rem] font-bold leading-tight text-[#3d332b]"
                htmlFor="profile-share-link"
              >
                {t('profile.share.linkLabel')}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="min-w-0 flex-1 rounded-full border border-[#d8c5ab] bg-white px-4 py-2 text-sm text-[#3d332b] focus:outline-none focus:ring-2 focus:ring-[#8b6244]/20"
                  id="profile-share-link"
                  readOnly
                  value={shareUrl}
                />
                <button
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#3a5d25]/30 bg-[#b9e177] px-4 py-2 font-marker font-bold leading-none text-[#172612] shadow-[0_5px_0_#6f9e44] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#6f9e44]/30"
                  onClick={() => void copyShareLink()}
                  type="button"
                >
                  {didCopy ? (
                    <Check className="h-4 w-4" strokeWidth={2.3} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={2.3} />
                  )}
                  {didCopy ? t('profile.share.copied') : t('profile.share.copy')}
                </button>
                <a
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#7b4d22]/25 bg-[#ffe4a8] px-4 py-2 font-marker font-bold leading-none text-[#6b3b18] shadow-[0_5px_0_#d7a957] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d7a957]/25"
                  href={shareUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={2.3} />
                  {t('profile.share.openPublic')}
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-[#5f5146]">
              {t('profile.share.privateNotice')}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            className="rounded-full border border-[#d8c5ab] bg-white/70 px-5 py-2 font-marker font-bold leading-none text-[#6b4938] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#8b6244]/25"
            onClick={onClose}
            type="button"
          >
            {t('profile.share.cancel')}
          </button>
          <button
            className="rounded-full border border-[#3a5d25]/40 bg-[#3a5d25] px-5 py-2 font-marker font-bold leading-none text-white shadow-[0_5px_0_#243b18] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#3a5d25]/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
            disabled={isSaving}
            onClick={() => void onSaveVisibility(selectedVisibility)}
            type="button"
          >
            {isSaving ? t('profile.share.saving') : t('profile.share.save')}
          </button>
        </div>
      </section>
    </div>
  );
}

function buildShareUrl(path: string) {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
