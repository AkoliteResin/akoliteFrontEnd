import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// MUI Components
import {
  Container, Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, IconButton, Snackbar, Card, CardContent
} from '@mui/material';

// MUI Icons
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, Cancel as CancelIcon, Refresh as RefreshIcon } from '@mui/icons-material';

// A map for category icons to be used with MUI Chip
const categoryIcons = {
  'Office staff': <Typography component="span" sx={{ fontSize: '1.2em' }}>🏢</Typography>,
  'Helper': <Typography component="span" sx={{ fontSize: '1.2em' }}>🙋</Typography>,
  'Chemist': <Typography component="span" sx={{ fontSize: '1.2em' }}>🔬</Typography>,
  'Accountant': <Typography component="span" sx={{ fontSize: '1.2em' }}>📊</Typography>,
  'Driver': <Typography component="span" sx={{ fontSize: '1.2em' }}>🚚</Typography>,
  'Car Driver': <Typography component="span" sx={{ fontSize: '1.2em' }}>🚗</Typography>,
  'Tanker Driver': <Typography component="span" sx={{ fontSize: '1.2em' }}>🚛</Typography>,
  'Plant Operator': <Typography component="span" sx={{ fontSize: '1.2em' }}>⚙️</Typography>,
  'Manager': <Typography component="span" sx={{ fontSize: '1.2em' }}>🧑‍💼</Typography>,
  'Conductor': <Typography component="span" sx={{ fontSize: '1.2em' }}>🎫</Typography>,
  'Lab': <Typography component="span" sx={{ fontSize: '1.2em' }}>🏷️</Typography>,
  'Default': <Typography component="span" sx={{ fontSize: '1.2em' }}>💰</Typography>,
};

