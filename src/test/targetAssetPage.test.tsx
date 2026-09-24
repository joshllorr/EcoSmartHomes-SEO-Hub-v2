import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import TargetAssetPage from '../pages/TargetAssetPage';

describe('TargetAssetPage Component', () => {
  it('renders Solar PV Payback Estimator asset correctly', () => {
    render(<TargetAssetPage initialSlug="solar-pv-payback-estimator" />);
    expect(
      screen.getByText(/Irish Solar PV & Battery Payback Estimator/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/selfbuild\.ie/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Clean Export Guarantee/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Estimated Payback/i)).toBeInTheDocument();
  });

  it('renders Limerick V94 Retrofit Grants asset correctly', () => {
    render(<TargetAssetPage initialSlug="limerick-v94-retrofit-grants" />);
    expect(
      screen.getByText(/Limerick V94 Residential Energy Retrofit Grants/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/limerickleader\.ie/i)).toBeInTheDocument();
    expect(screen.getByText(/Raheen & Dooradoyle/i)).toBeInTheDocument();
    expect(screen.getByText(/42% Bill Cut/i)).toBeInTheDocument();
  });

  it('renders BER Rating Upgrade Guide asset correctly', () => {
    render(<TargetAssetPage initialSlug="ber-rating-upgrade-guide" />);
    expect(
      screen.getByText(
        /The Ultimate 2026 Irish Home Retrofit & BER Upgrade Masterguide/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/constructireland\.ie/i)).toBeInTheDocument();
    expect(screen.getByText(/Modernized 8-Tier Scale/i)).toBeInTheDocument();
  });

  it('renders Heat Pump Cost Calculator asset correctly', () => {
    render(<TargetAssetPage initialSlug="heat-pump-cost-calculator" />);
    expect(
      screen.getByText(
        /Heat Pump vs Gas\/Oil Boiler 10-Year Running Cost Calculator/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/energyperformancedatabase\.ie/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/10-Year Fuel Savings/i)).toBeInTheDocument();
  });
});
