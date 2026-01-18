import React from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import TodayIcon from '@mui/icons-material/Today';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalculateIcon from '@mui/icons-material/Calculate';

const generalManagerSections = [
  {
    title: "Day's Summary",
    description: 'Get daily insights on production and sales.',
    link: '/day-summary',
    icon: <TodayIcon sx={{ fontSize: 40, color: '#3b82f6' }} />,
    color: '#dbeafe',
  },
  {
    title: 'Daily Expenses',
    description: 'Track HR, Labour, and Employee expenses.',
    link: '/expenses',
    icon: <AttachMoneyIcon sx={{ fontSize: 40, color: '#ef4444' }} />,
    color: '#fee2e2',
  },
  {
    title: 'Location Report',
    description: 'View orders by district and state.',
    link: '/location-report',
    icon: <MapIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />,
    color: '#ede9fe',
  },
  {
    title: 'Client Inactivity',
    description: 'Track clients by last order date and download reports.',
    link: '/client-inactivity',
    icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#06b6d4' }} />,
    color: '#cffafe',
  },
  {
    title: 'All Orders',
    description: 'View and track all orders from production hub.',
    link: '/all-orders',
    icon: <ListAltIcon sx={{ fontSize: 40, color: '#10b981' }} />,
    color: '#dcfce7',
  },
  {
    title: 'Payments Due',
    description: 'Check all pending payments.',
    link: '/payments-due',
    icon: <AttachMoneyIcon sx={{ fontSize: 40, color: '#f59e0b' }} />,
    color: '#fef3c7',
  },
  {
    title: 'Purchase Report',
    description: 'View all purchase orders and supplier details.',
    link: '/purchase-report',
    icon: <ShoppingCartIcon sx={{ fontSize: 40, color: '#ec4899' }} />,
    color: '#fce7f3',
  },
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

const GeneralManager = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, color: 'text.primary' }}
      >
        General Manager Dashboard
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ maxWidth: 800 }}
      >
        Overview and management of all operational reports, expenses, inventory, and analytics.
      </Typography>
    </Box>

    <Grid container spacing={4}>
      {generalManagerSections.map((section, idx) => (
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

export default GeneralManager;
