import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setLocalError('Name is required');
          setSubmitting(false);
          return;
        }
        await register(email, password, name);
      }
      navigate('/');
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'An error occurred',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700}>
                SMR Platform
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Synthetic Market Research
              </Typography>
            </Box>

            <Typography variant="h6" align="center">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Typography>

            {(localError || error) && (
              <Alert severity="error">{localError || error}</Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {mode === 'register' && (
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    autoComplete="name"
                  />
                )}
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  autoComplete="email"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  inputProps={{ minLength: 8 }}
                  helperText={
                    mode === 'register' ? 'Minimum 8 characters' : undefined
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{ py: 1.2 }}
                >
                  {submitting
                    ? 'Please wait...'
                    : mode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" align="center">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setMode('register');
                      setLocalError(null);
                    }}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setMode('login');
                      setLocalError(null);
                    }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
