export type NavNoteTone = 'sun' | 'sky' | 'paper' | 'leaf' | 'coral';
export type NavNoteShape =
  | 'fold-right'
  | 'torn-bottom'
  | 'notebook'
  | 'straight'
  | 'fold-left';
export type FastenerType = 'pin' | 'tape' | 'washi';
export type FastenerPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'left-center'
  | 'right-center';
export type AccentTone = 'sun' | 'sky' | 'leaf' | 'coral';

export type HomeNavItem = {
  anchorId: string;
  labelKey: string;
  rotate: number;
  shape: NavNoteShape;
  tone: NavNoteTone;
  yOffset: number;
};

export type PolaroidMoment = {
  desktopX: number;
  desktopY: number;
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

export type PreviewCard = {
  anchorId: string;
  descriptionKey: string;
  detailKeys: [string, string];
  eyebrowKey: string;
  icon: 'community' | 'planner' | 'journal' | 'profile';
  id: 'community' | 'planner' | 'journal' | 'profile';
  titleKey: string;
  tone: AccentTone;
};

export type FooterLink = {
  href: string;
  labelKey: string;
};

export type SocialStamp = {
  id: 'facebook' | 'instagram' | 'music' | 'youtube';
  labelKey: string;
  rotate: number;
  tone: AccentTone;
};

export const homeNavItems: HomeNavItem[] = [
  {
    anchorId: 'home',
    labelKey: 'home.navigation.home',
    rotate: -4,
    shape: 'fold-right',
    tone: 'sun',
    yOffset: 4,
  },
  {
    anchorId: 'community',
    labelKey: 'home.navigation.community',
    rotate: 3,
    shape: 'torn-bottom',
    tone: 'sky',
    yOffset: -4,
  },
  {
    anchorId: 'planner',
    labelKey: 'home.navigation.planner',
    rotate: -2,
    shape: 'notebook',
    tone: 'paper',
    yOffset: 7,
  },
  {
    anchorId: 'journal',
    labelKey: 'home.navigation.journal',
    rotate: 5,
    shape: 'straight',
    tone: 'leaf',
    yOffset: -1,
  },
  {
    anchorId: 'profile',
    labelKey: 'home.navigation.profile',
    rotate: -3,
    shape: 'fold-left',
    tone: 'coral',
    yOffset: 5,
  },
];

export const polaroidMoments: PolaroidMoment[] = [
  {
    desktopX: 49,
    desktopY: 12,
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
    desktopX: 76,
    desktopY: 23,
    fastenerPosition: 'top-right',
    fastenerType: 'pin',
    id: 'hue-wall',
    image:
      'https://images.unsplash.com/photo-1599341626413-989d3c7d1e8c?q=80&w=700&auto=format&fit=crop',
    rotate: 8,
    tone: 'sun',
    titleKey: 'home.polaroids.hue.title',
  },
  {
    desktopX: 85,
    desktopY: 50,
    fastenerPosition: 'right-center',
    fastenerType: 'washi',
    id: 'hoi-an-lantern',
    image:
      'https://images.unsplash.com/photo-1555931031-137bc83c3167?q=80&w=700&auto=format&fit=crop',
    noteKey: 'home.polaroids.hoiAn.note',
    rotate: -6,
    tone: 'sky',
    titleKey: 'home.polaroids.hoiAn.title',
  },
  {
    desktopX: 77,
    desktopY: 78,
    fastenerPosition: 'top-center',
    fastenerType: 'tape',
    id: 'nha-trang-wave',
    image:
      'https://images.unsplash.com/photo-1559592442-741e6b856e72?q=80&w=700&auto=format&fit=crop',
    rotate: 11,
    tone: 'coral',
    titleKey: 'home.polaroids.nhaTrang.title',
  },
  {
    desktopX: 50,
    desktopY: 87,
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
    desktopX: 22,
    desktopY: 76,
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
    desktopX: 13,
    desktopY: 47,
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
    desktopX: 24,
    desktopY: 22,
    fastenerPosition: 'top-center',
    fastenerType: 'pin',
    id: 'sapa-dawn',
    image:
      'https://images.unsplash.com/photo-1563821010041-3b5674066ee6?q=80&w=700&auto=format&fit=crop',
    rotate: 7,
    tone: 'coral',
    titleKey: 'home.polaroids.sapa.title',
  },
];

export const mapStops: MapStop[] = [
  {
    descriptionKey: 'home.map.locations.sapa.description',
    id: 'sapa',
    titleKey: 'home.map.locations.sapa.title',
    tone: 'sky',
    x: '38%',
    y: '16%',
  },
  {
    descriptionKey: 'home.map.locations.hanoi.description',
    id: 'hanoi',
    titleKey: 'home.map.locations.hanoi.title',
    tone: 'coral',
    x: '56%',
    y: '24%',
  },
  {
    descriptionKey: 'home.map.locations.hue.description',
    id: 'hue',
    titleKey: 'home.map.locations.hue.title',
    tone: 'sun',
    x: '62%',
    y: '48%',
  },
  {
    descriptionKey: 'home.map.locations.nhaTrang.description',
    id: 'nha-trang',
    titleKey: 'home.map.locations.nhaTrang.title',
    tone: 'leaf',
    x: '69%',
    y: '66%',
  },
  {
    descriptionKey: 'home.map.locations.saiGon.description',
    id: 'sai-gon',
    titleKey: 'home.map.locations.saiGon.title',
    tone: 'coral',
    x: '60%',
    y: '83%',
  },
];

export const homePreviewCards: PreviewCard[] = [
  {
    anchorId: 'community',
    descriptionKey: 'home.previews.community.description',
    detailKeys: [
      'home.previews.community.detailOne',
      'home.previews.community.detailTwo',
    ],
    eyebrowKey: 'home.previews.community.eyebrow',
    icon: 'community',
    id: 'community',
    titleKey: 'home.previews.community.title',
    tone: 'sun',
  },
  {
    anchorId: 'planner',
    descriptionKey: 'home.previews.planner.description',
    detailKeys: [
      'home.previews.planner.detailOne',
      'home.previews.planner.detailTwo',
    ],
    eyebrowKey: 'home.previews.planner.eyebrow',
    icon: 'planner',
    id: 'planner',
    titleKey: 'home.previews.planner.title',
    tone: 'sky',
  },
  {
    anchorId: 'journal',
    descriptionKey: 'home.previews.journal.description',
    detailKeys: [
      'home.previews.journal.detailOne',
      'home.previews.journal.detailTwo',
    ],
    eyebrowKey: 'home.previews.journal.eyebrow',
    icon: 'journal',
    id: 'journal',
    titleKey: 'home.previews.journal.title',
    tone: 'leaf',
  },
  {
    anchorId: 'profile',
    descriptionKey: 'home.previews.profile.description',
    detailKeys: [
      'home.previews.profile.detailOne',
      'home.previews.profile.detailTwo',
    ],
    eyebrowKey: 'home.previews.profile.eyebrow',
    icon: 'profile',
    id: 'profile',
    titleKey: 'home.previews.profile.title',
    tone: 'coral',
  },
];

export const footerLinks: FooterLink[] = [
  {
    href: '#home',
    labelKey: 'home.footer.links.about',
  },
  {
    href: '#planner',
    labelKey: 'home.footer.links.terms',
  },
  {
    href: '#footer',
    labelKey: 'home.footer.links.contact',
  },
];

export const socialStamps: SocialStamp[] = [
  {
    id: 'facebook',
    labelKey: 'home.footer.socials.facebook',
    rotate: -4,
    tone: 'coral',
  },
  {
    id: 'instagram',
    labelKey: 'home.footer.socials.instagram',
    rotate: 3,
    tone: 'leaf',
  },
  {
    id: 'music',
    labelKey: 'home.footer.socials.music',
    rotate: -2,
    tone: 'sky',
  },
  {
    id: 'youtube',
    labelKey: 'home.footer.socials.youtube',
    rotate: 4,
    tone: 'sun',
  },
];
