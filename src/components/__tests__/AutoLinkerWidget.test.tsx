import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AutoLinkerWidget from '../AutoLinkerWidget';

describe('AutoLinkerWidget component', () => {
  const sampleText = `
# Retrofitting in Ireland

When starting a deep retrofit, applying for the SEAI home energy upgrade grants is the first critical step.
You can install an air-to-water heat pump to replace an old oil boiler and dramatically raise your BER rating.
`;

  it('renders the Auto-Linker widget and shows detected link opportunities', () => {
    const handleUpdate = vi.fn();
    render(
      <AutoLinkerWidget
        content={sampleText}
        onUpdateContent={handleUpdate}
        siteUrl="ecosmarthomes.ie"
      />,
    );

    expect(screen.getByText('Auto-Linker')).toBeInTheDocument();
    expect(screen.getByText('Semantic Mesh')).toBeInTheDocument();
    expect(screen.getAllByText(/Insert Link/i).length).toBeGreaterThan(0);
  });

  it('allows one-click insertion of an internal link into draft text', () => {
    const handleUpdate = vi.fn();
    const handleXP = vi.fn();

    render(
      <AutoLinkerWidget
        content={sampleText}
        onUpdateContent={handleUpdate}
        siteUrl="ecosmarthomes.ie"
        onXPUnlock={handleXP}
      />,
    );

    const insertButtons = screen.getAllByRole('button', { name: /Insert Link/i });
    expect(insertButtons.length).toBeGreaterThan(0);

    fireEvent.click(insertButtons[0]);

    expect(handleUpdate).toHaveBeenCalled();
    const newText = handleUpdate.mock.calls[0][0];
    expect(newText).toContain('https://ecosmarthomes.ie');
    expect(handleXP).toHaveBeenCalledWith(5);
  });

  it('allows one-click Auto-Link All button', () => {
    const handleUpdate = vi.fn();
    const handleXP = vi.fn();

    render(
      <AutoLinkerWidget
        content={sampleText}
        onUpdateContent={handleUpdate}
        siteUrl="ecosmarthomes.ie"
        onXPUnlock={handleXP}
      />,
    );

    const autoLinkAllBtn = screen.getByRole('button', { name: /Auto-Link All/i });
    expect(autoLinkAllBtn).toBeInTheDocument();

    fireEvent.click(autoLinkAllBtn);
  });
});
