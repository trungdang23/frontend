// Keep route-specific spacing and width decisions out of the shared shell.
export const publicPageMainLayouts = {
  auth: 'w-full px-0 py-2 sm:py-3',
  community: 'relative mx-auto w-full max-w-[86rem] px-4 pb-24 pt-2 sm:px-6 lg:px-10',
  home: 'grid w-full max-w-[72rem] grid-cols-1 items-center gap-4 px-4 pb-2 pt-2 sm:px-6 sm:pb-3 lg:grid-cols-[1.32fr_0.92fr] lg:gap-6 lg:px-10',
  planner: 'relative mx-auto w-full max-w-[86rem] px-4 py-2 sm:px-6 sm:py-3 lg:px-10',
  profile: 'w-full px-4 pb-10 pt-2 sm:px-6 lg:px-10',
} as const;

export type PublicPageLayoutKey = keyof typeof publicPageMainLayouts;
