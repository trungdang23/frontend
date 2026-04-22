import { describe, expect, it } from 'vitest';
import {
  homeNavItems,
  polaroidMoments,
} from '@/features/home/content/home-content';

describe('homepage scaffold', () => {
  it('keeps the shared sticky navigation item for community', () => {
    const labels = homeNavItems.map((item) => item.labelKey);

    expect(labels).toContain('home.navigation.community');
    expect(labels).toHaveLength(5);
  });

  it('ships a scrapbook ring of travel moments', () => {
    expect(polaroidMoments).toHaveLength(8);
  });
});
