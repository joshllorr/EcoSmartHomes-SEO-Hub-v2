import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickActionsGrid from '../QuickActionsGrid';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../store/useDashboardStore', () => ({
  useDashboardStore: vi.fn((selector) => {
    const store = {
      setSERP: vi.fn(),
      setTitleMeta: vi.fn(),
      targetDomain: 'ecosmarthomes.ie',
    };
    if (selector) return selector(store);
    return store;
  }),
}));

vi.mock('../../utils/runSERPAnalysis', () => ({
  runSERPAnalysis: vi.fn().mockResolvedValue('{}'),
}));

vi.mock('../../utils/generateTitleMeta', () => ({
  generateTitleMeta: vi.fn().mockResolvedValue({ title: 'Test', slug: 'test' }),
}));

describe('QuickActionsGrid', () => {
  it('renders the card title and subtitle', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(screen.getByText('Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions Toolbelt')).toBeInTheDocument();
  });

  it('renders all 8 action buttons', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    const buttons = screen.getAllByRole('button', {
      name: /Generate Article|Rewrite Content|Optimize Content|Research Keywords|Scout Trends|Discover Opportunities|Build Links|Connect CMS/,
    });
    expect(buttons.length).toBe(8);
  });

  it('calls onActionClick with the correct action id when a button is clicked', async () => {
    const user = userEvent.setup();
    const onActionClick = vi.fn();
    render(<QuickActionsGrid onActionClick={onActionClick} />);

    const buttons = screen.getAllByRole('button');
    const generateBtn = buttons.find((b) =>
      b.textContent?.includes('Generate Article'),
    );
    expect(generateBtn).toBeInTheDocument();
    await user.click(generateBtn!);
    expect(onActionClick).toHaveBeenCalledWith('generate_article');
  });

  it('calls onActionClick with serp when the SERP Analysis button is clicked', async () => {
    const user = userEvent.setup();
    const onActionClick = vi.fn();
    render(<QuickActionsGrid onActionClick={onActionClick} />);

    const serpBtn = document.getElementById('quick-action-serp-btn');
    expect(serpBtn).toBeInTheDocument();
    await user.click(serpBtn!);
    expect(onActionClick).toHaveBeenCalledWith('serp');
  });

  it('renders the SERP analysis section', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(
      screen.getByText('Instant Competitor SERP Intelligence'),
    ).toBeInTheDocument();
  });

  it('renders the SEO Title & Meta Generator section', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(
      screen.getByText('Optimal SEO Title & Meta Generator'),
    ).toBeInTheDocument();
  });

  it('renders the topic input and tone selector', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(
      document.getElementById('title-meta-topic-input'),
    ).toBeInTheDocument();
    expect(
      document.getElementById('title-meta-tone-select'),
    ).toBeInTheDocument();
  });

  it('renders the Generate Title & Meta button', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(screen.getByText('Generate Title & Meta')).toBeInTheDocument();
  });

  it('displays error message when an action fails', async () => {
    const user = userEvent.setup();
    const onActionClick = vi.fn();
    const { runSERPAnalysis } = await import('../../utils/runSERPAnalysis');
    vi.mocked(runSERPAnalysis).mockRejectedValueOnce(
      new Error('Network error'),
    );

    render(<QuickActionsGrid onActionClick={onActionClick} />);

    const serpBtn = document.getElementById('quick-action-serp-btn');
    expect(serpBtn).toBeInTheDocument();
    await user.click(serpBtn!);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('has the correct id on the quick actions card', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(document.getElementById('quick-actions-card')).toBeInTheDocument();
  });

  it('has correct ids on action buttons', () => {
    render(<QuickActionsGrid onActionClick={vi.fn()} />);
    expect(
      document.getElementById('quick-action-generate_article'),
    ).toBeInTheDocument();
    expect(
      document.getElementById('quick-action-serp-box'),
    ).toBeInTheDocument();
    expect(
      document.getElementById('quick-action-title-meta-box'),
    ).toBeInTheDocument();
    expect(
      document.getElementById('quick-action-serp-btn'),
    ).toBeInTheDocument();
    expect(
      document.getElementById('generate-title-meta-btn'),
    ).toBeInTheDocument();
  });
});
