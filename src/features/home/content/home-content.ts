import type { AccentTone } from '@/features/shell/content/public-chrome-content';

export type FastenerType = 'pin' | 'tape' | 'washi';
export type FastenerPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'left-center'
  | 'right-center';

export type PolaroidMoment = {
  fastenerPosition: FastenerPosition;
  fastenerType: FastenerType;
  id: string;
  image: string;
  noteKey?: string;
  rotate: number;
  tone: AccentTone;
  titleKey: string;
};

export type MapStop = {
  descriptionKey: string;
  id: string;
  titleKey: string;
  tone: AccentTone;
  x: string;
  y: string;
};

export const polaroidMoments: PolaroidMoment[] = [
  {
    fastenerPosition: 'top-center',
    fastenerType: 'tape',
    id: 'ha-long-clouds',
    image:
      '/images/defaults/polaroid-ha-long.svg',
    noteKey: 'home.polaroids.haLong.note',
    rotate: -7,
    tone: 'leaf',
    titleKey: 'home.polaroids.haLong.title',
  },
  {
    fastenerPosition: 'top-right',
    fastenerType: 'pin',
    id: 'hue-wall',
    image:
      '/images/defaults/polaroid-hue.svg',
    rotate: 8,
    tone: 'sun',
    titleKey: 'home.polaroids.hue.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'washi',
    id: 'hoi-an-lantern',
    image:
      '/images/defaults/polaroid-hoi-an.svg',
    noteKey: 'home.polaroids.hoiAn.note',
    rotate: -6,
    tone: 'sky',
    titleKey: 'home.polaroids.hoiAn.title',
  },
  {
    fastenerPosition: 'top-right',
    fastenerType: 'tape',
    id: 'nha-trang-wave',
    image:
      '/images/defaults/polaroid-nha-trang.svg',
    rotate: 11,
    tone: 'coral',
    titleKey: 'home.polaroids.nhaTrang.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'pin',
    id: 'tam-coc-morning',
    image:
      '/images/defaults/polaroid-tam-coc.svg',
    noteKey: 'home.polaroids.tamCoc.note',
    rotate: -10,
    tone: 'sun',
    titleKey: 'home.polaroids.tamCoc.title',
  },
  {
    fastenerPosition: 'left-center',
    fastenerType: 'washi',
    id: 'mekong-evening',
    image:
      '/images/defaults/polaroid-mekong.svg',
    rotate: 6,
    tone: 'leaf',
    titleKey: 'home.polaroids.mekong.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'tape',
    id: 'da-lat-mist',
    image:
      '/images/defaults/polaroid-da-lat.svg',
    noteKey: 'home.polaroids.daLat.note',
    rotate: -8,
    tone: 'sky',
    titleKey: 'home.polaroids.daLat.title',
  },
  {
    fastenerPosition: 'top-center',
    fastenerType: 'pin',
    id: 'sapa-dawn',
    image:
      '/images/defaults/polaroid-sapa.svg',
    rotate: 7,
    tone: 'coral',
    titleKey: 'home.polaroids.sapa.title',
  },
  {
    fastenerPosition: 'top-right',
    fastenerType: 'washi',
    id: 'ha-giang-pass',
    image:
      '/images/defaults/polaroid-ha-giang.svg',
    noteKey: 'home.polaroids.haGiang.note',
    rotate: -5,
    tone: 'sky',
    titleKey: 'home.polaroids.haGiang.title',
  },
  {
    fastenerPosition: 'right-center',
    fastenerType: 'tape',
    id: 'da-nang-shore',
    image:
      '/images/defaults/polaroid-da-nang.svg',
    rotate: 9,
    tone: 'sun',
    titleKey: 'home.polaroids.daNang.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'pin',
    id: 'phu-quoc-sunset',
    image:
      '/images/defaults/polaroid-phu-quoc.svg',
    noteKey: 'home.polaroids.phuQuoc.note',
    rotate: -9,
    tone: 'coral',
    titleKey: 'home.polaroids.phuQuoc.title',
  },
  {
    fastenerPosition: 'top-center',
    fastenerType: 'tape',
    id: 'can-tho-market',
    image:
      '/images/defaults/polaroid-can-tho.svg',
    rotate: 5,
    tone: 'leaf',
    titleKey: 'home.polaroids.canTho.title',
  },
];

export const mapStops: MapStop[] = [
  {
    descriptionKey: 'home.map.locations.sapa.description',
    id: 'sapa',
    titleKey: 'home.map.locations.sapa.title',
    tone: 'sky',
    x: '48%',
    y: '10%',
  },
  {
    descriptionKey: 'home.map.locations.hanoi.description',
    id: 'hanoi',
    titleKey: 'home.map.locations.hanoi.title',
    tone: 'coral',
    x: '65%',
    y: '16%',
  },
  {
    descriptionKey: 'home.map.locations.hue.description',
    id: 'hue',
    titleKey: 'home.map.locations.hue.title',
    tone: 'sun',
    x: '78%',
    y: '48%',
  },
  {
    descriptionKey: 'home.map.locations.nhaTrang.description',
    id: 'nha-trang',
    titleKey: 'home.map.locations.nhaTrang.title',
    tone: 'leaf',
    x: '88%',
    y: '65%',
  },
  {
    descriptionKey: 'home.map.locations.saiGon.description',
    id: 'sai-gon',
    titleKey: 'home.map.locations.saiGon.title',
    tone: 'coral',
    x: '70%',
    y: '82%',
  },
];
