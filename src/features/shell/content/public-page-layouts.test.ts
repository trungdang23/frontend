import { describe, expect, it } from 'vitest';
import {
  PUBLIC_PAGE_MAIN_BASE_CLASSNAME,
  PUBLIC_PAGE_SHELL_CLASSNAME,
} from '@/features/shell/components/public-page-shell';
import { publicPageMainLayouts } from '@/features/shell/content/public-page-layouts';

describe('public page layout isolation', () => {
  it('keeps the shared public shell free from route-specific width and gutter rules', () => {
    const sharedShellContract = `${PUBLIC_PAGE_SHELL_CLASSNAME} ${PUBLIC_PAGE_MAIN_BASE_CLASSNAME}`;

    expect(sharedShellContract).not.toContain('max-w-');
    expect(sharedShellContract).not.toContain('mx-auto');
    expect(sharedShellContract).not.toContain('px-');
    expect(sharedShellContract).not.toContain('py-');
    expect(sharedShellContract).not.toContain('grid-cols-');
    expect(sharedShellContract).not.toContain('translate-x');
  });

  it('keeps homepage width decisions on the homepage contract only', () => {
    expect(publicPageMainLayouts.home).toContain('max-w-none');
    expect(publicPageMainLayouts.home).toContain('lg:grid-cols-[52rem_20rem]');
    expect(publicPageMainLayouts.home).toContain('lg:justify-center');
    expect(publicPageMainLayouts.community).not.toContain('max-w-none');
    expect(publicPageMainLayouts.planner).not.toContain('max-w-none');
  });

  it('keeps wide workspace gutters inside community and planner only', () => {
    expect(publicPageMainLayouts.community).toContain('max-w-[86rem]');
    expect(publicPageMainLayouts.planner).toContain('max-w-[84rem]');
    expect(publicPageMainLayouts.home).not.toContain('max-w-[86rem]');
    expect(publicPageMainLayouts.profile).not.toContain('max-w-[86rem]');
  });

  it('keeps auth edge-to-edge spacing isolated from the other pages', () => {
    expect(publicPageMainLayouts.auth).toContain('px-0');
    expect(publicPageMainLayouts.home).not.toContain('px-0');
    expect(publicPageMainLayouts.community).not.toContain('px-0');
    expect(publicPageMainLayouts.planner).not.toContain('px-0');
    expect(publicPageMainLayouts.profile).not.toContain('px-0');
  });
});
