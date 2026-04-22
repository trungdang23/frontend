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
      'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=700&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1739843752812-f87723746525?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    rotate: 8,
    tone: 'sun',
    titleKey: 'home.polaroids.hue.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'washi',
    id: 'hoi-an-lantern',
    image:
      'https://images.unsplash.com/photo-1552014342-fa1a88c10d33?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
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
      'https://images.unsplash.com/photo-1570366290364-5e76a15ae408?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    rotate: 11,
    tone: 'coral',
    titleKey: 'home.polaroids.nhaTrang.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'pin',
    id: 'tam-coc-morning',
    image:
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=700&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=700&auto=format&fit=crop',
    rotate: 6,
    tone: 'leaf',
    titleKey: 'home.polaroids.mekong.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'tape',
    id: 'da-lat-mist',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=700&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1579613035165-708cc6bc87d4?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    rotate: 7,
    tone: 'coral',
    titleKey: 'home.polaroids.sapa.title',
  },
  {
    fastenerPosition: 'top-right',
    fastenerType: 'washi',
    id: 'ha-giang-pass',
    image:
      'https://images.unsplash.com/photo-1529154036614-a60975f5c760?q=80&w=700&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=700&auto=format&fit=crop',
    rotate: 9,
    tone: 'sun',
    titleKey: 'home.polaroids.daNang.title',
  },
  {
    fastenerPosition: 'top-left',
    fastenerType: 'pin',
    id: 'phu-quoc-sunset',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop',
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
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=700&auto=format&fit=crop',
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
