import type { CSSProperties } from 'react';
import { ImageOff } from 'lucide-react';
import type {
  JournalSceneObject,
  TripJournal,
} from '@/features/journal/types/journal';
import { cn } from '@/shared/lib/cn';

type JournalSceneRendererProps = {
  journal: TripJournal;
  className?: string;
  emptyDescription: string;
  emptyTitle: string;
};

export function JournalSceneRenderer({
  emptyDescription,
  emptyTitle,
  journal,
  className,
}: JournalSceneRendererProps) {
  const orderedObjects = [...journal.objects].sort((left, right) => {
    if (left.zIndex !== right.zIndex) {
      return left.zIndex - right.zIndex;
    }

    return left.id.localeCompare(right.id);
  });
  const aspectRatio = `${journal.page.width} / ${journal.page.height}`;

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[min(74vh,46rem)] rounded-[1.5rem] border border-[#c79b70]/45 bg-[#fff8ea] shadow-[0_22px_50px_rgba(82,61,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]',
        className,
      )}
      style={{
        aspectRatio,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.46),transparent_32%),radial-gradient(circle_at_18%_16%,rgba(194,137,83,0.12),transparent_18%),linear-gradient(180deg,#fffaf0_0%,#f7e8cb_100%)]">
        <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#8d7258_0.8px,transparent_0.8px)] [background-size:22px_22px]" />

        {orderedObjects.length === 0 ? (
          <div className="absolute left-[12%] top-[18%] w-[76%] rotate-[-3deg] rounded-[0.8rem] border border-[#d8b982]/70 bg-[#fff4c7] px-6 py-7 text-center shadow-[0_14px_26px_rgba(92,68,43,0.16)]">
            <p className="font-hand text-[2.1rem] leading-none text-[#7a4b39]">
              {emptyTitle}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6f5c48]">
              {emptyDescription}
            </p>
          </div>
        ) : null}

        {orderedObjects.map((object) => (
          <JournalSceneObjectView
            key={object.id}
            object={object}
            pageHeight={journal.page.height}
            pageWidth={journal.page.width}
          />
        ))}
      </div>
    </div>
  );
}

type JournalSceneObjectViewProps = {
  object: JournalSceneObject;
  pageWidth: number;
  pageHeight: number;
};

function JournalSceneObjectView({
  object,
  pageHeight,
  pageWidth,
}: JournalSceneObjectViewProps) {
  const style: CSSProperties = {
    left: `${(object.x / pageWidth) * 100}%`,
    top: `${(object.y / pageHeight) * 100}%`,
    width: `${(object.width / pageWidth) * 100}%`,
    height: `${(object.height / pageHeight) * 100}%`,
    transform: `rotate(${object.rotation}deg)`,
    zIndex: object.zIndex,
  };

  return (
    <div className="absolute origin-center" style={style}>
      {renderJournalObject(object)}
    </div>
  );
}

function renderJournalObject(object: JournalSceneObject) {
  switch (object.type) {
    case 'photo':
      return <PhotoObject object={object} />;
    case 'sticker':
      return <StickerObject object={object} />;
    case 'tape':
      return <TapeObject object={object} />;
    case 'note':
    default:
      return <NoteObject object={object} />;
  }
}

function PhotoObject({ object }: { object: JournalSceneObject }) {
  const imageUrl = getUrlProp(object.props, 'imageUrl') ?? getUrlProp(object.props, 'src');
  const alt = getStringProp(object.props, 'alt') ?? '';

  return (
    <div className="h-full w-full rounded-[0.7rem] border-[0.55rem] border-white bg-white shadow-[0_14px_26px_rgba(70,50,32,0.2)]">
      {imageUrl ? (
        <img
          alt={alt}
          className="h-full w-full rounded-[0.28rem] object-cover"
          src={imageUrl}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[0.28rem] bg-[#ead7b7] text-[#8a6d51]">
          <ImageOff aria-hidden="true" className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

function NoteObject({ object }: { object: JournalSceneObject }) {
  const text = getStringProp(object.props, 'text') ?? '';
  const color = getColorProp(object.props, 'color') ?? '#fff4c7';

  return (
    <div
      className="flex h-full w-full items-center rounded-[0.8rem] border border-[#d8b982]/70 px-4 py-3 font-hand text-[1.15rem] leading-tight text-[#71412e] shadow-[0_12px_24px_rgba(92,68,43,0.14)] sm:text-[1.45rem] md:text-[1.7rem]"
      style={{ backgroundColor: color }}
    >
      <span className="line-clamp-5">{text}</span>
    </div>
  );
}

function StickerObject({ object }: { object: JournalSceneObject }) {
  const label =
    getStringProp(object.props, 'label') ??
    getStringProp(object.props, 'stickerKey') ??
    '';
  const color = getColorProp(object.props, 'color') ?? '#f2a088';

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border border-white/70 px-2 text-center font-hand text-[0.95rem] font-bold leading-none text-[#5d382b] shadow-[0_10px_20px_rgba(92,68,43,0.18)] sm:text-[1.15rem] md:text-[1.35rem]"
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}

function TapeObject({ object }: { object: JournalSceneObject }) {
  const color = getColorProp(object.props, 'color') ?? '#f2cc6f';

  return (
    <div
      className="h-full w-full border border-white/30 opacity-80 shadow-[0_6px_12px_rgba(92,68,43,0.12)] [clip-path:polygon(3%_0,100%_6%,96%_100%,0_91%)]"
      style={{ backgroundColor: color }}
    />
  );
}

function getStringProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getUrlProp(props: Record<string, unknown>, key: string) {
  const value = getStringProp(props, key);

  if (value === null) {
    return null;
  }

  if (value.startsWith('/')) {
    return value;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

function getColorProp(props: Record<string, unknown>, key: string) {
  const value = getStringProp(props, key);

  if (value === null) {
    return null;
  }

  return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : null;
}
