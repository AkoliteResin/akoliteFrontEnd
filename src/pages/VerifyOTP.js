import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';

const VerifyOTP = ({ onLoginSuccess }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setError('OTP has expired. Please sign up again.');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'OTP verification failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call callback to update parent state
      onLoginSuccess(data.user);

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, mb: 3 }}>
            Verify Email
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
            An OTP has been sent to:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
            softwareakolite@gmail.com
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 3 }}>
            Your email: {email}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleVerify}>
            <TextField
              fullWidth
              label="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              margin="normal"
              disabled={loading || timeLeft <= 0}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: { fontSize: '24px', letterSpacing: '10px', textAlign: 'center' },
              }}
            />

            <Box sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: timeLeft < 120 ? '#ef4444' : '#666' }}>
                Time remaining: {formatTime(timeLeft)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 1, mb: 2 }}
              type="submit"
              disabled={loading || timeLeft <= 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2, color: 'textSecondary' }}>
            Didn't receive the OTP?{' '}
            <Button
              color="primary"
              size="small"
              onClick={() => navigate('/signup')}
              sx={{ p: 0, ml: 1 }}
            >
              Sign up again
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyOTP;
