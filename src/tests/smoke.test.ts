import { describe, expect, it } from 'vitest';
import {
  homeNavItems,
  homePreviewCards,
  polaroidMoments,
} from '@/features/home/content/home-content';

describe('homepage scaffold', () => {
  it('keeps the sticky navigation aligned with preview anchors', () => {
    const navAnchors = homeNavItems
      .filter((item) => item.anchorId !== 'home')
      .map((item) => item.anchorId)
      .sort();
    const previewAnchors = homePreviewCards
      .map((card) => card.anchorId)
      .sort();

    expect(navAnchors).toEqual(previewAnchors);
  });

  it('ships a full scrapbook ring of travel moments', () => {
    expect(polaroidMoments).toHaveLength(8);
  });
});
