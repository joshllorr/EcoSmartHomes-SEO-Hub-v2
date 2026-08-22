import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadabilityTimeWidget from '../ReadabilityTimeWidget';
import { calculateReadabilityMetrics, countWordSyllables } from '../../utils/readability';

describe('Readability Utilities (readability.ts)', () => {
  it('correctly counts syllables for simple and complex English words', () => {
    expect(countWordSyllables('heat')).toBe(1);
    expect(countWordSyllables('retrofit')).toBe(3);
    expect(countWordSyllables('insulation')).toBe(4);
    expect(countWordSyllables('efficiency')).toBe(4);
    expect(countWordSyllables('SEAI')).toBe(2);
  });

  it('calculates reading time and Flesch-Kincaid Grade Level accurately', () => {
    const sampleText = `
      Installing a modern heat pump in your Irish home reduces household energy bills significantly. 
      The SEAI offers grants up to six thousand five hundred euro to support homeowners.
      Proper attic insulation and double glazed windows prevent heat loss.
      Contact an approved one stop shop contractor to begin your home energy assessment today.
    `;

    const metrics = calculateReadabilityMetrics(sampleText, 200);

    expect(metrics.totalWords).toBeGreaterThan(40);
    expect(metrics.totalSentences).toBe(4);
    expect(metrics.fleschKincaidGradeLevel).toBeGreaterThan(5);
    expect(metrics.fleschKincaidGradeLevel).toBeLessThan(14);
    expect(metrics.fleschReadingEase).toBeGreaterThan(40);
    expect(metrics.estimatedReadingTimeFormatted).toMatch(/s read|min read/);
    expect(metrics.accessibilityLabel).toBeDefined();
  });

  it('handles empty text gracefully without throwing errors or NaN', () => {
    const metrics = calculateReadabilityMetrics('', 200);
    expect(metrics.totalWords).toBe(0);
    expect(metrics.fleschKincaidGradeLevel).toBe(0);
    expect(metrics.estimatedReadingTimeFormatted).toBe('0 min');
  });
});

describe('ReadabilityTimeWidget Component', () => {
  const sampleArticleContent = `
    # SEAI Heat Pump Grants Ireland 2026

    Upgrading your home heating system to an energy efficient heat pump is one of the best ways to reduce your carbon footprint and lower monthly electricity bills. 
    Under the National Retrofit Scheme, the Sustainable Energy Authority of Ireland (SEAI) provides substantial grant support.

    ## Grant Values and Financial Support
    Homeowners can claim up to €6,500 for air-to-water heat pump installations in detached or semi-detached properties. 
    Technical assessments must be completed before installation begins to ensure the dwelling reaches a heat loss indicator benchmark.

    ## Key Benefits for Homeowners
    Lower heating costs, consistent indoor comfort, improved Building Energy Rating (BER), and reduced dependence on fossil fuels make heat pumps a smart investment.
  `;

  it('renders the Readability & Time widget with title, reading time, and FKGL score badge', () => {
    render(<ReadabilityTimeWidget content={sampleArticleContent} />);

    expect(screen.getByText('Readability & Time')).toBeInTheDocument();
    expect(screen.getAllByText(/Grade/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Reading Time')).toBeInTheDocument();
    expect(screen.getByText('Flesch-Kincaid Grade')).toBeInTheDocument();
  });

  it('updates estimated reading time when changing words per minute reading pace', () => {
    render(<ReadabilityTimeWidget content={sampleArticleContent} />);

    const wpmSelect = screen.getByRole('combobox');
    expect(wpmSelect).toBeInTheDocument();

    fireEvent.change(wpmSelect, { target: { value: '280' } });
    expect(wpmSelect).toHaveValue('280');
  });

  it('collapses and expands the widget details when toggle button is clicked', () => {
    render(<ReadabilityTimeWidget content={sampleArticleContent} />);

    const toggleBtn = screen.getByRole('button', { name: /Collapse widget|Expand widget/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Avg Sentence Length')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Avg Sentence Length')).toBeInTheDocument();
  });
});
