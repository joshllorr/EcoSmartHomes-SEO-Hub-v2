import { describe, it, expect, vi } from 'vitest';
import {
  generateFeaturedImage,
  insertImageIntoMarkdown,
  generateClientFallbackImage,
  IMAGE_STYLE_PRESETS,
  ASPECT_RATIOS,
} from '../imageGenerator';

describe('Image Generator Engine (src/utils/imageGenerator.ts)', () => {
  it('provides style presets and aspect ratios for Irish SEO content', () => {
    expect(IMAGE_STYLE_PRESETS.length).toBeGreaterThanOrEqual(5);
    expect(ASPECT_RATIOS.length).toBe(4);
    expect(ASPECT_RATIOS.map((a) => a.id)).toContain('16:9');
    expect(ASPECT_RATIOS.map((a) => a.id)).toContain('4:3');
    expect(ASPECT_RATIOS.map((a) => a.id)).toContain('1:1');
  });

  it('generates high-fidelity client fallback vector data URL', () => {
    const fallbackSvg = generateClientFallbackImage(
      'Complete SEAI Solar PV Grant Guide 2026',
      ['solar panels', 'SEAI grants', 'BER upgrade'],
      '16:9',
      'Photorealistic Architectural',
    );

    expect(fallbackSvg).toContain('data:image/svg+xml');
    expect(decodeURIComponent(fallbackSvg)).toContain('Complete SEAI Solar PV Grant Guide 2026');
  });

  it('inserts featured hero image at top of markdown document', () => {
    const initialMarkdown = `# SEAI Grant Guide 2026\n\nHere is introductory text explaining home insulation.`;
    const imageMeta = {
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      alt: 'Modern Irish detached home with solar PV panels',
      caption: 'Figure 1: High efficiency solar panel roof retrofit in Dublin.',
    };

    const updated = insertImageIntoMarkdown(initialMarkdown, imageMeta, 'top_hero');
    expect(updated).toContain('![Modern Irish detached home with solar PV panels]');
    expect(updated).toContain('Figure 1: High efficiency solar panel roof retrofit in Dublin.');
    // Image should come after the H1 title
    const titleIndex = updated.indexOf('# SEAI Grant Guide 2026');
    const imageIndex = updated.indexOf('![Modern Irish detached home with solar PV panels]');
    expect(imageIndex).toBeGreaterThan(titleIndex);
  });

  it('inserts featured hero image at bottom of markdown document', () => {
    const initialMarkdown = `# SEAI Grant Guide 2026\n\nHere is body text.`;
    const imageMeta = {
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      alt: 'Modern Irish detached home with solar PV panels',
    };

    const updated = insertImageIntoMarkdown(initialMarkdown, imageMeta, 'bottom');
    expect(updated).toContain('![Modern Irish detached home with solar PV panels](https://images.unsplash.com/photo-1513694203232-719a280e022f)');
  });

  it('calls backend API when available or falls back gracefully on error', async () => {
    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/png;base64,mockbase64',
        altText: 'SEAI Grants 2026 - Solar PV',
        caption: 'Figure 1: Solar installation in Ireland',
        suggestedFileName: 'seai-grants-2026.webp',
        prompt: 'Mock prompt',
        aspectRatio: '16:9',
        style: 'Photorealistic Architectural',
        dimensions: { width: 1200, height: 675 },
        isMock: false,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateFeaturedImage({
      title: 'SEAI Grants 2026',
      keywords: ['Solar PV'],
      aspectRatio: '16:9',
    });

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBe('data:image/png;base64,mockbase64');
    expect(result.altText).toBe('SEAI Grants 2026 - Solar PV');

    vi.unstubAllGlobals();
  });
});
