import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '../components/MetricCard';

describe('Example Tests', () => {
  it('renders MetricCard with title and value', () => {
    render(<MetricCard title="Revenue" value={1234} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders MetricCard with subText', () => {
    render(<MetricCard title="Users" value={42} subText="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calculates basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });
});
