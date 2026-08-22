import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentStrategyFunnel, { FUNNEL_STAGES } from '../ContentStrategyFunnel';
import { ArticleDraft } from '../../types';

describe('ContentStrategyFunnel Component', () => {
  const mockDrafts: ArticleDraft[] = [
    {
      id: 'test-idea-1',
      title: 'Solar PV Grants Kerry V92: 2026 Price Breakdown',
      topic: 'Detailed review of Kerry solar incentives and payback.',
      content: '',
      status: 'Idea',
      date: '21/08/2026',
      wordCount: 0,
      pillar: 'Solar PV',
      priority: 'high',
      seoScore: 84,
      keywords: ['solar PV Kerry', 'SEAI solar grant Tralee'],
    },
    {
      id: 'test-draft-1',
      title: 'Air-to-Water Heat Pump Efficiency in Irish Winter',
      topic: 'How defrost cycles and humidity impact COP in Ireland.',
      content: 'Heating your home efficiently requires understanding seasonal COP...',
      status: 'Drafted',
      date: '20/08/2026',
      wordCount: 820,
      pillar: 'Heat Pumps',
      priority: 'urgent',
      seoScore: 92,
      keywords: ['heat pump humidity', 'COP Ireland'],
    },
  ];

  const mockOpenInWriter = vi.fn();
  const mockUpdateDraft = vi.fn();
  const mockUpdateDrafts = vi.fn();
  const mockXPUnlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the 5 funnel stage columns with appropriate headings', () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    expect(screen.getByText('Content Strategy Funnel')).toBeInTheDocument();
    expect(screen.getByText('Drag & Drop Engine')).toBeInTheDocument();

    // Verify all 5 funnel stage short labels exist
    FUNNEL_STAGES.forEach((st) => {
      expect(screen.getAllByText(st.shortLabel).length).toBeGreaterThan(0);
    });
  });

  it('allows moving an item to the next funnel stage using quick transition buttons', async () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    // Find the advance button on the Idea card (advances to Research)
    const advanceButtons = screen.getAllByTitle(/Advance to/i);
    expect(advanceButtons.length).toBeGreaterThan(0);

    fireEvent.click(advanceButtons[0]);

    await waitFor(() => {
      expect(mockUpdateDrafts).toHaveBeenCalled();
    });
  });

  it('calls onOpenInWriter when clicking Write button on a funnel card', () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    const writeButtons = screen.getAllByRole('button', { name: /Write/i });
    expect(writeButtons.length).toBeGreaterThan(0);

    fireEvent.click(writeButtons[0]);
    expect(mockOpenInWriter).toHaveBeenCalled();
  });

  it('opens new idea modal and allows creating a custom content strategy item', async () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    const newBtn = screen.getByRole('button', { name: /New Strategy Item/i });
    fireEvent.click(newBtn);

    expect(screen.getByText('Add Content Strategy Item')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e\.g\. SEAI Attic Insulation/i);
    fireEvent.change(titleInput, {
      target: { value: 'Complete BER Assessment Checklist Dublin' },
    });

    const submitBtn = screen.getByRole('button', { name: /Add to Funnel/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockXPUnlock).toHaveBeenCalledWith(10);
      expect(
        screen.getByText('Complete BER Assessment Checklist Dublin'),
      ).toBeInTheDocument();
    });
  });

  it('supports AI auto-seeding strategic Irish retrofit topics', async () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    const seedBtn = screen.getByRole('button', { name: /AI Auto-Seed Pipeline/i });
    fireEvent.click(seedBtn);

    await waitFor(() => {
      expect(mockXPUnlock).toHaveBeenCalledWith(15);
      expect(mockUpdateDrafts).toHaveBeenCalled();
    });
  });

  it('handles drag-and-drop status transitions between stages', async () => {
    render(
      <ContentStrategyFunnel
        drafts={mockDrafts}
        onOpenInWriter={mockOpenInWriter}
        onUpdateDraft={mockUpdateDraft}
        onUpdateDrafts={mockUpdateDrafts}
        onXPUnlock={mockXPUnlock}
      />,
    );

    const ideaCard = screen.getByText('Solar PV Grants Kerry V92: 2026 Price Breakdown');
    const publishedColumn = document.getElementById('funnel-column-published');

    expect(publishedColumn).toBeInTheDocument();

    // Simulate drag start on idea card
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 'test-idea-1'),
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    fireEvent.dragStart(ideaCard.closest('[draggable="true"]')!, { dataTransfer });
    fireEvent.dragOver(publishedColumn!, { dataTransfer });
    fireEvent.drop(publishedColumn!, { dataTransfer });

    await waitFor(() => {
      expect(mockUpdateDrafts).toHaveBeenCalled();
      expect(mockXPUnlock).toHaveBeenCalledWith(25);
    });
  });
});
