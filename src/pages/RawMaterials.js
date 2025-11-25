import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, Fab, Modal,
  IconButton, Snackbar, Alert
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material";
import ResinCalculator from "./ResinCalculator"; // Assuming this is also being updated or is compatible

function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [showResinModal, setShowResinModal] = useState(false);
  const [newResin, setNewResin] = useState({ name: "", rawMaterials: [{ name: "", percentage: "" }] });
  const [availableRawMaterials, setAvailableRawMaterials] = useState([]);
  const [showAddRawMaterialInput, setShowAddRawMaterialInput] = useState(false);
  const [newRawMaterialName, setNewRawMaterialName] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/raw-materials");
      setMaterials(res.data);
      setAvailableRawMaterials(res.data.map(m => m.name));
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to fetch raw materials.', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAdd = async () => {
    if (!selectedMaterial || !addQuantity) return setSnackbar({ open: true, message: 'Please select a material and enter a quantity to add.', severity: 'warning' });
    try {
      await axios.post("http://localhost:5000/api/raw-materials/add", {
        name: selectedMaterial,
        quantity: Number(addQuantity),
      });
      setAddQuantity("");
      fetchMaterials();
      setSnackbar({ open: true, message: 'Quantity added successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to add stock.', severity: 'error' });
    }
  };

  const handleModify = async () => {
    if (!selectedMaterial || !modifyQuantity) return setSnackbar({ open: true, message: 'Please select a material and enter the new total quantity.', severity: 'warning' });
    try {
      await axios.put("http://localhost:5000/api/raw-materials/modify", {
        name: selectedMaterial,
        newQuantity: Number(modifyQuantity),
      });
      setModifyQuantity("");
      fetchMaterials();
      setSnackbar({ open: true, message: 'Quantity modified successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to modify quantity.', severity: 'error' });
    }
  };

  const handleAddRawMaterialToResin = () => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { name: "", percentage: "" }]
    }));
  };

  const handleRemoveRawMaterialFromResin = (index) => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((_, i) => i !== index)
    }));
  };

  const handleRawMaterialChange = (index, field, value) => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((rm, i) =>
        i === index ? { ...rm, [field]: value } : rm
      )
    }));
  };

  const handleSaveResin = async () => {
    if (!newResin.name.trim()) return setSnackbar({ open: true, message: 'Please enter a resin name.', severity: 'warning' });
    if (newResin.rawMaterials.length === 0) return setSnackbar({ open: true, message: 'Please add at least one raw material.', severity: 'warning' });

    const invalid = newResin.rawMaterials.some(rm => !rm.name || !rm.percentage || Number(rm.percentage) <= 0);
    if (invalid) return setSnackbar({ open: true, message: 'Please fill in all raw material names and percentages correctly.', severity: 'warning' });

    const totalPercentage = newResin.rawMaterials.reduce((sum, rm) => sum + Number(rm.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) return setSnackbar({ open: true, message: `Total percentage must be 100%. Current: ${totalPercentage.toFixed(2)}%`, severity: 'error' });

    console.log("Saving resin configuration:", newResin);
    setSnackbar({ open: true, message: 'Resin configuration saved! (Backend needed)', severity: 'info' });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowResinModal(false);
    setNewResin({ name: "", rawMaterials: [{ name: "", percentage: "" }] });
    setShowAddRawMaterialInput(false);
    setNewRawMaterialName("");
  };

  const handleAddNewRawMaterialToList = () => {
    if (!newRawMaterialName.trim()) return setSnackbar({ open: true, message: 'Please enter a raw material name.', severity: 'warning' });
    if (availableRawMaterials.includes(newRawMaterialName.trim())) return setSnackbar({ open: true, message: 'This raw material already exists.', severity: 'warning' });

    setAvailableRawMaterials([...availableRawMaterials, newRawMaterialName.trim()]);
    setNewRawMaterialName("");
    setShowAddRawMaterialInput(false);
    setSnackbar({ open: true, message: 'Raw material added to the list!', severity: 'success' });
  };

  const getQuantityChipColor = (quantity) => {
    if (quantity < 100) return "error";
    if (quantity < 500) return "warning";
    return "success";
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    borderRadius: 2,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🧱 Raw Materials Management
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>📊 Update Inventory</Typography>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Material *</InputLabel>
              <Select value={selectedMaterial} label="Select Material *" onChange={(e) => setSelectedMaterial(e.target.value)}>
                <MenuItem value=""><em>-- Choose a material --</em></MenuItem>
                {materials.map((mat) => <MenuItem key={mat.name} value={mat.name}>{mat.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="number" label="Add Quantity" value={addQuantity} onChange={(e) => setAddQuantity(e.target.value)} variant="outlined" />
            <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />} sx={{ mt: 1 }}>Add Stock</Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="number" label="Set Total Quantity" value={modifyQuantity} onChange={(e) => setModifyQuantity(e.target.value)} variant="outlined" />
            <Button variant="contained" color="secondary" onClick={handleModify} startIcon={<EditIcon />} sx={{ mt: 1 }}>Modify Total</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>📦 Current Inventory</Typography>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Material Name</TableCell>
                <TableCell align="center">Total Quantity (kg/L)</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((mat) => (
                <TableRow hover key={mat.name}>
                  <TableCell><strong>{mat.name}</strong></TableCell>
                  <TableCell align="center">
                    <Chip label={mat.totalQuantity ?? 0} color={getQuantityChipColor(mat.totalQuantity)} />
                  </TableCell>
                  <TableCell>{new Date(mat.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
         <ResinCalculator onProduced={fetchMaterials} showProduce={false} />
      </Paper>

      <Fab color="primary" aria-label="add resin config" sx={{ position: 'fixed', bottom: 30, right: 30 }} onClick={() => setShowResinModal(true)}>
        <AddIcon />
      </Fab>

      <Modal open={showResinModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add New Resin Configuration</Typography>
            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ p: 3, overflowY: 'auto' }}>
            <TextField fullWidth label="Resin Name" value={newResin.name} onChange={(e) => setNewResin({ ...newResin, name: e.target.value })} sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>Raw Materials & Percentages</Typography>
            
            {newResin.rawMaterials.map((rm, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Material</InputLabel>
                    <Select value={rm.name} label="Material" onChange={(e) => handleRawMaterialChange(index, 'name', e.target.value)}>
                      {availableRawMaterials.map(mat => <MenuItem key={mat} value={mat}>{mat}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth type="number" label="Percentage" value={rm.percentage} onChange={(e) => handleRawMaterialChange(index, 'percentage', e.target.value)} InputProps={{ endAdornment: '%' }} />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => handleRemoveRawMaterialFromResin(index)} color="error"><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            ))}

            <Button onClick={handleAddRawMaterialToResin} startIcon={<AddIcon />} sx={{ mt: 1 }}>Add Material</Button>

            <Box mt={3}>
              {showAddRawMaterialInput ? (
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <TextField fullWidth autoFocus label="New Raw Material Name" value={newRawMaterialName} onChange={(e) => setNewRawMaterialName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewRawMaterialToList()} />
                  </Grid>
                  <Grid item>
                    <Button onClick={handleAddNewRawMaterialToList} variant="contained">Save</Button>
                    <Button onClick={() => setShowAddRawMaterialInput(false)}>Cancel</Button>
                  </Grid>
                </Grid>
              ) : (
                <Button onClick={() => setShowAddRawMaterialInput(true)}>Add New Raw Material to List</Button>
              )}
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3 }}>
              Total: {newResin.rawMaterials.reduce((sum, rm) => sum + (Number(rm.percentage) || 0), 0).toFixed(2)}%
            </Typography>

          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSaveResin} variant="contained">Save Resin</Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default RawMaterials;
