import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RankingStabilityMap, {
  getColor,
  getMessage,
} from '../RankingStabilityMap';

describe('RankingStabilityMap Logic & Helpers', () => {
  it('correctly categorizes green stability zone (slope <= 0 and volatility < 0.35)', () => {
    expect(getColor(-0.8, 0.22)).toBe('green');
    expect(getColor(-0.5, 0.18)).toBe('green');
    expect(getColor(0, 0.2)).toBe('green');
  });

  it('correctly categorizes red stability zone (slope > 0.5 and volatility > 0.5)', () => {
    expect(getColor(0.6, 0.58)).toBe('red');
    expect(getColor(0.7, 0.74)).toBe('red');
    expect(getColor(1.2, 0.8)).toBe('red');
  });

  it('correctly categorizes yellow stability zone (moderate / shifting)', () => {
    expect(getColor(0.2, 0.41)).toBe('yellow');
    expect(getColor(0.1, 0.25)).toBe('yellow');
    expect(getColor(0.6, 0.3)).toBe('yellow');
  });

  it('returns appropriate decision messages for all three zones', () => {
    expect(getMessage(-0.8, 0.22)).toContain('Automation strengthening active');
    expect(getMessage(0.7, 0.74)).toContain('Manual SERP audit recommended');
    expect(getMessage(0.2, 0.41)).toContain('Monitor next cycle');
  });
});

describe('RankingStabilityMap Component Interactions', () => {
  it('renders title, subtitle and all default keywords', () => {
    render(<RankingStabilityMap />);

    expect(screen.getByText('Ranking Stability Map')).toBeInTheDocument();
    expect(
      screen.getByText(/Slope \+ volatility → green\/yellow\/red stability zones/i),
    ).toBeInTheDocument();

    expect(screen.getByText('heat pump costs ireland')).toBeInTheDocument();
    expect(screen.getByText('solar pv grants ireland')).toBeInTheDocument();
    expect(screen.getByText('seai grants limerick')).toBeInTheDocument();
    expect(screen.getByText('attic insulation cost dublin')).toBeInTheDocument();
    expect(screen.getByText('ber rating upgrade steps')).toBeInTheDocument();
  });

  it('filters keywords by zone when filter buttons are clicked', () => {
    render(<RankingStabilityMap />);

    // Click Green filter
    fireEvent.click(screen.getByText(/Green \(/i));
    expect(screen.getByText('heat pump costs ireland')).toBeInTheDocument();
    expect(screen.getByText('attic insulation cost dublin')).toBeInTheDocument();
    expect(screen.queryByText('solar pv grants ireland')).not.toBeInTheDocument();

    // Click Red filter
    fireEvent.click(screen.getByText(/Red \(/i));
    expect(screen.getByText('solar pv grants ireland')).toBeInTheDocument();
    expect(screen.getByText('ber rating upgrade steps')).toBeInTheDocument();
    expect(screen.queryByText('heat pump costs ireland')).not.toBeInTheDocument();
  });

  it('calls onNavigateToSERP when Audit Now button is clicked for red zone keyword', () => {
    const onNavigate = vi.fn();
    render(<RankingStabilityMap onNavigateToSERP={onNavigate} />);

    // Click Red filter to isolate red keywords
    fireEvent.click(screen.getByText(/Red \(/i));
    const auditButtons = screen.getAllByText(/Audit Now/i);
    expect(auditButtons.length).toBeGreaterThan(0);

    fireEvent.click(auditButtons[0]);
    // Notice is shown
    expect(
      screen.getByText(/Launching SERP Analyzer intelligence/i),
    ).toBeInTheDocument();
  });

  it('allows adding a custom tracked keyword and computes its zone', () => {
    render(<RankingStabilityMap />);

    // Open add modal
    fireEvent.click(screen.getByText('Track Keyword'));
    expect(
      screen.getByText(/Register Keyword in Intelligence Registry/i),
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/solar pv grants ireland/i);
    fireEvent.change(input, {
      target: { value: 'custom retrofit grant v94' },
    });

    fireEvent.click(screen.getByText('Register Keyword'));
    expect(screen.getByText('custom retrofit grant v94')).toBeInTheDocument();
  });
});
