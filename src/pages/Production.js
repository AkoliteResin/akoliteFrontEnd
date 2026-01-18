import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import axiosInstance from '../utils/axiosInstance';

const Production = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [dispatchQuantity, setDispatchQuantity] = useState('');
  const scrollPositionRef = React.useRef(0);

  // Fetch all productions
  const fetchProductions = async () => {
    // Save current scroll position before fetching
    scrollPositionRef.current = window.scrollY;
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/produced-resins');
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      setProductions(items);
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 0);
    } catch (err) {
      console.error('Error fetching productions:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load production records';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (production, newStatus) => {
    try {
      await axiosInstance.put(`/api/produced-resins/${production._id}`, { status: newStatus });
      setSuccessMessage(`Status updated to ${newStatus}`);
      fetchProductions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Status update error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update status';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle delete
  const handleDeleteClick = (production) => {
    setSelectedProduction(production);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduction) return;
    try {
      await axiosInstance.delete(`/api/produced-resins/${selectedProduction._id}`);
      setSuccessMessage(`Deleted production record and returned materials to stock`);
      setDeleteDialogOpen(false);
      setSelectedProduction(null);
      fetchProductions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete production record';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle dispatch
  const handleDispatchClick = (production) => {
    setSelectedProduction(production);
    setDispatchQuantity(production.litres.toString());
    setDispatchDialogOpen(true);
  };

  const handleDispatchConfirm = async () => {
    if (!selectedProduction || !dispatchQuantity) return;
    try {
      await axiosInstance.put(`/api/produced-resins/${selectedProduction._id}`, { 
        status: 'dispatched',
        dispatchedQuantity: Number(dispatchQuantity)
      });
      setSuccessMessage(`Dispatched ${dispatchQuantity} ${selectedProduction.unit || 'L'}`);
      setDispatchDialogOpen(false);
      setSelectedProduction(null);
      setDispatchQuantity('');
      fetchProductions();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Dispatch error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to dispatch';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'produced':
        return '#f59e0b'; // amber
      case 'completed':
        return '#3b82f6'; // blue
      case 'dispatched':
        return '#10b981'; // green
      case 'deleted':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  };

  const renderActionButton = (production) => {
    switch (production.status) {
      case 'pending':
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleStatusUpdate(production, 'produced')}
          >
            Produce
          </Button>
        );
      case 'produced':
        return (
          <Button
            size="small"
            variant="contained"
            color="info"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleStatusUpdate(production, 'completed')}
          >
            Complete
          </Button>
        );
      case 'completed':
        return (
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<LocalShippingIcon />}
            onClick={() => handleDispatchClick(production)}
          >
            Dispatch
          </Button>
        );
      case 'dispatched':
        return (
          <Chip
            label="Dispatched ✓"
            color="success"
            variant="outlined"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        Production Records
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track production workflow: Produce → Complete → Dispatch
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : productions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            No production records yet. Start by producing resin from the Resin Calculator.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Resin Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="right">
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="center">
                  Action
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="center">
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productions
                .filter((p) => p.status !== 'deleted')
                .map((production) => (
                  <TableRow
                    key={production._id}
                    sx={{
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <TableCell>
                      {new Date(production.producedAt || production.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{production.resinType}</TableCell>
                    <TableCell align="right">
                      {production.litres} {production.unit || 'L'}
                    </TableCell>
                    <TableCell>{production.clientName || '—'}</TableCell>
                    <TableCell>
                      {production.orderNumber ? `#${production.orderNumber}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(production.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(production.status),
                          color: '#fff',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {renderActionButton(production)}
                    </TableCell>
                    <TableCell align="center">
                      {production.status !== 'deleted' && (
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          color="error"
                          variant="text"
                          onClick={() => handleDeleteClick(production)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Production Record?</DialogTitle>
        <DialogContent>
          {selectedProduction && (
            <Typography>
              This will delete the production record for <strong>{selectedProduction.resinType}</strong> (
              {selectedProduction.litres} {selectedProduction.unit || 'L'}) and return materials to stock.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dispatch Dialog */}
      <Dialog open={dispatchDialogOpen} onClose={() => setDispatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dispatch Production</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedProduction && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Resin:</strong> {selectedProduction.resinType}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Client:</strong> {selectedProduction.clientName || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Available:</strong> {selectedProduction.litres} {selectedProduction.unit || 'L'}
              </Typography>
              <Typography variant="body2" color="info.main" sx={{ mt: 2 }}>
                Click "Dispatch" to mark as dispatched
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDispatchDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDispatchConfirm} 
            color="success" 
            variant="contained"
            startIcon={<LocalShippingIcon />}
          >
            Dispatch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Production;
