import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const salesSections = [
  {
    title: 'Client Payments',
    description: 'Manage your sales operations including orders, clients, and payments.',
    link: '/client-payments',
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
    color: '#ede9fe',
  },
  {
    title: 'Orders For Future',
    description: 'View and manage future orders.',
    link: '/future-orders',
    icon: <ShoppingCartIcon sx={{ fontSize: 40, color: '#3b82f6' }} />,
    color: '#dbeafe',
  },
  {
    title: 'Client Details',
    description: 'View all client details.',
    link: '/clients-details',
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#10b981' }} />,
    color: '#dcfce7',
  },
  {
    title: 'Payments Due',
    description: 'Check all pending payments.',
    link: '/payments-due',
    icon: <AttachMoneyIcon sx={{ fontSize: 40, color: '#f59e0b' }} />,
    color: '#fef3c7',
  },
];

const Sales = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, color: 'text.primary' }}
      >
        Sales Management
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ maxWidth: 800 }}
      >
        Manage your sales operations including orders, clients, and payments.
      </Typography>
    </Box>

    <Grid container spacing={4}>
      {salesSections.map((section, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
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

export default Sales;
