import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';

const accountSections = [
  {
    title: 'Billing',
    description: 'View invoices and payment records.',
    link: '/billing',
    icon: <ReceiptIcon sx={{ fontSize: 40, color: '#3b82f6' }} />,
    color: '#dbeafe',
  },
  {
    title: 'Billing History',
    description: 'View all past billing records and invoices.',
    link: '/billing-history',
    icon: <HistoryIcon sx={{ fontSize: 40, color: '#10b981' }} />,
    color: '#dcfce7',
  },
];

const Account = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, color: 'text.primary' }}
      >
        Account
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ maxWidth: 800 }}
      >
        Manage your billing and payment records.
      </Typography>
    </Box>

    <Grid container spacing={4}>
      {accountSections.map((section, idx) => (
        <Grid item xs={12} sm={6} md={6} key={idx}>
          <Link to={section.link} style={{ textDecoration: 'none' }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: '100%',
                backgroundColor: section.color,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 3,
                  backgroundColor: section.color,
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{section.icon}</Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {section.description}
              </Typography>
            </Paper>
          </Link>
        </Grid>
      ))}
    </Grid>
  </Container>
);

export default Account;
