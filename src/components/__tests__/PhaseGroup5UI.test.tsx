import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutomationLogsPanel from '../AutomationLogsPanel';
import SEOInsightsPanel from '../SEOInsightsPanel';
import IrishCountyHeatmap from '../IrishCountyHeatmap';
import RankingStabilityMap from '../RankingStabilityMap';

describe('Phase Group 5 — Dashboard & UX Components (Phases 35–42)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------
  // Phase 38: Automation Logs UI
  // ---------------------------------------------
  describe('Phase 38 — Automation Logs UI', () => {
    it('renders Automation Engine Logs panel with filter buttons', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          logs: [
            {
              id: 'log-1',
              phase: 16,
              phaseName: 'Internal Link Reinforcer',
              action: 'link_injection',
              target: 'solar-pv',
              status: 'success',
              details: 'Reinforced 3 internal links.',
              timestamp: Date.now(),
            },
          ],
        }),
      } as any);

      render(<AutomationLogsPanel />);

      expect(screen.getByText('Automation Engine Logs')).toBeInTheDocument();
      expect(screen.getByText(/Phase 16–27 Live/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/\[Phase 16\] Internal Link Reinforcer/i)).toBeInTheDocument();
        expect(screen.getByText('Reinforced 3 internal links.')).toBeInTheDocument();
      });
    });
  });

  // ---------------------------------------------
  // Phase 40: Insights Panel
  // ---------------------------------------------
  describe('Phase 40 — SEO Insights Panel', () => {
    it('renders grounded insights and dispatches actions', async () => {
      const onNavigateMock = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          summary: {
            predictedMonthlyPipelineValue: 480000,
            trafficGrowthPercentage: 35,
          },
        }),
      } as any);

      render(<SEOInsightsPanel onNavigateToSERP={onNavigateMock} />);

      expect(screen.getByText('Predictive SEO & Retrofit Insights')).toBeInTheDocument();
      expect(screen.getByText(/Breakout Velocity Target/i)).toBeInTheDocument();
      expect(screen.getByText(/Seasonal Demand Surge/i)).toBeInTheDocument();

      const executeBtn = screen.getByText('Execute SERP Audit');
      fireEvent.click(executeBtn);
      expect(onNavigateMock).toHaveBeenCalledWith('solar pv grants ireland');
    });
  });

  // ---------------------------------------------
  // Phase 39: Keyword Drawer & Phase 36: Stability Map UI
  // ---------------------------------------------
  describe('Phase 39 & 36 — Stability Map UI & Keyword Drawer', () => {
    it('opens Keyword Intelligence Drawer and displays multi-period forecast trajectories', async () => {
      render(<RankingStabilityMap />);

      // Find drawer button on a card
      const drawerBtns = screen.getAllByText('Drawer');
      expect(drawerBtns.length).toBeGreaterThan(0);

      fireEvent.click(drawerBtns[0]);

      expect(screen.getByText(/Keyword Intelligence Drawer \(Phase 39\)/i)).toBeInTheDocument();
      expect(screen.getByText('30-Day Rank')).toBeInTheDocument();
      expect(screen.getByText('60-Day Rank')).toBeInTheDocument();
      expect(screen.getByText('90-Day Rank')).toBeInTheDocument();
      expect(screen.getByText('Queue Content Refresh')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------
  // Phase 41: Heatmap Engine
  // ---------------------------------------------
  describe('Phase 41 — Multi-County Irish Heatmap', () => {
    it('renders all 26 counties coverage and active Eircode stats', () => {
      render(<IrishCountyHeatmap />);

      expect(screen.getByText('Multi-County Irish SERP Heatmap')).toBeInTheDocument();
      expect(screen.getAllByText(/Limerick/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/V94/i).length).toBeGreaterThan(0);
    });
  });
});
