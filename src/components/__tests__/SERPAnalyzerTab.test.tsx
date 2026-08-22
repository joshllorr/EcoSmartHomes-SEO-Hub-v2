import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SERPAnalyzerTab from '../SERPAnalyzerTab';
import SERPViewer, { SERPResult } from '../SERP/SERPViewer';

const mockSolarSerp: SERPResult = {
  keyword: 'solar pv grants ireland',
  intent: 'Informational & Commercial',
  difficulty: 34,
  search_volume: 18600,
  top_results: [
    {
      position: 1,
      title: 'SEAI Solar Electricity Grant (Up to €2,100) | SEAI Ireland',
      url: 'https://www.seai.ie/grants/home-energy-grants/solar-electricity-grant/',
      meta_description: 'Discover SEAI solar PV grants for Irish domestic properties. Claim up to €2,100.',
      domain_authority: 88,
      monthly_traffic: 145000,
      content_type: 'Government Portal',
      themes: ['Solar Electricity Grant', 'Clean Export Guarantee'],
      strengths: ['Authoritative grant guidelines', 'Official payment rate tables'],
      weaknesses: ['Does not include real-time solar ROI calculators'],
      ranking_gaps: ['Lacks interactive battery vs standalone PV payback comparisons'],
    },
    {
      position: 2,
      title: 'Solar Panels Ireland: Costs, SEAI Grants & Savings 2026 | Citizens Information',
      url: 'https://www.citizensinformation.ie/en/housing/housing_grants_and_schemes/solar_panels.html',
      meta_description: 'Objective homeowner advice on solar PV panel installations in Ireland.',
      domain_authority: 82,
      monthly_traffic: 110000,
      content_type: 'Civic Advice Guide',
      themes: ['Citizen Advice', 'Microgeneration Scheme'],
      strengths: ['Unbiased legal and consumer guidance'],
      weaknesses: ['Visually plain'],
      ranking_gaps: ['No comparison between battery storage capacities'],
    },
  ],
  opportunities: [
    'No competitor explains the Clean Export Guarantee (CEG) feed-in tariff alongside SEAI grants.',
    'Detail the exact payback timeline for a 4kWp system with battery storage.',
  ],
  ranking_gap_keywords: [
    {
      keyword: 'SEAI solar pv grant battery storage Ireland 2026',
      competitor: 'SEAI Ireland',
      competitorRank: 1,
      volume: 5400,
      difficulty: 30,
      opportunityScore: 95,
      suggestedAction: 'Publish comprehensive guide on combining solar panels with 5kWh battery systems.',
    },
  ],
  recommended_outline: [
    'Introduction: Why 2026 is the Peak Year for Solar PV in Ireland.',
    'Section 1: SEAI Solar Electricity Grant Rates & Eligibility.',
    'Section 2: Clean Export Guarantee (CEG).',
  ],
  summary_markdown: '### Key Insights on Solar PV Grants Ireland\nExcellent ranking opportunities in Limerick V94.',
};

describe('SERPAnalyzerTab Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with default keyword and analysis reward badge', () => {
    render(
      <SERPAnalyzerTab
        onSerpAnalyzed={vi.fn()}
      />
    );

    expect(screen.getByText('SERP Intelligence & Competitor Audit')).toBeInTheDocument();
    expect(screen.getByText('+40 XP')).toBeInTheDocument();
    expect(screen.getByText('Analyze Google SERP')).toBeInTheDocument();
    expect(screen.getByText('Quick Targets:')).toBeInTheDocument();
  });

  it('triggers analysis on keyword submit and calls onSerpAnalyzed with +40 XP', async () => {
    const onSerpAnalyzedMock = vi.fn();
    const onXPUnlockMock = vi.fn();

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        serp: mockSolarSerp,
        isMock: false,
      }),
    } as any);

    render(
      <SERPAnalyzerTab
        onSerpAnalyzed={onSerpAnalyzedMock}
        onXPUnlock={onXPUnlockMock}
      />
    );

    const input = screen.getByPlaceholderText(/Enter target Limerick V94 keyword/i);
    fireEvent.change(input, { target: { value: 'solar pv grants ireland' } });

    const submitBtn = screen.getByText('Analyze Google SERP');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSerpAnalyzedMock).toHaveBeenCalledWith(mockSolarSerp);
      expect(onXPUnlockMock).toHaveBeenCalledWith(40);
    });
  });

  it('handles fallback gracefully when backend fetch fails', async () => {
    const onSerpAnalyzedMock = vi.fn();
    const onXPUnlockMock = vi.fn();

    // Mock network failure
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <SERPAnalyzerTab
        onSerpAnalyzed={onSerpAnalyzedMock}
        onXPUnlock={onXPUnlockMock}
      />
    );

    const submitBtn = screen.getByText('Analyze Google SERP');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSerpAnalyzedMock).toHaveBeenCalled();
      expect(onXPUnlockMock).toHaveBeenCalledWith(40);
      expect(screen.getByText(/SERP Competitor audit generated/i)).toBeInTheDocument();
    });
  });
});

describe('SERPViewer Component', () => {
  it('renders all sections and supports switching tabs', () => {
    const onSendToWriterMock = vi.fn();

    render(
      <SERPViewer
        serp={mockSolarSerp}
        onSendToWriter={onSendToWriterMock}
      />
    );

    // Check header
    expect(screen.getByText('“solar pv grants ireland”')).toBeInTheDocument();
    expect(screen.getByText('Est. Volume: 18,600/mo')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();

    // Switch to Competitors tab
    const compTabBtn = screen.getByText(/Top Competitors/i);
    fireEvent.click(compTabBtn);
    expect(screen.getByText(/SEAI Solar Electricity Grant/i)).toBeInTheDocument();
    expect(screen.getByText(/Position #1/i)).toBeInTheDocument();

    // Switch to Competitor Diff tab
    const diffTabBtn = screen.getByRole('button', { name: /Competitor Diff/i });
    fireEvent.click(diffTabBtn);
    expect(screen.getByText('Phase 9 — Competitor Diff Engine')).toBeInTheDocument();

    // Switch to SERP Features tab
    const featTabBtn = screen.getByRole('button', { name: /SERP Features/i });
    fireEvent.click(featTabBtn);
    expect(screen.getByText(/Detected SERP Features/i)).toBeInTheDocument();

    // Switch to Ranking Gaps tab
    const gapsTabBtn = screen.getByText('Ranking Gaps');
    fireEvent.click(gapsTabBtn);
    expect(screen.getByText('SEAI solar pv grant battery storage Ireland 2026')).toBeInTheDocument();

    // Switch to Outline tab
    const outlineTabBtn = screen.getByText('Target Outline');
    fireEvent.click(outlineTabBtn);
    expect(screen.getByText(/Section 1: SEAI Solar Electricity Grant Rates & Eligibility/i)).toBeInTheDocument();

    // Click Send to AI Writer
    const sendBtn = screen.getByText('Send to AI Writer');
    fireEvent.click(sendBtn);
    expect(onSendToWriterMock).toHaveBeenCalledWith(
      mockSolarSerp.recommended_outline,
      'Ultimate Guide to solar pv grants ireland',
      'solar pv grants ireland'
    );
  });
});
