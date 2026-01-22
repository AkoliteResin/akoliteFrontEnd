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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const ClientPayments = () => {
  const [data, setData] = useState({
    orders: [],
    clients: [],
  });
  const [expandedClient, setExpandedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientPaymentsData();
  }, []);

  const fetchClientPaymentsData = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersResponse = await axiosInstance.get(API_ENDPOINTS.ORDERS.GET_ALL);
      const ordersData = ordersResponse.data;

      // Fetch clients
      const clientsResponse = await axiosInstance.get(API_ENDPOINTS.CLIENTS.GET_ALL);
      const clientsData = clientsResponse.data;

      setData({
        orders: ordersData || [],
        clients: clientsData || [],
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load client payments data');
    } finally {
      setLoading(false);
    }
  };

  // Group orders by client
  const groupOrdersByClient = () => {
    const clientOrdersMap = {};

    data.clients.forEach(client => {
      clientOrdersMap[client.id] = {
        client,
        orders: [],
        totalAmount: 0,
      };
    });

    data.orders.forEach(order => {
      if (clientOrdersMap[order.clientId]) {
        clientOrdersMap[order.clientId].orders.push(order);
        clientOrdersMap[order.clientId].totalAmount += order.amount || 0;
      }
    });

    return Object.values(clientOrdersMap).filter(item => item.orders.length > 0);
  };

  const clientOrdersList = groupOrdersByClient();

  const handleToggleClient = (clientId) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
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
          👥 Client Payments
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View orders grouped by client with payment amounts
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards */}
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Total Orders" />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {data.orders.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Total Amount Due" />
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                ₹{clientOrdersList.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Clients List with Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Orders by Client
            </Typography>

            <List sx={{ width: '100%' }}>
              {clientOrdersList.map((item, index) => (
                <div key={item.client.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleToggleClient(item.client.id)}
                      sx={{
                        bgcolor: expandedClient === item.client.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {item.client.name || 'Unknown Client'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">
                                {item.orders.length} order{item.orders.length !== 1 ? 's' : ''}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                ₹{item.totalAmount.toLocaleString('en-IN')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={item.client.email || 'N/A'}
                      />
                      {expandedClient === item.client.id ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>

                  {/* Order Details */}
                  <Collapse in={expandedClient === item.client.id} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 4, pr: 2, py: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                Amount
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    #{order.orderNumber || order.id}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#388e3c' }}>
                                    ₹{(order.amount || 0).toLocaleString('en-IN')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      bgcolor: order.status === 'paid' ? '#d4edda' : '#fff3cd',
                                      color: order.status === 'paid' ? '#155724' : '#856404',
                                      fontWeight: 500,
                                      textAlign: 'center',
                                      width: 'fit-content',
                                    }}
                                  >
                                    {order.status || 'Pending'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>

                  {index < clientOrdersList.length - 1 && <Divider sx={{ my: 1 }} />}
                </div>
              ))}
            </List>

            {clientOrdersList.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                No orders found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientPayments;
