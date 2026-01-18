import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const PaymentCollected = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await axiosInstance.get('/api/payment-collected');
        const data = response.data;
        setPaymentData(data);
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        setPaymentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Client', 'Amount', 'Method', 'Reference', 'Status'],
      ...paymentData.map(item => [
        item.date || '',
        item.client || '',
        item.amount || '',
        item.method || '',
        item.reference || '',
        item.status || '',
      ])
    ]
      .map(e => e.join(','))
      .join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `payment-collected-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 800, color: 'text.primary' }}
          >
            Payment Collected
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View all collected payments from clients.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          sx={{ textTransform: 'none' }}
        >
          Export CSV
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading payment data...</Typography>
      ) : paymentData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No payment data available.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentData.map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell align="right">₹{row.amount}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.reference}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: row.status === 'Completed' ? '#dcfce7' : row.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: row.status === 'Completed' ? '#166534' : row.status === 'Pending' ? '#b45309' : '#991b1b',
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PaymentCollected;
