import React, { useEffect, useState } from 'react';
import axiosInstance, { API_ENDPOINTS } from '../utils/axiosInstance';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import SectionCard from '../components/SectionCard';

const ResinPayments = () => {
  const [data, setData] = useState({
    orders: [],
    clients: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResinPaymentsData();
  }, []);

  const fetchResinPaymentsData = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersResponse = await axiosInstance.get(API_ENDPOINTS.ORDERS.GET_ALL);
      const ordersData = ordersResponse.data;

      // Fetch clients
      const clientsResponse = await axiosInstance.get(API_ENDPOINTS.CLIENTS.GET_ALL);
      const clientsData = clientsResponse.data;

      setData({
        orders: ordersData,
        clients: clientsData,
        payments: [],
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load resin payments data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          💎 Resin Payments
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your sales operations including orders, clients, and payments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Orders Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Total Orders" />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {data.orders.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active resin orders
              </Typography>
              <Button
                size="small"
                href="/orders"
                sx={{ mt: 2 }}
              >
                View Orders
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Clients Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Total Clients" />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                {data.clients.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active clients
              </Typography>
              <Button
                size="small"
                href="/clients"
                sx={{ mt: 2 }}
              >
                View Clients
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Payments Due */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Payments" />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                Pending
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Outstanding payments
              </Typography>
              <Button
                size="small"
                href="/payments-due"
                sx={{ mt: 2 }}
              >
                View Payments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <SectionCard title="Quick Actions" description="Manage your sales operations">
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                href="/orders"
              >
                Create New Order
              </Button>
              <Button
                variant="outlined"
                color="primary"
                href="/clients"
              >
                Add Client
              </Button>
              <Button
                variant="outlined"
                color="primary"
                href="/collection"
              >
                Collect Payment
              </Button>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResinPayments;
