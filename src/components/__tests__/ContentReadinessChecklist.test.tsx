import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentReadinessChecklist from '../ContentReadinessChecklist';
import * as titleMetaUtil from '../../utils/generateTitleMeta';

// Mock generateTitleMeta
vi.mock('../../utils/generateTitleMeta', () => ({
  generateTitleMeta: vi.fn(),
}));

describe('ContentReadinessChecklist - Quick Fix Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    title: 'Short',
    content:
      'SEAI Heat Pump Grants in Ireland provide up to €6,500 for homeowners upgrading their residential energy efficiency and BER rating.',
    metaDescription: 'Too short',
    keywords: ['SEAI Heat Pump Grants', 'BER rating'],
    siteUrl: 'ecosmarthomes.ie',
    onUpdateMetaDescription: vi.fn(),
    onUpdateKeywords: vi.fn(),
    onApplyTitleSuggestion: vi.fn(),
    onQuickFixApplied: vi.fn(),
  };

  it('renders Content Readiness Checklist with Quick Fix button', () => {
    render(<ContentReadinessChecklist {...defaultProps} />);

    expect(
      screen.getByText('Content Readiness & SEO Checklist'),
    ).toBeInTheDocument();
    const quickFixBtn = screen.getByRole('button', { name: /Quick Fix/i });
    expect(quickFixBtn).toBeInTheDocument();
  });

  it('calls generateTitleMeta and applies LLM updates to title and meta description when Quick Fix is clicked', async () => {
    const mockGenerated = {
      title: 'SEAI Heat Pump Grants Ireland 2026: Complete Homeowner Guide',
      slug: 'seai-heat-pump-grants-ireland-2026',
      meta_description:
        'Discover everything about SEAI heat pump grants in Ireland. Learn how to secure up to €6,500 in funding and boost your home BER rating efficiently today.',
      alternatives: [],
    };

    vi.mocked(titleMetaUtil.generateTitleMeta).mockResolvedValueOnce(
      mockGenerated,
    );

    const onApplyTitleSuggestion = vi.fn();
    const onUpdateMetaDescription = vi.fn();
    const onQuickFixApplied = vi.fn();

    render(
      <ContentReadinessChecklist
        {...defaultProps}
        onApplyTitleSuggestion={onApplyTitleSuggestion}
        onUpdateMetaDescription={onUpdateMetaDescription}
        onQuickFixApplied={onQuickFixApplied}
      />,
    );

    const quickFixBtn = screen.getByRole('button', { name: /Quick Fix/i });
    fireEvent.click(quickFixBtn);

    await waitFor(() => {
      expect(titleMetaUtil.generateTitleMeta).toHaveBeenCalledWith(
        'Short',
        'Professional',
        defaultProps.content,
      );
    });

    expect(onApplyTitleSuggestion).toHaveBeenCalledWith(mockGenerated.title);
    expect(onUpdateMetaDescription).toHaveBeenCalledWith(
      mockGenerated.meta_description,
    );
    expect(onQuickFixApplied).toHaveBeenCalledWith({
      title: mockGenerated.title,
      metaDescription: mockGenerated.meta_description,
    });

    // Check that success banner is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Quick Fix Applied \(LLM Processing\)/i),
      ).toBeInTheDocument();
    });
  });

  it('handles Quick Fix failure gracefully with error alert', async () => {
    vi.mocked(titleMetaUtil.generateTitleMeta).mockRejectedValueOnce(
      new Error('API connection timed out'),
    );

    render(<ContentReadinessChecklist {...defaultProps} />);

    const quickFixBtn = screen.getByRole('button', { name: /Quick Fix/i });
    fireEvent.click(quickFixBtn);

    await waitFor(() => {
      expect(screen.getByText(/API connection timed out/i)).toBeInTheDocument();
    });
  });
});
