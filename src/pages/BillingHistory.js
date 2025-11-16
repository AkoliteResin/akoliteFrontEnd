import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./BillingHistory.css";
import { printInvoice } from "../utils/printInvoice";

function formatYMD(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getLocalYMD(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (isNaN(d)) return null;
  return formatYMD(d);
}

export default function BillingHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billingDocs, setBillingDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/billing");
      setBillingDocs(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load billing history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const filteredDocs = useMemo(() => {
    let result = billingDocs;

    // Filter by date
    if (selectedDate) {
      result = result.filter(doc => {
        const ymd = getLocalYMD(doc.createdAt);
        return ymd === selectedDate;
      });
    }

    // Filter by search query (order number or client name)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(doc => {
        // Search in items for matching order number or client name
        return (doc.items || []).some(item => {
          const orderMatch = (item.orderNumber || "").toString().toLowerCase().includes(q);
          const clientMatch = (item.clientName || "").toLowerCase().includes(q);
          return orderMatch || clientMatch;
        });
      });
    }

    return result;
  }, [billingDocs, selectedDate, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handlePrint = (doc) => {
    const date = doc.createdAt ? new Date(doc.createdAt) : new Date();
    const orderNumbers = Array.from(new Set((doc.items || []).map(i => i.orderNumber).filter(Boolean)));
    const invoiceNumber = orderNumbers.length > 0 ? orderNumbers[0] : null;
    
    printInvoice({
      items: (doc.items || []).map(item => ({
        orderNumber: item.orderNumber,
        clientName: item.clientName,
        resinType: item.resinType,
        litres: item.litres,
        rate: item.rate,
        lineTotal: item.lineTotal
      })),
      totals: doc.totals || {},
      date: date,
      invoiceNumber: invoiceNumber
    });
  };

  const handleDelete = async (doc) => {
    const orderNums = Array.from(new Set((doc.items || []).map(i => i.orderNumber).filter(Boolean))).join(', ');
    const confirm = window.confirm(`Delete billing record for orders: ${orderNums}?\n\nThis action requires admin password.`);
    if (!confirm) return;

    const pass = window.prompt("Enter admin password to delete billing record:");
    if (pass == null) return; // cancelled
    if (pass !== '123@Ako') {
      alert('Incorrect password. Action cancelled.');
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:5000/api/billing/${doc._id}`, {
        headers: { 'x-admin-pass': pass }
      });
      alert('Billing record deleted successfully.');
      fetchBilling(); // Refresh the list
    } catch (err) {
      console.error('Delete billing error', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete billing record');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="billing-history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📚 Billing History</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => window.location.href = '/billing'}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            🧾 Create New Billing
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            🏠 Home
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Search by Order # or Client:</label>
          <input
            type="text"
            placeholder="Order number or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="clear-btn">Clear</button>
          )}
        </div>
      </div>

      {loading && <div className="loading">Loading billing history...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="billing-list">
          {filteredDocs.length === 0 ? (
            <div className="empty-state">No billing records found.</div>
          ) : (
            filteredDocs.map((doc) => {
              const isExpanded = expandedId === doc._id;
              const date = doc.createdAt ? new Date(doc.createdAt) : null;
              const orderNumbers = Array.from(new Set((doc.items || []).map(i => i.orderNumber).filter(Boolean)));
              const clients = Array.from(new Set((doc.items || []).map(i => i.clientName).filter(Boolean)));

              return (
                <div key={doc._id} className={`billing-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="billing-header" onClick={() => toggleExpand(doc._id)}>
                    <div className="header-left">
                      <span className="billing-date">
                        {date ? date.toLocaleDateString() : "N/A"}
                      </span>
                      <span className="billing-time">
                        {date ? date.toLocaleTimeString() : ""}
                      </span>
                    </div>
                    <div className="header-center">
                      <div className="billing-summary">
                        <span className="label">Orders:</span>
                        <span className="value">{orderNumbers.length}</span>
                        <span className="label">Clients:</span>
                        <span className="value">{clients.join(", ")}</span>
                      </div>
                    </div>
                    <div className="header-right">
                      <span className="grand-total">₹ {(doc.totals?.grandTotal || 0).toFixed(2)}</span>
                      <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="billing-details">
                      <h4>Order Items</h4>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Client</th>
                            <th>Resin</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Line Total</th>
                            <th>Transaction</th>
                            <th>Cash</th>
                            <th>GST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(doc.items || []).map((item, idx) => (
                            <tr key={idx}>
                              <td>#{item.orderNumber || "-"}</td>
                              <td>{item.clientName || "-"}</td>
                              <td>{item.resinType || "-"}</td>
                              <td>{item.litres} L</td>
                              <td>₹ {(item.rate || 0).toFixed(2)}</td>
                              <td>₹ {(item.lineTotal || 0).toFixed(2)}</td>
                              <td>₹ {(item.transactionShare || 0).toFixed(2)}</td>
                              <td>₹ {(item.cashShare || 0).toFixed(2)}</td>
                              <td>₹ {(item.gstShare || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="totals-summary">
                        <h4>Payment Breakdown</h4>
                        <div className="totals-grid">
                          <div className="total-row">
                            <span className="total-label">Subtotal:</span>
                            <span className="total-value">₹ {(doc.totals?.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="total-row">
                            <span className="total-label">Transaction ({doc.totals?.transactionPercent || 0}%):</span>
                            <span className="total-value">₹ {(doc.totals?.transactionBase || 0).toFixed(2)}</span>
                          </div>
                          <div className="total-row">
                            <span className="total-label">GST @ 18%:</span>
                            <span className="total-value">₹ {(doc.totals?.gst || 0).toFixed(2)}</span>
                          </div>
                          <div className="total-row highlight">
                            <span className="total-label">Transaction Total:</span>
                            <span className="total-value">₹ {(doc.totals?.transactionTotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="total-row highlight">
                            <span className="total-label">Cash:</span>
                            <span className="total-value">₹ {(doc.totals?.cashAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="total-row grand">
                            <span className="total-label">Grand Total:</span>
                            <span className="total-value">₹ {(doc.totals?.grandTotal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="billing-actions" style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button 
                          onClick={() => handlePrint(doc)} 
                          style={{ 
                            padding: '8px 16px', 
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4
                          }}
                        >
                          🖨️ Print
                        </button>
                        <button 
                          onClick={() => handleDelete(doc)} 
                          disabled={deleting}
                          style={{ 
                            padding: '8px 16px', 
                            cursor: deleting ? 'not-allowed' : 'pointer',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            opacity: deleting ? 0.6 : 1
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
