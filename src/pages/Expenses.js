import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Expenses.css';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Get current month and year
  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const allowedCategories = ['Office staff', 'Helper', 'Chemist', 'Accountant', 'Driver', 'Car Driver', 'Tanker Driver', 'Plant Operator', 'Manager', 'Conductor', 'Lab'];

  // Form state - monthly expense entry
  const [formData, setFormData] = useState({
    month: getCurrentMonth().split('-')[1],
    year: getCurrentMonth().split('-')[0],
    category: 'Office staff',
    employeeName: '',
    monthlyAmount: '',
    description: ''
  });
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  
  // Filter state
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth().split('-')[1]);
  const [filterYear, setFilterYear] = useState(getCurrentMonth().split('-')[0]);
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Summary state (per-category)
  const [summary, setSummary] = useState({ total: 0, count: 0 });

  // Selected date for daily view
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear, filterCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        month: filterMonth,
        year: filterYear
      };
      
      const response = await axios.get('http://localhost:5000/api/expenses', { params });
      let data = response.data;
      
      // Filter by category on frontend if not 'All'
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
      if (!sum[key]) sum[key] = 0;
      sum[key] += amt;
      sum.total += amt;
    });
    setSummary(sum);
  };

  // Calculate working days in a month (26 days per month = 6 days × ~4.33 weeks)
  const getWorkingDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const sundays = Math.floor(daysInMonth / 7);
    return daysInMonth - sundays; // Total days minus Sundays
  };

  // Calculate daily expense from monthly
  const getDailyExpense = (monthlyAmount, month, year) => {
    const workingDays = getWorkingDaysInMonth(month, year);
    return monthlyAmount / workingDays;
  };

  // Check if selected date is a working day (not Sunday)
  const isWorkingDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() !== 0; // 0 = Sunday
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.month || !formData.year || !formData.category || !formData.monthlyAmount) {
      alert('Month, year, category, and monthly amount are required');
      return;
    }
    
    const amount = Number(formData.monthlyAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Monthly amount must be a positive number');
      return;
    }
    
    try {
      setSaving(true);
      
      if (editingId) {
        // Update existing expense
        await axios.put(`http://localhost:5000/api/expenses/${editingId}`, formData);
        alert('Monthly expense updated successfully');
      } else {
        // Add new expense
        await axios.post('http://localhost:5000/api/expenses', formData);
        alert('Monthly expense added successfully');
      }
      
      // Reset form
      setFormData({
        month: getCurrentMonth().split('-')[1],
        year: getCurrentMonth().split('-')[0],
        category: 'Labour',
        employeeName: '',
        monthlyAmount: '',
        description: ''
      });
      setEditingId(null);
      
      // Refresh list
      fetchExpenses();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert(err.response?.data?.message || 'Failed to save expense');
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
      category: 'Labour',
      employeeName: '',
      monthlyAmount: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this monthly expense?')) {
      return;
    }
    
    const pass = window.prompt('Enter admin password to confirm deletion:');
    if (pass == null) return;
    if (pass !== '123@Ako') {
      alert('Incorrect password. Deletion cancelled.');
      return;
    }
    
    try {
      setSaving(true);
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { 'x-admin-pass': pass }
      });
      alert('Monthly expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Office staff': '#8e44ad',
      'Helper': '#95a5a6',
      'Chemist': '#16a085',
      'Accountant': '#2980b9',
      'Driver': '#d35400',
      'Car Driver': '#c0392b',
      'Tanker Driver': '#e67e22',
      'Plant Operator': '#27ae60',
      'Manager': '#2c3e50',
      'Conductor': '#f39c12',
      'Lab': '#7f8c8d'
    };
    return colors[category] || '#95a5a6';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Office staff': return '🏢';
      case 'Helper': return '🙋';
      case 'Chemist': return '🔬';
      case 'Accountant': return '📊';
      case 'Driver': return '🚚';
      case 'Car Driver': return '🚗';
      case 'Tanker Driver': return '🚛';
      case 'Plant Operator': return '⚙️';
      case 'Manager': return '🧑‍💼';
      case 'Conductor': return '🎫';
      case 'Lab': return '🏷️';
      default: return '💰';
    }
  };

  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1] || '';
  };

  // Calculate daily breakdown for selected date
  const getDailyBreakdown = () => {
    const selectedDateObj = new Date(selectedDate);
    const month = selectedDateObj.getMonth() + 1;
    const year = selectedDateObj.getFullYear();
    
    if (!isWorkingDay(selectedDate)) {
      return { categories: [], total: 0, isSunday: true };
    }
    
    const dailyExpenses = expenses
      .filter(exp => exp.month === String(month).padStart(2, '0') && exp.year === String(year))
      .map(exp => ({
        ...exp,
        dailyAmount: getDailyExpense(exp.monthlyAmount, month, year)
      }));
    
    const total = dailyExpenses.reduce((sum, exp) => sum + exp.dailyAmount, 0);
    
    return { categories: dailyExpenses, total, isSunday: false };
  };

  const dailyBreakdown = getDailyBreakdown();
  const workingDays = getWorkingDaysInMonth(parseInt(filterMonth), parseInt(filterYear));

  return (
    <div className="expenses-container">
      <h2>💰 Monthly Expenses Management</h2>
      <p className="subtitle">Enter monthly expenses and view daily breakdown (6 working days/week)</p>
      
      {/* Add/Edit Form */}
      <div className="expense-form-card">
        <h3>{editingId ? '✏️ Edit Monthly Expense' : '➕ Add Monthly Expense'}</h3>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label>Month *</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2099"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {allowedCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Monthly Amount (₹) *</label>
              <input
                type="number"
                name="monthlyAmount"
                value={formData.monthlyAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Employee/Labour Name</label>
              <input
                type="text"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>
            
            <div className="form-group form-group-wide">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional notes"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : editingId ? '💾 Update Expense' : '➕ Add Expense'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                ✖️ Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Monthly Summary Cards */}
      <div className="summary-cards">
        {allowedCategories.map((d) => (
          <div key={d} className="summary-card" style={{ borderLeftColor: getCategoryColor(d) }}>
            <div className="summary-info">
              <div className="summary-label">{d} (Monthly)</div>
              <div className="summary-amount">₹{(summary[d] || 0).toFixed(2)}</div>
              <div className="summary-daily">Daily: ₹{((summary[d] || 0) / workingDays).toFixed(2)}</div>
            </div>
          </div>
        ))}

        <div className="summary-card summary-card-total">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <div className="summary-label">Total (Monthly)</div>
            <div className="summary-amount">₹{summary.total.toFixed(2)}</div>
            <div className="summary-daily">Daily: ₹{(summary.total / workingDays).toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      {/* Working Days Info */}
      <div className="working-days-info">
        <div className="info-badge">
          📅 {getMonthName(filterMonth)} {filterYear} has <strong>{workingDays} working days</strong> (excluding Sundays)
        </div>
      </div>
      
      {/* Daily Expense Calculator */}
      <div className="daily-calculator">
        <h3>📊 Daily Expense Breakdown</h3>
        <div className="date-selector">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        {dailyBreakdown.isSunday ? (
          <div className="sunday-notice">
            🌅 <strong>Sunday - No work day!</strong> No expenses calculated for this day.
          </div>
        ) : (
          <div className="daily-breakdown-content">
            <div className="daily-total">
              <h4>Total Daily Expense for {new Date(selectedDate).toLocaleDateString()}</h4>
              <div className="total-amount">₹{dailyBreakdown.total.toFixed(2)}</div>
            </div>
            
            {dailyBreakdown.categories.length > 0 ? (
              <table className="daily-breakdown-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Monthly Amount</th>
                    <th>Daily Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.categories.map((exp, idx) => (
                    <tr key={idx}>
                      <td>
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: getCategoryColor(exp.category) }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td>{exp.employeeName || '—'}</td>
                      <td>₹{Number(exp.monthlyAmount).toFixed(2)}</td>
                      <td className="amount-cell">₹{exp.dailyAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No expenses recorded for this month</div>
            )}
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>📅 Filter by Month:</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>📆 Year:</label>
          <input
            type="number"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            min="2020"
            max="2099"
          />
        </div>
        
        <div className="filter-group">
          <label>🏷️ Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {allowedCategories.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => {
            const current = getCurrentMonth();
            setFilterMonth(current.split('-')[1]);
            setFilterYear(current.split('-')[0]);
            setFilterCategory('All');
          }}
        >
          🔄 Reset to Current Month
        </button>
      </div>
      
      {/* Monthly Expenses List */}
      <div className="expenses-list">
        <h3>📋 Monthly Expense Records ({expenses.length})</h3>
        
        {loading && <div className="loading">Loading expenses...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && expenses.length === 0 && (
          <div className="no-data">
            <p>No monthly expenses found for the selected filters.</p>
            <p>Add your first monthly expense using the form above.</p>
          </div>
        )}
        
        {!loading && !error && expenses.length > 0 && (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Monthly Amount</th>
                  <th>Daily Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{getMonthName(expense.month)}</td>
                    <td>{expense.year}</td>
                    <td>
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.employeeName || '—'}</td>
                    <td className="amount-cell">₹{Number(expense.monthlyAmount).toFixed(2)}</td>
                    <td className="daily-amount-cell">
                      ₹{getDailyExpense(expense.monthlyAmount, parseInt(expense.month), parseInt(expense.year)).toFixed(2)}
                    </td>
                    <td>{expense.description || '—'}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(expense)}
                        title="Edit expense"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(expense._id)}
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
