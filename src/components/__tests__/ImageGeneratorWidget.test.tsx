import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGeneratorWidget from '../ImageGeneratorWidget';

describe('ImageGeneratorWidget component', () => {
  const sampleArticleTitle = 'How to Claim SEAI Solar PV Grants in Ireland (2026 Guide)';
  const sampleContent = `# How to Claim SEAI Solar PV Grants in Ireland (2026 Guide)\n\nSolar energy retrofitting is surging across Ireland.`;

  it('renders widget title, style presets, and aspect ratios', () => {
    render(
      <ImageGeneratorWidget
        articleTitle={sampleArticleTitle}
        articleKeywords={['solar PV', 'SEAI grants']}
        currentContent={sampleContent}
        onUpdateContent={vi.fn()}
      />,
    );

    expect(screen.getByText('Imagen SEO Featured Image Studio')).toBeInTheDocument();
    expect(screen.getByText('1. Select Visual Style Preset')).toBeInTheDocument();
    expect(screen.getByText('2. Choose Dimensions & Placement Aspect Ratio')).toBeInTheDocument();
    expect(screen.getByText('Photorealistic Architectural')).toBeInTheDocument();
    expect(screen.getByText('16:9 Banner (Hero)')).toBeInTheDocument();
  });

  it('allows generating and displaying a featured image with SEO metadata', async () => {
    const handleUpdateContent = vi.fn();
    const handleUpdateFeaturedImage = vi.fn();
    const handleXP = vi.fn();

    // Mock fetch for image generation API
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/svg+xml;utf8,%3Csvg%3E%3C/svg%3E',
        altText: 'SEAI Solar PV Grants in Ireland 2026',
        caption: 'Figure 1: High efficiency solar panel roof retrofit in Dublin.',
        suggestedFileName: 'seai-solar-pv-grants-ireland.webp',
        prompt: 'Mock prompt',
        aspectRatio: '16:9',
        style: 'Photorealistic Architectural',
        dimensions: { width: 1200, height: 675 },
        isMock: false,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(
      <ImageGeneratorWidget
        articleTitle={sampleArticleTitle}
        articleKeywords={['solar PV', 'SEAI grants']}
        currentContent={sampleContent}
        onUpdateContent={handleUpdateContent}
        onUpdateFeaturedImage={handleUpdateFeaturedImage}
        onXPUnlock={handleXP}
      />,
    );

    const generateBtn = screen.getByRole('button', { name: /Generate Featured Image/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Image SEO Metadata/i)).toBeInTheDocument();
    });

    expect(handleUpdateFeaturedImage).toHaveBeenCalled();
    expect(handleXP).toHaveBeenCalledWith(10);

    // Insert hero into draft
    const insertHeroBtn = screen.getByRole('button', {
      name: /Insert as Featured Hero/i,
    });
    fireEvent.click(insertHeroBtn);

    expect(handleUpdateContent).toHaveBeenCalled();
    const updatedDraft = handleUpdateContent.mock.calls[0][0];
    expect(updatedDraft).toContain('![SEAI Solar PV Grants in Ireland 2026]');

    vi.unstubAllGlobals();
  });
});
