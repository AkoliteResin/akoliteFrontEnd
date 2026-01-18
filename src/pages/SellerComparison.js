import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axiosInstance from '../utils/axiosInstance';

const SellerComparison = () => {
  const [materialPrices, setMaterialPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      // Fetch seller pricing data with 5-day history
      const response = await axiosInstance.get('/api/sellers/comparison/all');
      // Transform the grouped data into materialPrices format
      const transformedData = Object.keys(response.data).map((materialName, idx) => {
        const sellers = {};
        
        // Group prices by seller/material and keep all historical data
        response.data[materialName].forEach((priceRecord) => {
          if (!sellers[priceRecord.sellerId]) {
            sellers[priceRecord.sellerId] = {
              sellerId: priceRecord.sellerId,
              sellerName: priceRecord.sellerName,
              phone: priceRecord.phone || 'N/A',
              currentPrice: 0,
              priceHistory: [],
            };
          }
          // Format timestamp from createdAt or updatedAt
          const timestamp = priceRecord.updatedAt || priceRecord.createdAt;
          const date = new Date(timestamp).toISOString().split('T')[0];
          const time = new Date(timestamp).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          });
          
          sellers[priceRecord.sellerId].priceHistory.push({
            date,
            time,
            dateTime: `${date} ${time}`,
            price: priceRecord.price,
            timestamp,
          });
        });

        // Sort history by date (newest first) and set current price as the latest
        let lowestPrice = Infinity;
        Object.values(sellers).forEach((seller) => {
          // Sort price history by createdAt/updatedAt descending (newest first)
          seller.priceHistory.sort((a, b) => {
            // Parse dates - backend returns ISO string or Date
            const dateA = new Date(a.timestamp || a.updatedAt || a.createdAt || a.date);
            const dateB = new Date(b.timestamp || b.updatedAt || b.createdAt || b.date);
            return dateB - dateA;
          });
          // Keep only 5 latest prices
          seller.priceHistory = seller.priceHistory.slice(0, 5);
          // Current price is the LATEST (most recent) price
          seller.currentPrice = seller.priceHistory[0]?.price || 0;
          if (seller.currentPrice < lowestPrice) {
            lowestPrice = seller.currentPrice;
          }
        });

        // Mark lowest price seller
        Object.values(sellers).forEach((seller) => {
          seller.isLowest = seller.currentPrice === lowestPrice;
        });

        return {
          materialId: idx + 1,
          materialName,
          unit: 'kg',
          sellers: Object.values(sellers),
        };
      });

      setMaterialPrices(transformedData);
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
      // Mock data for development
      setMaterialPrices(mockPricingData);
    } finally {
      setLoading(false);
    }
  };

  const mockPricingData = [
    {
      materialId: 1,
      materialName: 'Polyester Resin',
      unit: 'kg',
      sellers: [
        {
          sellerId: 1,
          sellerName: 'ABC Chemicals',
          phone: '9876543210',
          currentPrice: 450,
          isLowest: true,
          priceHistory: [
            { date: '2026-01-02', price: 450 },
            { date: '2026-01-01', price: 452 },
            { date: '2025-12-31', price: 455 },
            { date: '2025-12-30', price: 453 },
            { date: '2025-12-29', price: 450 },
          ],
        },
        {
          sellerId: 2,
          sellerName: 'XYZ Enterprises',
          phone: '8765432109',
          currentPrice: 465,
          isLowest: false,
          priceHistory: [
            { date: '2026-01-02', price: 465 },
            { date: '2026-01-01', price: 463 },
            { date: '2025-12-31', price: 460 },
            { date: '2025-12-30', price: 462 },
            { date: '2025-12-29', price: 465 },
          ],
        },
        {
          sellerId: 3,
          sellerName: 'Tech Materials',
          phone: '7654321098',
          currentPrice: 480,
          isLowest: false,
          priceHistory: [
            { date: '2026-01-02', price: 480 },
            { date: '2026-01-01', price: 478 },
            { date: '2025-12-31', price: 475 },
            { date: '2025-12-30', price: 480 },
            { date: '2025-12-29', price: 485 },
          ],
        },
      ],
    },
    {
      materialId: 2,
      materialName: 'Hardener',
      unit: 'kg',
      sellers: [
        {
          sellerId: 4,
          sellerName: 'Premium Supplies',
          phone: '6543210987',
          currentPrice: 320,
          isLowest: true,
          priceHistory: [
            { date: '2026-01-02', price: 320 },
            { date: '2026-01-01', price: 322 },
            { date: '2025-12-31', price: 325 },
            { date: '2025-12-30', price: 323 },
            { date: '2025-12-29', price: 320 },
          ],
        },
        {
          sellerId: 2,
          sellerName: 'XYZ Enterprises',
          phone: '8765432109',
          currentPrice: 340,
          isLowest: false,
          priceHistory: [
            { date: '2026-01-02', price: 340 },
            { date: '2026-01-01', price: 338 },
            { date: '2025-12-31', price: 335 },
            { date: '2025-12-30', price: 337 },
            { date: '2025-12-29', price: 340 },
          ],
        },
      ],
    },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const calculatePriceChange = (priceHistory) => {
    if (priceHistory.length < 2) return 0;
    const latest = priceHistory[0].price;
    const oldest = priceHistory[priceHistory.length - 1].price;
    return latest - oldest;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography>Loading seller pricing data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, color: 'text.primary' }}
        >
          Seller Price Comparison
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Compare prices from multiple sellers for each raw material. Updated daily with 5-day price history.
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4, borderBottom: '1px solid #e5e7eb' }}>
        {materialPrices.map((material, index) => (
          <Tab key={material.materialId} label={material.materialName} />
        ))}
      </Tabs>

      {materialPrices[activeTab] && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            {materialPrices[activeTab].materialName} ({materialPrices[activeTab].unit})
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {materialPrices[activeTab].sellers.map((seller) => {
              const priceChange = calculatePriceChange(seller.priceHistory);
              const percentChange = ((priceChange / seller.priceHistory[seller.priceHistory.length - 1].price) * 100).toFixed(2);

              return (
                <Grid item xs={12} sm={6} md={4} key={seller.sellerId}>
                  <Card
                    sx={{
                      backgroundColor: seller.isLowest ? '#dcfce7' : '#ffffff',
                      border: seller.isLowest ? '2px solid #10b981' : '1px solid #e5e7eb',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {seller.sellerName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {seller.phone}
                          </Typography>
                        </Box>
                        {seller.isLowest && (
                          <Chip label="Lowest Price" color="success" size="small" sx={{ fontWeight: 600 }} />
                        )}
                      </Box>

                      <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Current Price
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: seller.isLowest ? '#10b981' : '#1f2937' }}>
                          ₹{seller.currentPrice.toFixed(2)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          {priceChange < 0 ? (
                            <TrendingDownIcon sx={{ color: '#10b981', fontSize: 18 }} />
                          ) : priceChange > 0 ? (
                            <TrendingUpIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                          ) : null}
                          <Typography
                            variant="body2"
                            sx={{
                              color: priceChange < 0 ? '#10b981' : priceChange > 0 ? '#ef4444' : '#6b7280',
                              fontWeight: 600,
                            }}
                          >
                            {priceChange >= 0 ? '+' : ''} ₹{priceChange.toFixed(2)} ({percentChange}%)
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#1f2937' }}>
                        5-Day Price History
                      </Typography>
                      <TableContainer sx={{ backgroundColor: '#f9fafb', borderRadius: 1, mb: 2 }}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Date & Time</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">
                                Price
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {seller.priceHistory.map((history, idx) => (
                              <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#ffffff' } }}>
                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                  <Box>
                                    <div>{history.date}</div>
                                    <div sx={{ fontSize: '0.7rem', color: '#6b7280' }}>{history.time}</div>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }} align="right">
                                  ₹{history.price.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Summary Table */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Quick Comparison
            </Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Current Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>5-Day Change</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialPrices[activeTab].sellers.map((seller) => {
                    const priceChange = calculatePriceChange(seller.priceHistory);
                    return (
                      <TableRow key={seller.sellerId} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell sx={{ fontWeight: 500 }}>{seller.sellerName}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: seller.isLowest ? '#10b981' : '#1f2937' }}>
                          ₹{seller.currentPrice.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {priceChange < 0 ? (
                            <span style={{ color: '#10b981' }}>↓ ₹{Math.abs(priceChange).toFixed(2)}</span>
                          ) : priceChange > 0 ? (
                            <span style={{ color: '#ef4444' }}>↑ ₹{priceChange.toFixed(2)}</span>
                          ) : (
                            <span style={{ color: '#6b7280' }}>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {seller.isLowest && (
                            <Chip label="Lowest" color="success" size="small" sx={{ fontWeight: 600 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SellerComparison;