const getCategoryIcon = (category) => categoryIcons[category] || categoryIcons['Default'];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const allowedCategories = useMemo(() => ['Office staff', 'Helper', 'Chemist', 'Accountant', 'Driver', 'Car Driver', 'Tanker Driver', 'Plant Operator', 'Manager', 'Conductor', 'Lab'], []);

  const [formData, setFormData] = useState({
    month: getCurrentMonth().split('-')[1],
    year: getCurrentMonth().split('-')[0],
    category: 'Office staff',
    employeeName: '',
    monthlyAmount: '',
    description: ''
  });

  const [editingId, setEditingId] = useState(null);

  const [filterMonth, setFilterMonth] = useState(getCurrentMonth().split('-')[1]);
  const [filterYear, setFilterYear] = useState(getCurrentMonth().split('-')[0]);
  const [filterCategory, setFilterCategory] = useState('All');

  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear, filterCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { month: filterMonth, year: filterYear };
      const response = await axios.get('http://localhost:5000/api/expenses', { params });
      let data = response.data;
      if (filterCategory !== 'All') {
        data = data.filter(exp => exp.category === filterCategory);
      }
      setExpenses(data);
      calculateSummary(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const sum = { total: 0, count: data.length };
    allowedCategories.forEach(d => { sum[d] = 0; });
    data.forEach(exp => {
      const amt = Number(exp.monthlyAmount) || 0;
      const key = exp.category || 'Unknown';
      if (sum.hasOwnProperty(key)) {
        sum[key] += amt;
      }
      sum.total += amt;
    });
    setSummary(sum);
  };

  const getWorkingDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let sundays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      if (new Date(year, month - 1, i).getDay() === 0) {
        sundays++;
      }
    }
    return daysInMonth - sundays;
  };

  const getDailyExpense = (monthlyAmount, month, year) => {
    const workingDays = getWorkingDaysInMonth(month, year);
    return workingDays > 0 ? monthlyAmount / workingDays : 0;
  };

  const isWorkingDay = (dateStr) => new Date(dateStr).getDay() !== 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.month || !formData.year || !formData.category || !formData.monthlyAmount) {
      setSnackbar({ open: true, message: 'Month, year, category, and monthly amount are required', severity: 'error' });
      return;
    }
    const amount = Number(formData.monthlyAmount);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({ open: true, message: 'Monthly amount must be a positive number', severity: 'error' });
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`http://localhost:5000/api/expenses/${editingId}`, formData);
        setSnackbar({ open: true, message: 'Monthly expense updated successfully', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/expenses', formData);
        setSnackbar({ open: true, message: 'Monthly expense added successfully', severity: 'success' });
      }
      handleCancelEdit(); // Reset form and editing state
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save expense', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      month: expense.month,
      year: expense.year,
      category: expense.category,
      employeeName: expense.employeeName || '',
      monthlyAmount: expense.monthlyAmount,
      description: expense.description || ''
    });
    setEditingId(expense._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({
      month: getCurrentMonth().split('-')[1],
      year: getCurrentMonth().split('-')[0],
      category: 'Office staff',
      employeeName: '',
      monthlyAmount: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this monthly expense?')) return;
    const pass = window.prompt('Enter admin password to confirm deletion:');
    if (pass !== '123@Ako') {
      if (pass !== null) setSnackbar({ open: true, message: 'Incorrect password. Deletion cancelled.', severity: 'error' });
      return;
    }
    try {
      setSaving(true);
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, { headers: { 'x-admin-pass': pass } });
      setSnackbar({ open: true, message: 'Monthly expense deleted successfully', severity: 'success' });
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to delete expense', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getMonthName = (monthNum) => {
    return new Date(2000, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
  };

  const dailyBreakdown = useMemo(() => {
    if (!isWorkingDay(selectedDate)) {
      return { categories: [], total: 0, isSunday: true };
    }
    const selectedDateObj = new Date(selectedDate);
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const year = String(selectedDateObj.getFullYear());

    const dailyExpenses = expenses
      .filter(exp => exp.month === month && exp.year === year)
      .map(exp => ({
        ...exp,
        dailyAmount: getDailyExpense(exp.monthlyAmount, parseInt(month), parseInt(year))
      }));
    const total = dailyExpenses.reduce((sum, exp) => sum + exp.dailyAmount, 0);
    return { categories: dailyExpenses, total, isSunday: false };
  }, [selectedDate, expenses]); // eslint-disable-line react-hooks/exhaustive-deps

  const workingDays = useMemo(() => getWorkingDaysInMonth(parseInt(filterMonth), parseInt(filterYear)), [filterMonth, filterYear]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const monthOptions = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' }, { value: '03', label: 'March' },
    { value: '04', label: 'April' }, { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' }, { value: '09', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="money bag" style={{ marginRight: '10px' }}>💰</span> Monthly Expenses Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Enter monthly expenses and view daily breakdown (6 working days/week).
      </Typography>

      {/* Add/Edit Form */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>{editingId ? '✏️ Edit Monthly Expense' : '➕ Add Monthly Expense'}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Month</InputLabel>
                <Select name="month" value={formData.month} label="Month" onChange={handleInputChange}>
                  {monthOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth required type="number" name="year" value={formData.year} onChange={handleInputChange} label="Year" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select name="category" value={formData.category} label="Category" onChange={handleInputChange}>
                  {allowedCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth required type="number" name="monthlyAmount" value={formData.monthlyAmount} onChange={handleInputChange} label="Monthly Amount (₹)" placeholder="0.00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="employeeName" value={formData.employeeName} onChange={handleInputChange} label="Employee/Labour Name" placeholder="Optional" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="description" value={formData.description} onChange={handleInputChange} label="Description" placeholder="Optional notes" />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" startIcon={editingId ? <SaveIcon /> : <AddIcon />} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
            </Button>
            {editingId && (
              <Button variant="outlined" color="secondary" startIcon={<CancelIcon />} onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Monthly Summary Cards */}
      <Typography variant="h5" gutterBottom>Monthly Summary</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {allowedCategories.map((d) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={d}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCategoryIcon(d)} {d}
                </Typography>
                <Typography color="text.secondary">Monthly</Typography>
                <Typography variant="h5" component="p">₹{(summary[d] || 0).toLocaleString('en-IN')}</Typography>
                <Typography color="text.secondary">Daily: ₹{((summary[d] || 0) / workingDays).toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ backgroundColor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💰 Total
                </Typography>
                <Typography>Monthly</Typography>
                <Typography variant="h5" component="p">₹{summary.total.toLocaleString('en-IN')}</Typography>
                <Typography>Daily: ₹{(summary.total / workingDays).toFixed(2)}</Typography>
              </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* Daily Expense Calculator */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>📊 Daily Expense Breakdown</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          {getMonthName(filterMonth)} {filterYear} has <strong>{workingDays} working days</strong> (excluding Sundays).
        </Alert>
        <TextField type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} label="Select Date" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
        
        {dailyBreakdown.isSunday ? (
          <Alert severity="warning">🌅 <strong>Sunday - No work day!</strong> No expenses calculated for this day.</Alert>
        ) : (
          <>
            <Typography variant="h6">Total Daily Expense for {new Date(selectedDate).toLocaleDateString()}: <strong>₹{dailyBreakdown.total.toFixed(2)}</strong></Typography>
            {dailyBreakdown.categories.length > 0 ? (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Monthly Amount</TableCell>
                      <TableCell align="right">Daily Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailyBreakdown.categories.map((exp, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Chip label={exp.category} size="small" /></TableCell>
                        <TableCell>{exp.employeeName || '—'}</TableCell>
                        <TableCell align="right">₹{Number(exp.monthlyAmount).toFixed(2)}</TableCell>
                        <TableCell align="right"><strong>₹{exp.dailyAmount.toFixed(2)}</strong></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : <Alert severity="info" sx={{ mt: 2 }}>No expenses recorded for this month.</Alert>}
          </>
        )}
      </Paper>

      {/* Filters & Main Table */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom>📋 Monthly Expense Records ({expenses.length})</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Grid item xs={12} sm={4} md={3}><FormControl fullWidth><InputLabel>Month</InputLabel><Select value={filterMonth} label="Month" onChange={(e) => setFilterMonth(e.target.value)}>{monthOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} sm={4} md={3}><TextField fullWidth type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} label="Year" /></Grid>
          <Grid item xs={12} sm={4} md={3}><FormControl fullWidth><InputLabel>Category</InputLabel><Select value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value)}><MenuItem value="All">All Categories</MenuItem>{allowedCategories.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} sm={12} md={3}><Button fullWidth variant="outlined" startIcon={<RefreshIcon />} onClick={() => { const c = getCurrentMonth(); setFilterMonth(c.split('-')[1]); setFilterYear(c.split('-')[0]); setFilterCategory('All'); }}>Reset Filters</Button></Grid>
        </Grid>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box> :
         error ? <Alert severity="error">{error}</Alert> :
         expenses.length === 0 ? <Alert severity="info">No monthly expenses found for the selected filters. Add one using the form above.</Alert> :
         (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Monthly Amt.</TableCell>
                  <TableCell align="right">Daily Amt.</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow hover key={expense._id}>
                    <TableCell>{getMonthName(expense.month)} {expense.year}</TableCell>
                    <TableCell><Chip label={expense.category} icon={getCategoryIcon(expense.category)} size="small" /></TableCell>
                    <TableCell>{expense.employeeName || '—'}</TableCell>
                    <TableCell align="right">₹{Number(expense.monthlyAmount).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right">₹{getDailyExpense(expense.monthlyAmount, parseInt(expense.month), parseInt(expense.year)).toFixed(2)}</TableCell>
                    <TableCell>{expense.description || '—'}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleEdit(expense)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(expense._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Expenses;
