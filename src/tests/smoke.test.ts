import { describe, expect, it } from 'vitest';
import {
  homeNavItems,
  polaroidMoments,
} from '@/features/home/content/home-content';

describe('homepage scaffold', () => {
  it('keeps the sticky navigation free of community items', () => {
    const labels = homeNavItems.map((item) => item.labelKey);

    expect(labels).not.toContain('home.navigation.community');
  });

  it('ships a scrapbook ring of travel moments', () => {
    expect(polaroidMoments).toHaveLength(8);
  });
});
