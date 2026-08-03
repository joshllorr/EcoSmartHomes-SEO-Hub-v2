import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HubStatus from '../HubStatus';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('HubStatus', () => {
  it('renders the checking state initially', () => {
    render(<HubStatus />);
    expect(screen.getByText('Checking…')).toBeInTheDocument();
  });

  it('renders the online state after a successful fetch', async () => {
    const mockHealth = {
      status: 'ok',
      service: 'EcoSmartHomes Hub',
      version: 'Phase 16',
      uptime: 3661,
      totalEventsSynced: 42,
      lastSyncAt: Date.now(),
      timestamp: Date.now(),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealth),
    } as Response);

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Online')).toBeInTheDocument();
    });
  });

  it('renders the offline state after a failed fetch', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Offline')).toBeInTheDocument();
    });
  });

  it('renders the offline state when fetch returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Offline')).toBeInTheDocument();
    });
  });

  it('has the hubStatusPill button', () => {
    render(<HubStatus />);
    expect(document.getElementById('hubStatusPill')).toBeInTheDocument();
  });

  it('has a tooltip with health details when hub is online and tooltip is shown', async () => {
    const mockHealth = {
      status: 'ok',
      service: 'EcoSmartHomes Hub',
      version: 'Phase 16',
      uptime: 3661,
      totalEventsSynced: 42,
      lastSyncAt: Date.now(),
      timestamp: Date.now(),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealth),
    } as Response);

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Online')).toBeInTheDocument();
    });

    const pill = document.getElementById('hubStatusPill')!;
    await userEvent.hover(pill);

    expect(screen.getByText('● Hub Health')).toBeInTheDocument();
    expect(screen.getByText('EcoSmartHomes Hub')).toBeInTheDocument();
    expect(screen.getByText('Phase 16')).toBeInTheDocument();
  });

  it('does not show tooltip when hub is offline', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Offline')).toBeInTheDocument();
    });

    const pill = document.getElementById('hubStatusPill')!;
    await userEvent.hover(pill);

    expect(screen.queryByText('● Hub Health')).not.toBeInTheDocument();
  });

  it('calls fetch on click to re-check status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'ok',
          service: 'EcoSmartHomes Hub',
          version: 'Phase 16',
          uptime: 100,
          totalEventsSynced: 1,
          lastSyncAt: Date.now(),
          timestamp: Date.now(),
        }),
    } as Response);

    global.fetch = fetchMock;

    render(<HubStatus />);

    await vi.waitFor(() => {
      expect(screen.getByText('Hub Online')).toBeInTheDocument();
    });

    const pill = document.getElementById('hubStatusPill')!;
    await userEvent.click(pill);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
