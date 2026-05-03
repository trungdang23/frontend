export type AccentTone = 'sun' | 'sky' | 'leaf' | 'coral';

export type NavNoteTone = 'sun' | 'sky' | 'paper' | 'leaf' | 'coral';
export type NavNoteShape =
  | 'fold-right'
  | 'torn-bottom'
  | 'notebook'
  | 'straight'
  | 'fold-left';

export type HomeNavItem = {
  href: string;
  labelKey: string;
  rotate: number;
  shape: NavNoteShape;
  tone: NavNoteTone;
  yOffset: number;
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
    href: '/community',
    labelKey: 'home.navigation.community',
    rotate: 3,
    shape: 'torn-bottom',
    tone: 'sky',
    yOffset: -4,
  },
  {
    href: '/app/planner',
    labelKey: 'home.navigation.planner',
    rotate: -2,
    shape: 'notebook',
    tone: 'paper',
    yOffset: 6,
  },
  {
    href: '/app/profile',
    labelKey: 'home.navigation.profile',
    rotate: -3,
    shape: 'fold-left',
    tone: 'coral',
    yOffset: 4,
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
