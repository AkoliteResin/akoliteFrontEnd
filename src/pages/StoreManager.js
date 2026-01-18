import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalculateIcon from '@mui/icons-material/Calculate';

const storeManagerSections = [
  {
    title: 'Inventory',
    description: 'View and manage raw material stock.',
    link: '/raw-materials',
    icon: <InventoryIcon sx={{ fontSize: 40, color: '#14b8a6' }} />,
    color: '#ccfbf1',
  },
  {
    title: 'Resin Calculator',
    description: 'Calculate resin production requirements.',
    link: '/resin-calculator',
    icon: <CalculateIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
    color: '#e0e7ff',
  },
];

const StoreManager = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, color: 'text.primary' }}
      >
        Store Manager
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ maxWidth: 800 }}
      >
        Manage inventory and calculate resin production requirements.
      </Typography>
    </Box>

    <Grid container spacing={4}>
      {storeManagerSections.map((section, idx) => (
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

export default StoreManager;
