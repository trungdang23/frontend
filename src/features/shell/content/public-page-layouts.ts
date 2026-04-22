// Keep route-specific spacing and width decisions out of the shared shell.
export const publicPageMainLayouts = {
  auth: 'h-full w-full px-0 py-1 sm:py-2',
  community: 'relative mx-auto w-full max-w-[86rem] px-4 pb-24 pt-2 sm:px-6 lg:px-10',
  home: 'grid w-full max-w-none grid-cols-1 items-center gap-3 px-4 pb-1 pt-1 sm:px-6 sm:pb-2 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5 lg:px-8',
  journal: 'h-full w-full px-4 py-2 sm:px-6 lg:px-8',
  planner: 'relative mx-auto h-full w-full max-w-[84rem] px-4 py-1 sm:px-6 sm:py-2 lg:px-8',
  profile: 'h-full w-full px-4 py-1 sm:px-6 sm:py-2 lg:px-8',
} as const;

export type PublicPageLayoutKey = keyof typeof publicPageMainLayouts;
