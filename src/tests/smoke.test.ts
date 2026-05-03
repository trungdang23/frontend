import { describe, expect, it } from 'vitest';
import {
  polaroidMoments,
} from '@/features/home/content/home-content';
import {
  footerLinks,
  homeNavItems,
} from '@/features/shell/content/public-chrome-content';

describe('homepage scaffold', () => {
  it('keeps the shared sticky navigation item for community', () => {
    const labels = homeNavItems.map((item) => item.labelKey);

    expect(labels).toContain('home.navigation.community');
    expect(labels).toHaveLength(4);
  });

  it('ships a scrapbook ring of travel moments', () => {
    expect(polaroidMoments).toHaveLength(12);
  });

  it('does not ship homepage chrome links with empty hash fragments', () => {
    expect(homeNavItems.every((item) => item.href.startsWith('/'))).toBe(true);
    expect(footerLinks.every((link) => link.href.startsWith('/'))).toBe(true);
  });

  it('routes the shared community navigation note to the real community route', () => {
    expect(homeNavItems.find((item) => item.labelKey === 'home.navigation.community')?.href).toBe('/community');
  });

  it('routes planner and profile notes to protected destinations', () => {
    expect(homeNavItems.find((item) => item.labelKey === 'home.navigation.planner')?.href).toBe('/app/planner');
    expect(homeNavItems.find((item) => item.labelKey === 'home.navigation.profile')?.href).toBe('/app/profile');
  });
});
