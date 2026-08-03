import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '../MetricCard';

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Revenue" value={1234} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders title and value as string', () => {
    render(<MetricCard title="Status" value="Active" />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders subText when provided', () => {
    render(<MetricCard title="Users" value={42} subText="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('does not render value when value is undefined', () => {
    render(<MetricCard title="Pending" subText="Awaiting data" />);
    expect(screen.queryByText('Pending')).toBeInTheDocument();
    expect(screen.queryByText('Awaiting data')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders heartbeat mode instead of value', () => {
    render(
      <MetricCard
        title="Crawler"
        heartbeat
        heartbeatMessage="Crawler active"
      />,
    );
    expect(screen.getByText('Crawler')).toBeInTheDocument();
    expect(screen.getByText('Crawler active')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders default heartbeat message when heartbeatMessage is omitted', () => {
    render(<MetricCard title="Crawler" heartbeat />);
    expect(screen.getByText('Waiting for crawler...')).toBeInTheDocument();
  });

  it('renders progress bar when progress is provided', () => {
    render(<MetricCard title="Progress" value={75} progress={60} />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    const progressBar = document.querySelector('[style*="width: 60%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('clamps progress to 100 when over 100', () => {
    render(<MetricCard title="Progress" value={100} progress={150} />);
    const innerBar = document.querySelector('[style*="width"]');
    expect(innerBar).toBeInTheDocument();
  });

  it('clamps progress to 0 when negative', () => {
    render(<MetricCard title="Progress" value={0} progress={-10} />);
    const innerBar = document.querySelector('[style*="width"]');
    expect(innerBar).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <MetricCard
        title="Visitors"
        value={42}
        icon={<span data-testid="mock-icon">📊</span>}
      />,
    );
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MetricCard title="Test" value={1} className="custom-class" />);
    const card = document.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('applies custom style', () => {
    render(
      <MetricCard title="Styled" value={1} style={{ borderColor: 'red' }} />,
    );
    const card = document.querySelector('[style*="border-color: red"]');
    expect(card).toBeInTheDocument();
  });

  it('does not render subText when not provided', () => {
    render(<MetricCard title="No Sub" value={100} />);
    expect(screen.getByText('No Sub')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(1);
  });

  it('does not render progress bar when progress is not provided', () => {
    render(<MetricCard title="No Progress" value={100} />);
    expect(screen.getByText('No Progress')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(document.querySelector('[style*="width"]')).not.toBeInTheDocument();
  });
});
