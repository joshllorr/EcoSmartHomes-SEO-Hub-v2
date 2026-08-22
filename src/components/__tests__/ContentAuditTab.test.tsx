import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentAuditTab from '../ContentAuditTab';
import { ArticleDraft } from '../../types';
import * as pdfGenerator from '../../utils/generateAuditReportPdf';

// Mock generateAuditReportPdf
vi.mock('../../utils/generateAuditReportPdf', () => ({
  generateAuditReportPdf: vi.fn(),
}));

const mockDrafts: ArticleDraft[] = [
  {
    id: 'draft-test-101',
    title: 'SEAI Heat Pump Grants Ireland 2026 Homeowner Guide',
    metaTitle: 'SEAI Heat Pump Grants Ireland 2026: Complete Home Guide',
    metaDescription:
      'Discover complete SEAI grant values up to €6,500 for heat pump installations in Ireland. Check eligibility criteria and application steps.',
    keywords: ['SEAI grants', 'heat pump installation', 'BER rating Ireland'],
    content:
      '## SEAI Heat Pump Grants Ireland Overview\n\nInstalling a heat pump reduces household carbon emissions. In Ireland, SEAI grants offer up to €6,500 for qualifying residential upgrades.\n\n### Eligibility Requirements\n\nTo qualify for SEAI grants, your home must have been built prior to 2021 and achieve a high BER rating Ireland benchmark.\n\nEnergy efficiency improves when insulation is installed alongside modern heat pump installation systems.',
    wordCount: 75,
    date: '21/08/2026',
    status: 'Draft',
    tone: 'Professional',
  },
];

describe('ContentAuditTab - Download Report Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Content Quality SEO Audit tab with Download Report button', () => {
    render(
      <ContentAuditTab
        drafts={mockDrafts}
        onUpdateDraft={vi.fn()}
        onXPUnlock={vi.fn()}
        onNavigateToTab={vi.fn()}
      />,
    );

    expect(screen.getByText('Content Quality SEO Audit')).toBeInTheDocument();
    const downloadButtons = screen.getAllByRole('button', { name: /Download Report/i });
    expect(downloadButtons.length).toBeGreaterThan(0);
  });

  it('triggers generateAuditReportPdf and rewards XP when Download Report button is clicked', () => {
    const mockXPUnlock = vi.fn();
    render(
      <ContentAuditTab
        drafts={mockDrafts}
        onUpdateDraft={vi.fn()}
        onXPUnlock={mockXPUnlock}
        onNavigateToTab={vi.fn()}
      />,
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Report/i });
    fireEvent.click(downloadBtn);

    expect(pdfGenerator.generateAuditReportPdf).toHaveBeenCalledTimes(1);
    expect(pdfGenerator.generateAuditReportPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: expect.objectContaining({
          id: 'draft-test-101',
          title: 'SEAI Heat Pump Grants Ireland 2026 Homeowner Guide',
        }),
      }),
    );
    expect(mockXPUnlock).toHaveBeenCalledWith(10);
  });

  it('handles empty drafts with friendly empty state', () => {
    render(
      <ContentAuditTab
        drafts={[]}
        onUpdateDraft={vi.fn()}
        onXPUnlock={vi.fn()}
        onNavigateToTab={vi.fn()}
      />,
    );

    expect(screen.getByText('No drafts available to audit')).toBeInTheDocument();
  });
});
