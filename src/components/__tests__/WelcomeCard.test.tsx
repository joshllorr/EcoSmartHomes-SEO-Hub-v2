import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WelcomeCard from '../WelcomeCard';

vi.mock('../store/useDashboardStore', () => ({
  useDashboardStore: vi.fn((selector) => {
    const store = {
      targetDomain: 'ecosmarthomes.ie',
    };
    if (selector) return selector(store);
    return store;
  }),
}));

describe('WelcomeCard', () => {
  it('renders the welcome heading', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);
    expect(screen.getByText(/Welcome back, Joe/)).toBeInTheDocument();
  });

  it('renders the target domain', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);
    expect(screen.getByText('ecosmarthomes.ie')).toBeInTheDocument();
  });

  it('renders the Connect WordPress CMS button when not connected', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);
    expect(screen.getByText('Connect WordPress CMS')).toBeInTheDocument();
    expect(document.getElementById('connect-cms-welcome')).toBeInTheDocument();
  });

  it('renders the CMS connected status when isCMSConnected is true', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={true} />);
    expect(screen.getByText('WordPress CMS Connected')).toBeInTheDocument();
  });

  it('does not render the connect button when CMS is connected', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={true} />);
    expect(screen.queryByText('Connect WordPress CMS')).not.toBeInTheDocument();
  });

  it('opens the CMS modal when the connect button is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    expect(screen.getByText('Connect CMS Integration')).toBeInTheDocument();
  });

  it('calls onConnectCMS after selecting a CMS and clicking Authorize', async () => {
    const user = userEvent.setup();
    const onConnectCMS = vi.fn();
    render(<WelcomeCard onConnectCMS={onConnectCMS} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    await user.click(screen.getByText('WordPress Integration'));
    await user.click(screen.getByText('Authorize & Link'));

    await vi.waitFor(
      () => {
        expect(onConnectCMS).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );
  });

  it('closes the modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    expect(screen.getByText('Connect CMS Integration')).toBeInTheDocument();

    await user.click(screen.getByText('✕'));
    expect(
      screen.queryByText('Connect CMS Integration'),
    ).not.toBeInTheDocument();
  });

  it('closes the modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    await user.click(screen.getByText('Cancel'));
    expect(
      screen.queryByText('Connect CMS Integration'),
    ).not.toBeInTheDocument();
  });

  it('does not call onConnectCMS when no CMS is selected and Authorize is clicked', async () => {
    const user = userEvent.setup();
    const onConnectCMS = vi.fn();
    render(<WelcomeCard onConnectCMS={onConnectCMS} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    await user.click(screen.getByText('Authorize & Link'));

    await vi.waitFor(() => {
      expect(onConnectCMS).not.toHaveBeenCalled();
    });
  });

  it('shows the connecting spinner when connecting', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    await user.click(screen.getByText('WordPress Integration'));
    await user.click(screen.getByText('Authorize & Link'));

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('has the correct id on the card', () => {
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);
    expect(document.getElementById('welcome-card')).toBeInTheDocument();
  });

  it('renders the CMS description text', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    expect(
      screen.getByText(/Synchronize AI-generated content/),
    ).toBeInTheDocument();
  });

  it('renders both CMS options (WordPress and Webflow)', async () => {
    const user = userEvent.setup();
    render(<WelcomeCard onConnectCMS={vi.fn()} isCMSConnected={false} />);

    await user.click(screen.getByText('Connect WordPress CMS'));
    expect(screen.getByText('WordPress Integration')).toBeInTheDocument();
    expect(screen.getByText('Webflow CMS API')).toBeInTheDocument();
  });
});
