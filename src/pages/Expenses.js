import React, { useState, useEffect } from 'react';
import axiosInstance, { API_ENDPOINTS } from '../utils/axiosInstance';

const Designations = [
  { name: 'Office staff', icon: '🏢', color: '#3498db' },
  { name: 'Helper', icon: '🙋', color: '#2ecc71' },
  { name: 'Chemist', icon: '🔬', color: '#9b59b6' },
  { name: 'Accountant', icon: '📊', color: '#f39c12' },
  { name: 'Driver', icon: '🚚', color: '#e74c3c' },
  { name: 'Car Driver', icon: '🚗', color: '#1abc9c' },
  { name: 'Tanker Driver', icon: '🚛', color: '#34495e' },
  { name: 'Plant Operator', icon: '⚙️', color: '#16a085' },
  { name: 'Manager', icon: '🧑‍💼', color: '#d35400' },
  { name: 'Conducter', icon: '🎫', color: '#c0392b' },
  { name: 'Lab', icon: '🏷️', color: '#8e44ad' }
];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [overtimeByExpense, setOvertimeByExpense] = useState({});

  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    month: getCurrentMonth().split('-')[1],
    year: getCurrentMonth().split('-')[0],
    designation: 'Office staff',
    employeeName: '',
    monthlyAmount: '',
    description: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({});
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showOvertimeInfo, setShowOvertimeInfo] = useState(false);
  const [selectedOvertimeInfo, setSelectedOvertimeInfo] = useState(null);
  const [overtimeModalData, setOvertimeModalData] = useState({
    expenseId: null,
    designation: '',
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    overtimePayPerHour: ''
  });

  // Fetch expenses
  useEffect(() => {
    fetchExpenses();
    fetchOvertimeData();
  }, [formData.month, formData.year]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { month: formData.month, year: formData.year };
      const response = await axiosInstance.get(API_ENDPOINTS.EXPENSES.GET_ALL, { params });
      setExpenses(response.data);
      calculateSummary(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeData = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OVERTIME.GET_ALL);
      const overtimeMap = {};
      response.data.forEach(ot => {
        if (ot.expenseId) {
          if (!overtimeMap[ot.expenseId]) {
            overtimeMap[ot.expenseId] = 0;
          }
          overtimeMap[ot.expenseId] += ot.totalOvertimePay || 0;
        }
      });
      setOvertimeByExpense(overtimeMap);
    } catch (err) {
      console.error('Error fetching overtime data:', err);
    }
  };

  const calculateSummary = (data) => {
    const sum = {};
    Designations.forEach(d => { sum[d.name] = 0; });
    let total = 0;
    data.forEach(exp => {
      const amt = Number(exp.monthlyAmount) || 0;
      if (sum.hasOwnProperty(exp.designation)) {
        sum[exp.designation] += amt;
      }
      total += amt;
    });
    sum.total = total;
    setSummary(sum);
  };

  const getWorkingDays = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let sundays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      if (new Date(year, month - 1, i).getDay() === 0) sundays++;
    }
    return daysInMonth - sundays;
  };

  const getDailyAmount = (monthlyAmount) => {
    const workingDays = getWorkingDays(parseInt(formData.month), parseInt(formData.year));
    return workingDays > 0 ? monthlyAmount / workingDays : 0;
  };

  const isWorkingDay = (dateStr) => {
    return new Date(dateStr).getDay() !== 0;
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(month) - 1] || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.month || !formData.year || !formData.monthlyAmount || !formData.designation || !formData.employeeName) {
      alert('Month, year, designation, employee name, and monthly amount are required');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await axiosInstance.put(API_ENDPOINTS.EXPENSES.UPDATE.replace(':id', editingId), formData);
        alert('Expense updated successfully');
      } else {
        await axiosInstance.post(API_ENDPOINTS.EXPENSES.CREATE, formData);
        alert('Expense added successfully');
      }
      setFormData({
        month: getCurrentMonth().split('-')[1],
        year: getCurrentMonth().split('-')[0],
        designation: 'Office staff',
        employeeName: '',
        monthlyAmount: '',
        description: ''
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      month: expense.month,
      year: expense.year,
      designation: expense.designation,
      employeeName: expense.employeeName || '',
      monthlyAmount: expense.monthlyAmount,
      description: expense.description || ''
    });
    setEditingId(expense._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    const pass = window.prompt('Enter admin password:');
    if (pass !== '123@Ako') {
      alert('Incorrect password');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.delete(API_ENDPOINTS.EXPENSES.DELETE.replace(':id', id), {
        headers: { 'x-admin-pass': pass }
      });
      alert('Expense deleted successfully');
      fetchExpenses();
    } catch (err) {
      alert('Error deleting expense');
    } finally {
      setSaving(false);
    }
  };

  const handleOvertimeClick = (expense) => {
    setOvertimeModalData({
      expenseId: expense._id,
      designation: expense.designation,
      employeeName: expense.employeeName || '',
      date: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      overtimePayPerHour: ''
    });
    setShowOvertimeModal(true);
  };

  const handleShowOvertimeInfo = async (expenseId, employeeName, designation) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.OVERTIME.GET_ALL);
      const overtimeRecords = response.data.filter(ot => ot.expenseId === expenseId);
      setSelectedOvertimeInfo({
        expenseId,
        employeeName,
        designation,
        records: overtimeRecords
      });
      setShowOvertimeInfo(true);
    } catch (err) {
      console.error('Error fetching overtime info:', err);
      alert('Could not load overtime details');
    }
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();
    if (!overtimeModalData.hoursWorked || !overtimeModalData.overtimePayPerHour || !overtimeModalData.date) {
      alert('Hours worked, overtime pay per hour, and date are required');
      return;
    }

    const hours = Number(overtimeModalData.hoursWorked);
    const payPerHour = Number(overtimeModalData.overtimePayPerHour);
    const totalOvertime = hours * payPerHour;

    try {
      setSaving(true);
      await axiosInstance.post(API_ENDPOINTS.OVERTIME.CREATE, {
        expenseId: overtimeModalData.expenseId,
        date: overtimeModalData.date,
        designation: overtimeModalData.designation,
        employeeName: overtimeModalData.employeeName,
        hoursWorked: hours,
        overtimePayPerHour: payPerHour,
        totalOvertimePay: totalOvertime
      });
      alert(`Overtime added: ${hours} hours × ₹${payPerHour}/hr = ₹${totalOvertime.toFixed(2)}`);
      setShowOvertimeModal(false);
      setOvertimeModalData({
        expenseId: null,
        designation: '',
        employeeName: '',
        date: new Date().toISOString().split('T')[0],
        hoursWorked: '',
        overtimePayPerHour: ''
      });
      fetchOvertimeExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding overtime');
    } finally {
      setSaving(false);
    }
  };

  const fetchOvertimeExpenses = async () => {
    try {
      await axiosInstance.get(API_ENDPOINTS.OVERTIME.GET_ALL);
    } catch (err) {
      console.error('Error fetching overtime:', err);
    }
  };

  useEffect(() => {
    fetchOvertimeExpenses();
  }, []);

  const getDailyBreakdown = () => {
    const selectedDateObj = new Date(selectedDate);
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const year = String(selectedDateObj.getFullYear());
    
    if (!isWorkingDay(selectedDate)) {
      return { categories: [], total: 0, isSunday: true };
    }
    
    const dailyExpenses = expenses
      .filter(exp => exp.month === month && exp.year === year)
      .map(exp => ({
        ...exp,
        dailyAmount: getDailyAmount(exp.monthlyAmount)
      }));
    
    const total = dailyExpenses.reduce((sum, exp) => sum + exp.dailyAmount, 0);
    return { categories: dailyExpenses, total, isSunday: false };
  };

  const dailyBreakdown = getDailyBreakdown();
  const workingDays = getWorkingDays(parseInt(formData.month), parseInt(formData.year));

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>💰 Monthly Expenses Management</h2>
      <p>Enter monthly expenses and view daily breakdown by designation</p>

      {/* Add/Edit Form */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{editingId ? '✏️ Edit Expense' : '➕ Add Expense'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Month *</label>
            <select name="month" value={formData.month} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
              {Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1).padStart(2, '0'),
                label: getMonthName(String(i + 1).padStart(2, '0'))
              })).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label>Year *</label>
            <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="2020" max="2099" style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Designation *</label>
            <select name="designation" value={formData.designation} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
              {Designations.map(d => <option key={d.name} value={d.name}>{d.icon} {d.name}</option>)}
            </select>
          </div>
          <div>
            <label>Monthly Amount (₹) *</label>
            <input type="number" name="monthlyAmount" value={formData.monthlyAmount} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Employee Name *</label>
            <input type="text" name="employeeName" value={formData.employeeName} onChange={handleInputChange} placeholder="Required" style={{ width: '100%', padding: '8px' }} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Optional notes" style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={saving}>
              {saving ? '⏳ Saving...' : editingId ? '💾 Update' : '➕ Add'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ month: getCurrentMonth().split('-')[1], year: getCurrentMonth().split('-')[0], designation: 'Office staff', employeeName: '', monthlyAmount: '', description: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                ✖️ Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Overtime Modal */}
      {showOvertimeModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '30px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3>⏰ Add Overtime</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              <strong>{overtimeModalData.designation}</strong> - {overtimeModalData.employeeName || 'N/A'}
            </p>
            <form onSubmit={handleOvertimeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label>Date *</label>
                <input 
                  type="date" 
                  value={overtimeModalData.date} 
                  onChange={(e) => setOvertimeModalData(prev => ({ ...prev, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div>
                <label>Hours Worked *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 2" 
                  min="0.5"
                  step="0.5"
                  value={overtimeModalData.hoursWorked}
                  onChange={(e) => setOvertimeModalData(prev => ({ ...prev, hoursWorked: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div>
                <label>Overtime Pay Per Hour (₹) *</label>
                <input 
                  type="number"
                  placeholder="e.g., 150"
                  min="0"
                  step="0.01"
                  value={overtimeModalData.overtimePayPerHour}
                  onChange={(e) => setOvertimeModalData(prev => ({ ...prev, overtimePayPerHour: e.target.value }))}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              {overtimeModalData.hoursWorked && overtimeModalData.overtimePayPerHour && (
                <div style={{ background: '#e7f3ff', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                  <strong>Total: ₹{(Number(overtimeModalData.hoursWorked) * Number(overtimeModalData.overtimePayPerHour)).toFixed(2)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  disabled={saving}
                >
                  ✅ Add
                </button>
                <button 
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✖️ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overtime Info Modal */}
      {showOvertimeInfo && selectedOvertimeInfo && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '30px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>⏰ Overtime Details</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              <strong>{selectedOvertimeInfo.designation}</strong> - {selectedOvertimeInfo.employeeName || 'N/A'}
            </p>
            
            {selectedOvertimeInfo.records.length > 0 ? (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead style={{ background: '#ff9800', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Hours</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Pay/Hr</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOvertimeInfo.records.map((ot, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '10px' }}>{ot.date}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{ot.hoursWorked} hrs</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{ot.overtimePayPerHour.toFixed(2)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>₹{ot.totalOvertimePay.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
                  <strong>Total Overtime Pay: ₹{selectedOvertimeInfo.records.reduce((sum, ot) => sum + ot.totalOvertimePay, 0).toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                📝 No overtime records found for this employee.
              </div>
            )}
            
            <button 
              onClick={() => setShowOvertimeInfo(false)}
              style={{ width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ✖️ Close
            </button>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      <h3>Monthly Summary - {getMonthName(formData.month)} {formData.year}</h3>
      <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Month</label>
          <select value={formData.month} onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Year</label>
          <input type="number" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))} min="2020" max="2099" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {Designations.map(d => (
          <div key={d.name} style={{ background: '#fff', border: `3px solid ${d.color}`, padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>{d.icon}</div>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{d.name}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>₹{(summary[d.name] || 0).toFixed(2)}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Daily: ₹{((summary[d.name] || 0) / workingDays).toFixed(2)}</div>
          </div>
        ))}
        <div style={{ background: '#fff', border: '3px solid #000', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>💰</div>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>TOTAL</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>₹{(summary.total || 0).toFixed(2)}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Daily: ₹{((summary.total || 0) / workingDays).toFixed(2)}</div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <h3>Daily Breakdown</h3>
      <div style={{ marginBottom: '20px' }}>
        <label>Select Date: </label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ padding: '8px' }} />
      </div>

      {dailyBreakdown.isSunday ? (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          🌅 <strong>Sunday - No work day!</strong> No expenses calculated for this day.
        </div>
      ) : (
        <>
          {/* Daily Summary by Designation */}
          <h4>Daily Amounts by Designation</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {Designations.map(d => {
              const dailyAmt = (summary[d.name] || 0) / workingDays;
              return (
                <div key={d.name} style={{ background: '#fff', border: `2px solid ${d.color}`, padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ fontSize: '18px' }}>{d.icon}</div>
                  <div style={{ fontWeight: 'bold', marginTop: '5px' }}>₹{dailyAmt.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{d.name}</div>
                </div>
              );
            })}
          </div>

          {/* Entries for selected date */}
          <h4>Entries for {new Date(selectedDate).toLocaleDateString()}</h4>
          {dailyBreakdown.categories.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Designation</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Employee</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Monthly Amount</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Daily Amount</th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.categories.map((exp, idx) => {
                  const des = Designations.find(d => d.name === exp.designation) || Designations[0];
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '10px' }}><span style={{ background: des.color, color: 'white', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>{des.icon} {exp.designation}</span></td>
                      <td style={{ padding: '10px' }}>{exp.employeeName || '—'}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>₹{Number(exp.monthlyAmount).toFixed(2)}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>₹{exp.dailyAmount.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Total Daily Amount:</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹{dailyBreakdown.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              ℹ️ No expenses recorded for this date.
            </div>
          )}
        </>
      )}

      {/* All Expenses Table */}
      <h3>All Expenses - {getMonthName(formData.month)} {formData.year}</h3>
      {loading && <p>Loading...</p>}
      {error && <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', color: '#721c24' }}>❌ {error}</div>}
      {!loading && expenses.length === 0 && <p>No expenses found</p>}
      {!loading && expenses.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Designation</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Employee</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Monthly Amt</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>OT Pay</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Total Pay</th>
              <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Daily Amt</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => {
              const des = Designations.find(d => d.name === exp.designation) || Designations[0];
              return (
                <tr key={exp._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '10px' }}><span style={{ background: des.color, color: 'white', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>{des.icon} {exp.designation}</span></td>
                  <td style={{ padding: '10px' }}>{exp.employeeName || '—'}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹{Number(exp.monthlyAmount).toFixed(2)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', background: overtimeByExpense[exp._id] ? '#fff3cd' : 'transparent' }}>₹{(overtimeByExpense[exp._id] || 0).toFixed(2)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', background: overtimeByExpense[exp._id] ? '#e7f3ff' : 'transparent' }}>₹{(Number(exp.monthlyAmount) + (overtimeByExpense[exp._id] || 0)).toFixed(2)}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹{getDailyAmount(exp.monthlyAmount).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>{exp.description || '—'}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => handleShowOvertimeInfo(exp._id, exp.employeeName, exp.designation)} style={{ marginRight: '5px', padding: '5px 10px', background: '#17a2b8', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontSize: '12px' }}>ℹ️</button>
                    <button onClick={() => handleOvertimeClick(exp)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ff9800', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>⏰</button>
                    <button onClick={() => handleEdit(exp)} style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(exp._id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default Expenses;
