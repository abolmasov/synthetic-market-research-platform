import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TermsPage from './TermsPage';

describe('TermsPage', () => {
  it('renders terms heading and core sections', () => {
    render(<TermsPage />);

    expect(screen.getByText('Terms of Use')).toBeInTheDocument();
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('7. Limitation of Liability')).toBeInTheDocument();
  });
});
