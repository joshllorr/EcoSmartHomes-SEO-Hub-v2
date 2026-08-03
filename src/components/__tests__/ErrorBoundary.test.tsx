import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error has occurred', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello World</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws an error', () => {
    const ThrowError = () => {
      throw new Error('Something broke');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('Something went wrong rendering this section'),
    ).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('displays the sectionName in the error fallback', () => {
    const ThrowError = () => {
      throw new Error('Section crash');
    };

    render(
      <ErrorBoundary sectionName="Dashboard Widget">
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('in Dashboard Widget')).toBeInTheDocument();
    expect(
      document.getElementById('error-boundary-dashboard-widget'),
    ).toBeInTheDocument();
  });

  it('shows default section name when sectionName is not provided', () => {
    const ThrowError = () => {
      throw new Error('Generic crash');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      document.getElementById('error-boundary-generic'),
    ).toBeInTheDocument();
  });

  it('calls console.error with section name when an error is caught', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary sectionName="My Section">
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      '[ErrorBoundary] Uncaught error in section "My Section":',
      expect.any(Error),
      expect.any(Object),
    );

    consoleSpy.mockRestore();
  });

  it('renders the Reset Section button in the fallback', () => {
    const ThrowError = () => {
      throw new Error('Reset test');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const buttons = screen.getAllByRole('button', {
      name: /reset section/i,
    });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the state safeguard message in the fallback', () => {
    const ThrowError = () => {
      throw new Error('State test');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/State safeguarded/)).toBeInTheDocument();
  });
});
