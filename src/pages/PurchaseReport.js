import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const PurchaseReport = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await axiosInstance.get('/api/purchase-report');
        const data = response.data;
        setPurchaseData(data);
      } catch (error) {
        console.error('Failed to fetch purchase data:', error);
        setPurchaseData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Supplier', 'Material', 'Quantity', 'Unit Cost', 'Total Cost', 'Status'],
      ...purchaseData.map(item => [
        item.date || '',
        item.supplier || '',
        item.material || '',
        item.quantity || '',
        item.unitCost || '',
        item.totalCost || '',
        item.status || '',
      ])
    ]
      .map(e => e.join(','))
      .join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `purchase-report-${new Date().toISOString().split('T')[0]}.csv`;
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
            Purchase Report
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View all purchase orders and supplier transactions.
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
        <Typography>Loading purchase data...</Typography>
      ) : purchaseData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No purchase data available.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Unit Cost</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseData.map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.supplier}</TableCell>
                  <TableCell>{row.material}</TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">₹{row.unitCost}</TableCell>
                  <TableCell align="right">₹{row.totalCost}</TableCell>
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

export default PurchaseReport;
