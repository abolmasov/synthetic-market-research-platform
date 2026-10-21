
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import LoginPage from './LoginPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../contexts/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    error: null,
  }),
}));

describe('LoginPage', () => {
  it('renders login form by default', () => {
    render(<LoginPage />);
    // "Sign In" appears in title and button
    const signIns = screen.getAllByText('Sign In');
    expect(signIns.length).toBeGreaterThan(0);
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    render(<LoginPage />);
    
    // Find the Register link/button and click it
    const registerLink = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerLink);
    
    // Now check for "Create Account"
    const createAccounts = screen.getAllByText('Create Account');
    expect(createAccounts.length).toBeGreaterThan(0);
    
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });
});
