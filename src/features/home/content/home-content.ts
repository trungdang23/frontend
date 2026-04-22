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
  href: string;
  labelKey: string;
  rotate: number;
  shape: NavNoteShape;
  tone: NavNoteTone;
  yOffset: number;
};

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
    href: '/',
    labelKey: 'home.navigation.home',
    rotate: -4,
    shape: 'fold-right',
    tone: 'sun',
    yOffset: 2,
  },
  {
    href: '/',
    labelKey: 'home.navigation.community',
    rotate: 3,
    shape: 'torn-bottom',
    tone: 'sky',
    yOffset: -4,
  },
  {
    href: '/',
    labelKey: 'home.navigation.planner',
    rotate: -2,
    shape: 'notebook',
    tone: 'paper',
    yOffset: 6,
  },
  {
    href: '/',
    labelKey: 'home.navigation.journal',
    rotate: 5,
    shape: 'straight',
    tone: 'leaf',
    yOffset: -2,
  },
  {
    href: '/',
    labelKey: 'home.navigation.profile',
    rotate: -3,
    shape: 'fold-left',
    tone: 'coral',
    yOffset: 4,
  },
];

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

export const footerLinks: FooterLink[] = [
  {
    href: '/',
    labelKey: 'home.footer.links.about',
  },
  {
    href: '/',
    labelKey: 'home.footer.links.terms',
  },
  {
    href: '/',
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
