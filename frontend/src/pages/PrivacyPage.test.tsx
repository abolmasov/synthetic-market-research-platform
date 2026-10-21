import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrivacyPage from './PrivacyPage';

describe('PrivacyPage', () => {
  it('renders privacy heading and key sections', () => {
    render(<PrivacyPage />);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('1. Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('4. Data Storage')).toBeInTheDocument();
  });
});
