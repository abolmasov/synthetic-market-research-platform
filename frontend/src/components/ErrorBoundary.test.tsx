import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const ThrowAlways = () => {
  throw new Error('Test error message');
};

const NormalComponent = () => <div>Normal content</div>;

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowAlways />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows recovery UI with Try Again and Reload buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowAlways />
      </ErrorBoundary>,
    );

    const tryAgainBtn = screen.getByText('Try Again');
    const reloadBtn = screen.getByText('Reload Page');

    expect(tryAgainBtn).toBeInTheDocument();
    expect(reloadBtn).toBeInTheDocument();
  });

  it('displays descriptive error text', () => {
    render(
      <ErrorBoundary>
        <ThrowAlways />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText(
        'An unexpected error occurred. This could be a temporary issue.',
      ),
    ).toBeInTheDocument();
  });
});
