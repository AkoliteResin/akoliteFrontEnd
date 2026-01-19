import React, { useState, useEffect } from "react";
import axiosInstance, { API_ENDPOINTS } from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./OrderForFuture.css";

function OrderForFuture() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    clientName: "",
    resinType: "",
    litres: "",
    unit: "litres",
    scheduledDate: "",
  });
  const [resinTypes, setResinTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'completed'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD for filtering

  // Fetch resin types when component mounts
  useEffect(() => {
    fetchResinTypes();
    fetchOrders();
    fetchClients();
  }, []);

  const fetchResinTypes = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.RESINS.GET_ALL);
      setResinTypes(response.data);
    } catch (err) {
      console.error("Error fetching resin types:", err);
      setError("Failed to load resin types");
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.CLIENTS.GET_ALL);
      const list = Array.isArray(res.data) ? [...res.data] : [];
      // Ensure default Godown exists in dropdown
      if (!list.some(c => (c.name || '').toLowerCase() === 'godown')) {
        list.unshift({ _id: 'godown-default', name: 'Godown', phone: '-', address: '' });
      }
      setClients(list);
    } catch (err) {
      console.error('Failed to fetch clients', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/api/future-orders");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clientSearch') {
      setClientSearch(value);
      setShowClientDropdown(true);
      return;
    }

    setNewOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredClients = clients.filter(client => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (client.name || '').toLowerCase().includes(q) ||
      (client.phone || '').toLowerCase().includes(q)
    );
  });

  const selectClient = (client) => {
    setNewOrder(prev => ({ ...prev, clientName: client.name }));
    setClientSearch(`${client.name} (${client.phone})`);
    setShowClientDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Ensure a client was selected (must come from clients list)
    if (!newOrder.clientName) {
      setError('Please select a client from the dropdown (type to filter and click a client)');
      setLoading(false);
      return;
    }
    try {
      await axiosInstance.post("/api/future-orders", newOrder);
      setNewOrder({
        clientName: "",
        resinType: "",
        litres: "",
        unit: "litres",
        scheduledDate: "",
      });
      fetchOrders(); // Refresh the orders list
      alert("Order added successfully!");
    } catch (err) {
      console.error("Error adding order:", err);
      setError("Failed to add order");
    } finally {
      setLoading(false);
    }
  };

  const handleProduce = async (order) => {
    const unit = order.unit || 'litres';
    if (!window.confirm(`Start production for ${order.clientName} - ${order.resinType} (${order.litres} ${unit})?`)) return;
    // Do NOT change order status here; it will change to in_progress only after Produce is clicked in Resin Calculator
    navigate("/resin-production", {
      state: {
        resinType: order.resinType,
        litres: order.litres,
        unit: unit,
        orderId: order._id,
      }
    });
  };

  return (
    <div className="order-future-container">
      <h2>📋 Orders For Future</h2>
      
      {/* Add Order Form */}
      <div className="form-card single-form">
        <h3>📦 Add New Order</h3>
        <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group client-select-group">
              <label htmlFor="clientSearch">Client Name <span className="required">*</span></label>
              <input
                type="text"
                id="clientSearch"
                name="clientSearch"
                value={clientSearch}
                onChange={handleInputChange}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Start typing client name..."
                required
              />
              {showClientDropdown && (
                <div className="client-dropdown">
                  {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                      <div
                        key={client._id}
                        className="client-option"
                        onClick={() => selectClient(client)}
                      >
                        <strong>{client.name}</strong> <span className="phone-badge">{client.phone}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No clients found. Add a client first! 👈</div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="resinType">Resin Type <span className="required">*</span></label>
              <select
                id="resinType"
                name="resinType"
                value={newOrder.resinType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Resin Type</option>
                {resinTypes.map((resin) => (
                  <option key={resin._id} value={resin.name}>
                    {resin.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="litres">Quantity <span className="required">*</span></label>
              <input
                type="number"
                id="litres"
                name="litres"
                value={newOrder.litres}
                onChange={handleInputChange}
                min="1"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit <span className="required">*</span></label>
              <select id="unit" name="unit" value={newOrder.unit} onChange={handleInputChange}>
                <option value="litres">Litres</option>
                <option value="kgs">Kgs</option>
                <option value="pounds">Pounds</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scheduledDate">Scheduled Date <span className="required">*</span></label>
              <input
                type="date"
                id="scheduledDate"
                name="scheduledDate"
                value={newOrder.scheduledDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '⏳ Adding...' : '✅ Add Order'}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>

      {/* Orders History */}
      <div className="orders-history">
        <h3>📜 Orders History</h3>
        
        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 20, 
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#f8f9fa',
          borderRadius: 8
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: 6,
                fontSize: 14
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending (Not Batched)</option>
              <option value="batched">Batched (In Progress)</option>
              <option value="completed">Completed Only</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Date Filter</label>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>
          
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              style={{
                marginTop: 18,
                padding: '8px 16px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Clear Date
            </button>
          )}
        </div>
        
        {(() => {
          // Filter orders
          let filtered = orders.filter(order => {
            // Status filter
            if (statusFilter === 'pending') {
              // Only show truly pending orders (not batched, not in progress)
              if (order.status !== 'pending') {
                return false;
              }
            } else if (statusFilter === 'batched') {
              // Only show batched orders (in production batches)
              if (!['batched', 'in_progress', 'partially_dispatched'].includes(order.status)) {
                return false;
              }
            } else if (statusFilter === 'completed') {
              if (order.status !== 'completed') return false;
            }
            
            // Date filter
            if (dateFilter) {
              const orderDate = order.scheduledDate;
              if (orderDate !== dateFilter) return false;
            }
            
            return true;
          });
          
          // Sort: recent orders first (by creation time)
          filtered.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.orderTime).getTime();
            const timeB = new Date(b.createdAt || b.orderTime).getTime();
            return timeB - timeA; // Descending (newest first)
          });
          
          return filtered.length > 0 ? (
            <div className="orders-grid">
              {filtered.map((order) => (
                <div key={order._id} className="order-card">
                  {(() => {
                    const clientObj = clients.find(c => c.name === order.clientName);
                    return <h4>👤 {order.clientName}{clientObj ? ` (${clientObj.phone})` : ''}</h4>;
                  })()}
                  <div className="order-details">
                    {order.orderNumber && (
                      <p><strong>🧾 Order #:</strong> {order.orderNumber}</p>
                    )}
                    <p><strong>🧪 Resin:</strong> {order.resinType}</p>
                    <p><strong>📊 Quantity:</strong> {order.litres} {order.unit || 'litres'}</p>
                    {order.fulfilledQty > 0 && (
                      <p><strong>✅ Fulfilled:</strong> {order.fulfilledQty}/{order.litres} {order.unit || 'litres'}</p>
                    )}
                    <p><strong>📅 Scheduled:</strong> {new Date(order.scheduledDate).toLocaleDateString()}</p>
                    <p><strong>🕒 Ordered:</strong> {new Date(order.createdAt || order.orderTime).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${order.status || 'pending'}`}>{(order.status || 'pending').toUpperCase()}</span></p>
                  </div>
                  <button
                    onClick={() => handleProduce(order)}
                    className="produce-button"
                    disabled={order.status === 'batched' || order.status === 'in_progress' || order.status === 'completed' || order.status === 'partially_dispatched'}
                  >
                    {order.status === 'batched' ? '📦 Batched (In Production)' : 
                     order.status === 'in_progress' ? '⏳ In Progress' : 
                     order.status === 'partially_dispatched' ? '🚚 Partially Dispatched' :
                     order.status === 'completed' ? '✅ Completed' : 
                     '🚀 Produce'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>📭 No orders found for the selected filters.</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default OrderForFuture;