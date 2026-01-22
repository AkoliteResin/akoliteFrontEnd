import React, { useState, useEffect } from 'react';
import axiosInstance, { API_ENDPOINTS } from '../utils/axiosInstance';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';

const PriceManagementModal = ({ open, onClose, seller, rawMaterials, onSave }) => {
  const [prices, setPrices] = useState(
    seller?.rawMaterialsSupplied?.reduce((acc, material) => {
      acc[material] = '';
      return acc;
    }, {}) || {}
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch latest prices when modal opens
  useEffect(() => {
    if (open && seller?._id) {
      fetchLatestPrices();
    }
  }, [open, seller?._id]);

  const fetchLatestPrices = async () => {
    try {
      const response = await axiosInstance.get(`/api/sellers/prices/${seller._id}`);
      if (response.data && response.data.length > 0) {
        // Get the latest price for each material
        const latestPrices = {};
        response.data.forEach((record) => {
          if (!latestPrices[record.material] || new Date(record.date) > new Date(latestPrices[record.material].date)) {
            latestPrices[record.material] = record;
          }
        });

        // Pre-populate the form with latest prices
        const updatedPrices = {};
        seller.rawMaterialsSupplied?.forEach((material) => {
          updatedPrices[material] = latestPrices[material]?.price || '';
        });
        setPrices(updatedPrices);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const handlePriceChange = (material, value) => {
    setPrices((prev) => ({
      ...prev,
      [material]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const priceData = Object.keys(prices)
        .filter((material) => prices[material])
        .map((material) => ({
          material,
          price: parseFloat(prices[material]),
          sellerId: seller._id,
          sellerName: seller.name,
          date: new Date().toISOString().split('T')[0],
        }));

      if (priceData.length === 0) {
        setMessage('Please enter at least one price');
        return;
      }

      console.log('Sending price data:', {
        sellerId: seller._id,
        sellerName: seller.name,
        prices: priceData,
      });

      const response = await axiosInstance.post('/api/sellers/prices/update', {
        sellerId: seller._id,
        sellerName: seller.name,
        prices: priceData,
      });

      console.log('Response:', response);
      setMessage('Prices updated successfully!');
      setTimeout(() => {
        onSave();
        onClose();
        setMessage('');
        setPrices({});
      }, 1500);
    } catch (error) {
      console.error('Error saving prices:', error);
      console.error('Error response:', error.response);
      setMessage(`Error: ${error.response?.data?.error || error.message || 'Failed to save prices'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
        💰 Update Prices - {seller?.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {message && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: message.includes('successfully') ? '#dcfce7' : '#fee2e2',
              color: message.includes('successfully') ? '#166534' : '#991b1b',
              fontWeight: 600,
            }}
          >
            {message}
          </Box>
        )}

        {seller?.rawMaterialsSupplied && seller.rawMaterialsSupplied.length > 0 ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the current prices for each raw material in ₹ per {rawMaterials.find(m => m.name === seller.rawMaterialsSupplied[0])?.unit || 'unit'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {seller.rawMaterialsSupplied.map((material) => (
                <Box key={material} sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                  <Typography
                    sx={{
                      flex: 1,
                      fontWeight: 600,
                      color: '#1f2937',
                      minWidth: '120px',
                    }}
                  >
                    {material}
                  </Typography>
                  <TextField
                    type="number"
                    label="Price"
                    inputProps={{ step: '0.01', min: '0' }}
                    value={prices[material]}
                    onChange={(e) => handlePriceChange(material, e.target.value)}
                    placeholder="0.00"
                    sx={{ width: '150px' }}
                    size="small"
                  />
                  <Typography sx={{ minWidth: '30px', fontWeight: 600 }}>₹</Typography>
                </Box>
              ))}
            </Box>

            {/* Show recent prices info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                💡 Last Updated Prices:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The prices shown above are your latest saved prices. Edit them and save to update.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">
            No raw materials assigned to this seller. Please add raw materials first.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Saving...' : 'Save Prices'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriceManagementModal;
