import React, { useState, useEffect } from "react";
import axiosInstance, { API_ENDPOINTS } from "../utils/axiosInstance";
import "./ProducedResins.css";

function ProducedResins() {
  const [producedResins, setProducedResins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' or 'archived'
  const [selectedItem, setSelectedItem] = useState(null); // for detail modal
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false); // copy feedback for order number
  const [expandedResins, setExpandedResins] = useState(new Set()); // Track which resins are expanded
  // Date filter for History view; default to today
  const computeToday = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const [selectedDate, setSelectedDate] = useState(() => computeToday());
  // Date for generating batches (default today)
  const [batchDate, setBatchDate] = useState(() => computeToday());
  // Per-resin batch capacities
  const [capacities, setCapacities] = useState({}); // { [resinType]: number }
  const [capLoading, setCapLoading] = useState(false);
  const [capSaving, setCapSaving] = useState(false);
  const [selectedResinForCapacity, setSelectedResinForCapacity] = useState(''); // Selected resin in dropdown

  const getLocalYMD = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d)) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // For archived view, use last relevant timestamp (dispatched or deleted)
  const historyTime = (item) => item.deployedAt || item.deletedAt || item.producedAt || item.createdAt;

  const fetchProducedResins = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching produced resins...");
      
      const response = await axiosInstance.get("/api/produced-resins");
      console.log("API Response:", response.data);
      
      if (response.data && response.data.items) {
        const orderRank = { pending: 0, in_process: 1, done: 2, deployed: 3, deleted: 4 };
        const sorted = [...response.data.items].sort((a, b) => {
          const ra = orderRank[(a.status || 'pending')] ?? 0;
          const rb = orderRank[(b.status || 'pending')] ?? 0;
          if (ra !== rb) return ra - rb;
          const da = new Date(a.producedAt || a.createdAt || 0).getTime();
          const db = new Date(b.producedAt || b.createdAt || 0).getTime();
          return da - db; // first-come within same status
        });
        setProducedResins(sorted);
      } else {
        console.log("No items in response:", response.data);
        setProducedResins([]);
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      setError(error.response?.data?.message || error.message || "Failed to fetch produced resins");
    } finally {
      setLoading(false);
    }
  };

  const fetchCapacities = async () => {
    try {
      setCapLoading(true);
      // Get resin list and current settings
      const [resinsRes, settingsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.RESINS.GET_ALL),
        axiosInstance.get('/api/batch-settings')
      ]);
      const resinNames = Array.isArray(resinsRes.data) ? resinsRes.data.map(r => r.name) : [];
      const settings = Array.isArray(settingsRes.data) ? settingsRes.data : [];
      const map = {};
      resinNames.forEach(name => { map[name] = 5000; });
      settings.forEach(s => {
        if (s && s.resinType) map[s.resinType] = Number(s.capacity) || map[s.resinType] || 5000;
      });
      setCapacities(map);
      // Set first resin as default selected
      const resinList = Object.keys(map);
      if (resinList.length > 0 && !selectedResinForCapacity) {
        setSelectedResinForCapacity(resinList[0]);
      }
    } catch (err) {
      console.error('Failed to load batch capacities', err);
    } finally {
      setCapLoading(false);
    }
  };

  const handleSaveCapacities = async () => {
    try {
      setCapSaving(true);
      const entries = Object.entries(capacities);
      for (const [resinType, cap] of entries) {
        const n = Number(cap);
        if (!Number.isFinite(n) || n <= 0) {
          alert(`Invalid capacity for ${resinType}. Please enter a positive number.`);
          setCapSaving(false);
          return;
        }
      }
      for (const [resinType, cap] of entries) {
        await axiosInstance.put(`/api/batch-settings/${encodeURIComponent(resinType)}`, { capacity: Number(cap) });
      }
      alert('Batch capacities saved');
    } catch (err) {
      console.error('Failed to save capacities', err);
      alert(err.response?.data?.message || 'Failed to save capacities');
    } finally {
      setCapSaving(false);
    }
  };

  const handleGenerateBatches = async () => {
    if (!batchDate) {
      alert('Please select a date for batching');
      return;
    }
    if (!window.confirm(`Generate batches for ${batchDate} using per-resin capacities? This will rebuild pending batches for that date.`)) return;
    try {
      setProcessing(true);
      const res = await axiosInstance.post('/api/batches/generate', {
        scheduledDate: batchDate
      });
      const count = Array.isArray(res.data?.batches) ? res.data.batches.length : 0;
      await fetchProducedResins();
      alert(count > 0 ? `Created/Rebuilt ${count} batch(es) for ${batchDate}` : `No batches created for ${batchDate}`);
    } catch (err) {
      console.error('Generate batches error:', err);
      alert(err.response?.data?.message || 'Failed to generate batches');
    } finally {
      setProcessing(false);
    }
  };

  const handleProceed = async (id) => {
    if (!window.confirm("Are you sure you want to proceed with this production?")) {
      return;
    }
    try {
      setProcessing(true);
      try {
        await axiosInstance.post(`/api/produced-resins/${id}/proceed`);
        await fetchProducedResins();
        return;
      } catch (err) {
        console.warn('Proceed endpoint not available, updating locally');
      }

      setProducedResins(prevResins => 
        prevResins.map(resin => 
          resin._id === id 
            ? { ...resin, status: 'in_process', proceededAt: new Date().toISOString() }
            : resin
        )
      );
      alert("Production moved to 'in process'");
    } catch (error) {
      console.error("Error proceeding production:", error);
      alert(error.response?.data?.message || "Failed to proceed with production");
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this production as completed?")) return;
    try {
      setProcessing(true);
      try {
        await axiosInstance.post(`/api/produced-resins/${id}/complete`);
        await fetchProducedResins();
        return;
      } catch (err) {
        console.warn('Complete endpoint not available, updating locally');
      }

      setProducedResins(prevResins => 
        prevResins.map(resin => 
          resin._id === id 
            ? { ...resin, status: 'done', completedAt: new Date().toISOString() }
            : resin
        )
      );
      alert('Production marked as done');
    } catch (err) {
      console.error('handleComplete error:', err);
      alert(err.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeploy = async (id) => {
    // Find the production record
    const production = producedResins.find(r => r._id === id);
    if (!production) {
      alert("Production record not found");
      return;
    }

    // If it's a batch, dispatch to all allocations at once
    if (production.isBatch) {
      if (production.status !== 'done') {
        alert('Batch must be Completed before Dispatch');
        return;
      }
      if (!window.confirm(`Dispatch entire batch ${production.batchNumber} to all clients now?`)) return;
      try {
        setProcessing(true);
        await axiosInstance.post(`/api/batches/${id}/dispatch`);
        await fetchProducedResins();
        setFilter('archived');
        alert('Batch dispatched to all clients');
      } catch (error) {
        console.error('Batch dispatch error:', error);
        alert(error.response?.data?.message || 'Failed to dispatch batch');
      } finally {
        setProcessing(false);
      }
      return;
    }

    const availableQty = production.litres;
    const unit = production.unit || 'litres';

    // Ask user for quantity to dispatch
    const userInput = prompt(
      `How many ${unit} would you like to dispatch?\n\n` +
      `Available: ${availableQty} ${unit}\n` +
      `Enter quantity or type "all" for full dispatch:`
    );

    if (!userInput) return; // User cancelled

    let dispatchQty;
    if (userInput.toLowerCase().trim() === 'all') {
      dispatchQty = availableQty;
    } else {
      dispatchQty = parseFloat(userInput);
      if (isNaN(dispatchQty) || dispatchQty <= 0) {
        alert("Invalid quantity. Please enter a positive number.");
        return;
      }
      if (dispatchQty > availableQty) {
        alert(`Cannot dispatch more than available quantity (${availableQty} ${unit})`);
        return;
      }
    }

    try {
      setProcessing(true);
      await axiosInstance.post(`/api/produced-resins/${id}/deploy`, {
        dispatchQuantity: dispatchQty
      });
      await fetchProducedResins();
      setFilter('archived'); // Switch to history view
      alert(`Successfully dispatched ${dispatchQty} ${unit}` + 
            (dispatchQty < availableQty ? `\n${availableQty - dispatchQty} ${unit} moved to Godown` : ''));
    } catch (error) {
      console.error("Error dispatching production:", error);
      alert(error.response?.data?.message || "Failed to dispatch production");
    } finally {
      setProcessing(false);
    }
  };

  const handleDispatchAllocation = async (batchId, allocation) => {
    if (!window.confirm(`Dispatch ${allocation.litres} litres to ${allocation.clientName}?`)) return;
    
    try {
      setProcessing(true);
      await axiosInstance.post(`/api/batches/${batchId}/dispatch-allocation`, {
        allocationIndex: allocation.clientSeq - 1
      });
      await fetchProducedResins();
      alert(`Successfully dispatched ${allocation.litres} litres to ${allocation.clientName}`);
    } catch (error) {
      console.error('Allocation dispatch error:', error);
      alert(error.response?.data?.message || 'Failed to dispatch allocation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this production? Materials will be returned to stock.")) {
      return;
    }
    const pass = window.prompt("Enter admin password to confirm deletion:");
    if (pass == null) return; // cancelled
    if (pass !== '123@Ako') {
      alert('Incorrect password. Deletion cancelled.');
      return;
    }
    try {
      setProcessing(true);
      await axiosInstance.delete(`/api/produced-resins/${id}`, {
        headers: { 'x-admin-pass': pass }
      });
      alert("Production deleted successfully");
      fetchProducedResins();
    } catch (error) {
      console.error("Error deleting production:", error);
      alert(error.response?.data?.message || "Failed to delete production");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchProducedResins();
    fetchCapacities();
  }, []);

  // Filter resins based on active vs archived
  const activeStatuses = ['pending', 'in_process', 'done'];
  const filteredResins = producedResins.filter(resin => {
    const status = resin.status || 'pending';
    
    // Hide original production records that were split into client+godown
    // Show only the individual split records (which have originalProductionId)
    if (resin.splitInto && status === 'deployed') {
      return false; // Hide the original record
    }
    
    if (filter === 'active') {
      // Show all active items (both batches and single productions)
      return activeStatuses.includes(status);
    } else {
      // In History: hide deployed records that are batch children (shown as individuals)
      // Keep only the batch-level record and non-batch items
      if (status === 'deployed' && resin.isBatchChild === true) {
        return false;
      }
      return ['deployed', 'deleted'].includes(status);
    }
  });

  // Separate active view into batches vs singles for better presentation
  const activeBatches = filter === 'active' ? filteredResins.filter(r => r.isBatch) : [];
  // Build a set of order IDs present in active batches (to hide duplicate singles of same orders)
  const batchedOrderIds = new Set(
    activeBatches.flatMap(b => (Array.isArray(b.allocations) ? b.allocations : []))
      .map(a => String(a.orderId || ''))
      .filter(Boolean)
  );
  const batchedOrderNumbers = new Set(
    activeBatches.flatMap(b => (Array.isArray(b.allocations) ? b.allocations : []))
      .map(a => String(a.orderNumber || ''))
      .filter(Boolean)
  );
  const activeSingles = filter === 'active'
    ? filteredResins
        .filter(r => !r.isBatch)
        // Hide singles that belong to orders already present in any active batch
        .filter(r => {
          const fromOrderId = r.fromOrderId ? String(r.fromOrderId) : '';
          const orderNum = r.orderNumber ? String(r.orderNumber) : '';
          if (fromOrderId && batchedOrderIds.has(fromOrderId)) return false;
          if (orderNum && batchedOrderNumbers.has(orderNum)) return false;
          return true;
        })
    : [];

  // Apply date filter only for archived/history view
  const viewResins = filter === 'archived'
    ? filteredResins.filter((r) => {
        const ymd = getLocalYMD(historyTime(r));
        return selectedDate ? ymd === selectedDate : true;
      })
    : filteredResins;
  
  // Group ALL active items (batches and singles) by resin type for the summary view
  const groupedByResinForSummary = filter === 'active' ? (() => {
    const map = new Map();
    filteredResins.forEach(item => {
      const key = item.resinType;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    
    // Sort each group by status (pending first) and producedAt
    map.forEach((items, key) => {
      const statusOrder = { pending: 0, in_process: 1, done: 2 };
      items.sort((a, b) => {
        const statusA = statusOrder[a.status || 'pending'] ?? 0;
        const statusB = statusOrder[b.status || 'pending'] ?? 0;
        if (statusA !== statusB) return statusA - statusB;
        return new Date(a.producedAt || a.createdAt).getTime() - new Date(b.producedAt || b.createdAt).getTime();
      });
    });
    
    // Sort resin types: those with pending items first, then by name
    const sortedEntries = Array.from(map.entries()).sort(([resinA, itemsA], [resinB, itemsB]) => {
      const hasPendingA = itemsA.some(i => i.status === 'pending');
      const hasPendingB = itemsB.some(i => i.status === 'pending');
      if (hasPendingA && !hasPendingB) return -1;
      if (!hasPendingA && hasPendingB) return 1;
      return resinA.localeCompare(resinB);
    });
    return new Map(sortedEntries);
  })() : null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return '#17a2b8';
      case 'deployed': return '#28a745';
      case 'deleted': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleCopyOrderNumber = async () => {
    const text = selectedItem?.orderNumber;
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
      alert('Failed to copy order number');
    }
  };

  const toggleResinExpand = (resinType) => {
    setExpandedResins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resinType)) {
        newSet.delete(resinType);
      } else {
        newSet.add(resinType);
      }
      return newSet;
    });
  };

  // Map backend status values to user-facing labels
  const displayStatus = (status) => {
    if (status === 'deployed') return 'dispatched';
    if (status === 'in_process') return 'in process';
    return status || 'pending';
  };

  return (
    <div className="produced-resins-container" data-filter={filter}>
      <h2>📦 Produced Resins</h2>
      
      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'active' ? '#007bff' : '#e0e0e0',
            color: filter === 'active' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: filter === 'active' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Active Orders
        </button>
        <button
          onClick={() => setFilter('archived')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'archived' ? '#007bff' : '#e0e0e0',
            color: filter === 'archived' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: filter === 'archived' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          📚 History (Dispatched/Deleted)
        </button>
      </div>

      {/* Batch Generation (Active view only) */}
      {filter === 'active' && (
        <div style={{
          margin: '0 auto 16px',
          maxWidth: 920,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #e5e7eb'
        }}>
          <label style={{ fontSize: 13, color: '#374151' }}>Batch date:</label>
          <input
            type="date"
            value={batchDate}
            onChange={(e) => setBatchDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
          <button
            onClick={handleGenerateBatches}
            className="timeline-btn timeline-btn-proceed"
            disabled={processing}
            title="Create FIFO batches for the selected date using per-resin capacity"
            style={{ padding: '8px 14px' }}
          >
            ⚙️ Generate Batches
          </button>
        </div>
      )}

      {filter === 'active' && (
        <div style={{
          margin: '0 auto 16px',
          maxWidth: 920,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2em' }}>⚙️ Batch Capacity Settings</h3>
              <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.9 }}>Configure batch size for each resin type (in litres)</p>
            </div>
            <button
              onClick={handleSaveCapacities}
              disabled={capSaving}
              title="Save all capacities"
              style={{ 
                padding: '10px 20px',
                background: capSaving ? '#95a5a6' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: capSaving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => !capSaving && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !capSaving && (e.target.style.transform = 'translateY(0)')}
            >
              {capSaving ? '⏳ Saving...' : '💾 Save All Settings'}
            </button>
          </div>
          {capLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 14 }}>⏳ Loading capacities...</div>
            </div>
          ) : (
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              padding: 16,
              borderRadius: 8
            }}>
              {/* Resin Selector Dropdown */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600,
                  fontSize: 14
                }}>
                  Select Resin Type:
                </label>
                <select
                  value={selectedResinForCapacity}
                  onChange={(e) => setSelectedResinForCapacity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 15,
                    fontWeight: 600,
                    border: '2px solid #e0e0e0',
                    borderRadius: 8,
                    background: 'white',
                    color: '#2c3e50',
                    cursor: 'pointer'
                  }}
                >
                  {Object.keys(capacities).sort().map((name) => (
                    <option key={name} value={name}>
                      🧪 {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Input for Selected Resin */}
              {selectedResinForCapacity && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.9)',
                  padding: '20px',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 12
                  }}>
                    <label style={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      fontSize: 16
                    }}>
                      🧪 {selectedResinForCapacity}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="number"
                        min="1"
                        step="100"
                        value={capacities[selectedResinForCapacity] ?? ''}
                        onChange={(e) => setCapacities(prev => ({ ...prev, [selectedResinForCapacity]: e.target.value }))}
                        style={{ 
                          width: '140px',
                          padding: '12px 16px', 
                          border: '2px solid #3498db', 
                          borderRadius: 8,
                          fontSize: 18,
                          fontWeight: 700,
                          textAlign: 'right',
                          color: '#2c3e50'
                        }}
                      />
                      <span style={{ fontSize: 16, color: '#7f8c8d', fontWeight: 600 }}>Litres</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '10px 12px',
                    background: '#e8f5e9',
                    borderRadius: 6,
                    color: '#2e7d32',
                    fontSize: 13,
                    border: '1px solid #c8e6c9'
                  }}>
                    💡 Current capacity: <strong>{capacities[selectedResinForCapacity] || 5000} litres</strong> per batch
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              <div style={{ 
                marginTop: 16,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: 12, opacity: 0.9, width: '100%', textAlign: 'center', marginBottom: 4 }}>Quick presets:</span>
                {[1000, 2000, 3000, 5000, 6000, 10000].map(preset => (
                  <button
                    key={preset}
                    onClick={() => selectedResinForCapacity && setCapacities(prev => ({ ...prev, [selectedResinForCapacity]: preset }))}
                    disabled={!selectedResinForCapacity}
                    style={{
                      padding: '6px 14px',
                      background: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.4)',
                      borderRadius: 6,
                      cursor: selectedResinForCapacity ? 'pointer' : 'not-allowed',
                      fontSize: 12,
                      fontWeight: 600,
                      opacity: selectedResinForCapacity ? 1 : 0.5
                    }}
                  >
                    {preset}L
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ 
            marginTop: 12, 
            padding: '10px 12px', 
            background: 'rgba(255,255,255,0.15)', 
            borderRadius: 6,
            fontSize: 12,
            opacity: 0.9
          }}>
            💡 <strong>Tip:</strong> Select a resin type from the dropdown and set its batch capacity. Click "Save All Settings" when done.
          </div>
        </div>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: "10px" }}>
            {filter === 'active' ? 'Active' : 'Archived'} items: {filter === 'archived' ? viewResins.length : filteredResins.length}
          </div>
          {filter === 'archived' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                title="Filter by date"
                style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8 }}
              />
            </div>
          )}
          
          {filter === 'active' && groupedByResinForSummary && groupedByResinForSummary.size > 0 ? (
            // Active view: Show resin summary cards with expandable batches
            <div className="batches-by-resin">
              {Array.from(groupedByResinForSummary.entries()).map(([resinType, items]) => {
                const isExpanded = expandedResins.has(resinType);
                const batches = items.filter(i => i.isBatch);
                const singles = items
                  .filter(i => !i.isBatch)
                  // also hide per-resin duplicates (in case items array includes singles we filtered above)
                  .filter(i => {
                    const fromOrderId = i.fromOrderId ? String(i.fromOrderId) : '';
                    const orderNum = i.orderNumber ? String(i.orderNumber) : '';
                    if (fromOrderId && batchedOrderIds.has(fromOrderId)) return false;
                    if (orderNum && batchedOrderNumbers.has(orderNum)) return false;
                    return true;
                  });
                // Total should reflect only what's actually displayed (batches + de-duplicated singles)
                const totalLitres = [...batches, ...singles].reduce((sum, item) => sum + Number(item.litres || 0), 0);
                
                return (
                  <div key={resinType} className="resin-group-card">
                    <h3 
                      className="resin-group-title clickable"
                      onClick={() => toggleResinExpand(resinType)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🧪 {resinType}
                        </span>
                        <span style={{ fontSize: '0.9em', fontWeight: 'normal', color: '#666' }}>
                          {totalLitres} litres
                        </span>
                      </div>
                      <span style={{ fontSize: '1.2em' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </h3>
                    
                    {isExpanded && (
                      <div>
                        {/* Show batches */}
                        {batches.map(batch => (
                          <div key={batch._id} className="batch-card">
                            <div className="batch-header">
                              <div className="batch-info">
                                <strong className="batch-number">{batch.batchNumber}</strong>
                                <span className="batch-total">Total: {batch.litres} {batch.unit || 'litres'}</span>
                                <span 
                                  className="timeline-badge"
                                  style={{
                                    backgroundColor: getStatusColor(batch.status),
                                    color: batch.status === 'pending' ? '#000' : '#fff',
                                  }}
                                >
                                  {displayStatus(batch.status)}
                                </span>
                              </div>
                              <div className="batch-actions">
                                {(!batch.status || batch.status === 'pending') && (
                                  <>
                                    <button
                                      onClick={() => handleProceed(batch._id)}
                                      className="timeline-btn timeline-btn-proceed"
                                      disabled={processing}
                                    >
                                      Proceed All
                                    </button>
                                    <button
                                      onClick={() => handleDelete(batch._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}

                                {batch.status === 'in_process' && (
                                  <>
                                    <button
                                      onClick={() => handleComplete(batch._id)}
                                      className="timeline-btn timeline-btn-complete"
                                      disabled={processing}
                                    >
                                      Complete All
                                    </button>
                                    <button
                                      onClick={() => handleDelete(batch._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}

                                {batch.status === 'done' && (
                                  <>
                                    <button
                                      onClick={() => handleDeploy(batch._id)}
                                      className="timeline-btn timeline-btn-deploy"
                                      disabled={processing}
                                    >
                                      Dispatch All
                                    </button>
                                    <button
                                      onClick={() => handleDelete(batch._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Show individual client orders in batch */}
                            {batch.allocations && batch.allocations.length > 0 && (
                              <div className="batch-orders">
                                <div className="batch-orders-label">Client Orders in this batch:</div>
                                {batch.allocations.map((alloc, idx) => (
                                  <div key={idx} className="batch-order-item">
                                    <span className="order-seq">C{alloc.clientSeq}</span>
                                    <span className="order-client">{alloc.clientName}</span>
                                    <span className="order-qty">{alloc.litres} {alloc.unit || 'litres'}</span>
                                    <span className="order-num">Order: #{alloc.orderNumber}</span>
                                    {batch.status === 'done' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDispatchAllocation(batch._id, alloc);
                                        }}
                                        className="timeline-btn timeline-btn-deploy"
                                        disabled={processing}
                                        style={{ marginLeft: 'auto', fontSize: '0.85em', padding: '4px 12px' }}
                                      >
                                        Dispatch {alloc.clientName}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Show single productions */}
                        {singles.map((item) => (
                          <div key={item._id} className="batch-card">
                            <div className="batch-header">
                              <div className="batch-info">
                                <strong className="batch-number">{item.litres} {item.unit || 'litres'}</strong>
                                {item.clientName && (
                                  <span className="order-client">{item.clientName}</span>
                                )}
                                {item.fromOrderId && (
                                  <span className="timeline-order">Order ID: {item.fromOrderId}</span>
                                )}
                                {item.orderNumber && (
                                  <span className="timeline-order">Order #: {item.orderNumber}</span>
                                )}
                                <span 
                                  className="timeline-badge"
                                  style={{
                                    backgroundColor: getStatusColor(item.status),
                                    color: item.status === 'pending' ? '#000' : '#fff',
                                  }}
                                >
                                  {displayStatus(item.status)}
                                </span>
                              </div>
                              <div className="batch-actions">
                                {(!item.status || item.status === 'pending') && (
                                  <>
                                    <button
                                      onClick={() => handleProceed(item._id)}
                                      className="timeline-btn timeline-btn-proceed"
                                      disabled={processing}
                                    >
                                      Proceed
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}

                                {item.status === 'in_process' && (
                                  <>
                                    <button
                                      onClick={() => handleComplete(item._id)}
                                      className="timeline-btn timeline-btn-complete"
                                      disabled={processing}
                                    >
                                      Completed
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}

                                {item.status === 'done' && (
                                  <>
                                    <button
                                      onClick={() => handleDeploy(item._id)}
                                      className="timeline-btn timeline-btn-deploy"
                                      disabled={processing}
                                    >
                                      Dispatch
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item._id)}
                                      className="timeline-btn timeline-btn-delete"
                                      disabled={processing}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : filter === 'archived' && filteredResins.length > 0 ? (
            // Archived view: Timeline as before
            <div className="timeline-container">
              {(() => {
                // Group by date
                const byDate = new Map();
                viewResins.forEach(resin => {
                  const basisTime = filter === 'archived' ? historyTime(resin) : (resin.producedAt || resin.createdAt);
                  const date = basisTime ? new Date(basisTime).toLocaleDateString() : 'Unknown';
                  if (!byDate.has(date)) byDate.set(date, []);
                  byDate.get(date).push(resin);
                });

                return Array.from(byDate.entries()).map(([date, resins]) => (
                  <div className="timeline-date-group" key={date}>
                    <div className="date-circle">
                      <div className="date-text">{new Date(filter === 'archived' ? historyTime(resins[0]) : (resins[0].producedAt || resins[0].createdAt)).getDate()}</div>
                      <div className="month-text">{new Date(filter === 'archived' ? historyTime(resins[0]) : (resins[0].producedAt || resins[0].createdAt)).toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                    <div className="timeline-items">
                      {resins.map((resin) => (
                        <div 
                          className={`timeline-item ${filter === 'archived' ? 'clickable' : ''}`}
                          key={resin._id}
                          onClick={() => filter === 'archived' && handleItemClick(resin)}
                          style={{ cursor: filter === 'archived' ? 'pointer' : 'default' }}
                        >
                          <div className="timeline-item-content">
                            <div className="timeline-header">
                              <strong>{resin.resinType}</strong>
                              <span className="timeline-quantity">{resin.litres} {resin.unit || 'litres'}</span>
                              {resin.batchNumber && (
                                <span className="timeline-order" title="Batch Number">Batch: {resin.batchNumber}</span>
                              )}
                              {resin.orderNumber && !resin.isBatch && (
                                <span className="timeline-order"># {resin.orderNumber}</span>
                              )}
                              <span 
                                className="timeline-badge"
                                style={{
                                  backgroundColor: getStatusColor(resin.status),
                                  color: resin.status === 'pending' ? '#000' : '#fff',
                                }}
                              >
                                {displayStatus(resin.status)}
                              </span>
                              {filter === 'archived' && (
                                <span className="timeline-time-inline">
                                  {new Date(historyTime(resin)).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            {filter !== 'archived' && (
                              <div className="timeline-time">
                                {new Date(resin.producedAt).toLocaleTimeString()}
                                {resin.clientName && <span className="timeline-client"> • {resin.clientName}</span>}
                              </div>
                            )}
                            {resin.clientName && filter === 'archived' && (
                              <div className="timeline-time">
                                <span className="timeline-client">{resin.clientName}</span>
                                {((resin.fromSplit === true) || (resin.orderNumber && /S[12]$/.test(resin.orderNumber))) && (
                                  <span className="timeline-split-info"> • From split production</span>
                                )}
                              </div>
                            )}
                            <div className="timeline-actions">
                              {(!resin.status || resin.status === 'pending') && (
                                <>
                                  <button
                                    onClick={() => handleProceed(resin._id)}
                                    className="timeline-btn timeline-btn-proceed"
                                    disabled={processing}
                                  >
                                    Proceed
                                  </button>
                                  <button
                                    onClick={() => handleDelete(resin._id)}
                                    className="timeline-btn timeline-btn-delete"
                                    disabled={processing}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}

                              {resin.status === 'in_process' && (
                                <>
                                  <button
                                    onClick={() => handleComplete(resin._id)}
                                    className="timeline-btn timeline-btn-complete"
                                    disabled={processing}
                                  >
                                    Completed
                                  </button>
                                  <button
                                    onClick={() => handleDelete(resin._id)}
                                    className="timeline-btn timeline-btn-delete"
                                    disabled={processing}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}

                              {resin.status === 'done' && (
                                <>
                                  <button
                                    onClick={() => handleDeploy(resin._id)}
                                    className="timeline-btn timeline-btn-deploy"
                                    disabled={processing}
                                  >
                                    Dispatch
                                  </button>
                                  <button
                                    onClick={() => handleDelete(resin._id)}
                                    className="timeline-btn timeline-btn-delete"
                                    disabled={processing}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            // No active items
            <p>No resins have been produced yet.</p>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            
            <h3 className="modal-title">📋 Production Details</h3>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>🧪 Product Information</h4>
                <div className="detail-row">
                  <span className="detail-label">Resin Type:</span>
                  <span className="detail-value">{selectedItem.resinType}</span>
                </div>
                        {selectedItem.batchNumber && (
                          <div className="detail-row">
                            <span className="detail-label">Batch #:</span>
                            <span className="detail-value">{selectedItem.batchNumber}</span>
                          </div>
                        )}
                        {selectedItem.orderNumber && !selectedItem.isBatch && (
                          <div className="detail-row">
                            <span className="detail-label">Order #:</span>
                            <span className="detail-value">
                              {selectedItem.orderNumber}
                              <button 
                                className="copy-btn" 
                                onClick={handleCopyOrderNumber}
                                title="Copy order number"
                              >
                                📋
                              </button>
                              {copied && <span className="copy-status">Copied</span>}
                            </span>
                          </div>
                        )}
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{selectedItem.litres} {selectedItem.unit || 'litres'}</span>
                </div>
                {selectedItem.clientName && (
                  <div className="detail-row">
                    <span className="detail-label">Client:</span>
                    <span className="detail-value">{selectedItem.clientName}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span 
                    className="status-badge-modal"
                    style={{
                      backgroundColor: getStatusColor(selectedItem.status),
                      color: selectedItem.status === 'pending' ? '#000' : '#fff',
                    }}
                  >
                    {displayStatus(selectedItem.status)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>⏱️ Timeline</h4>
                <div className="timeline-vertical">
                  {selectedItem.producedAt && (
                    <div className="timeline-step">
                      <div className="step-icon produced">🏭</div>
                      <div className="step-content">
                        <div className="step-title">Produced</div>
                        <div className="step-time">
                          {new Date(selectedItem.producedAt).toLocaleDateString()}<br/>
                          {new Date(selectedItem.producedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.proceededAt && (
                    <div className="timeline-step">
                      <div className="step-icon proceeded">▶️</div>
                      <div className="step-content">
                        <div className="step-title">Proceeded (In Process)</div>
                        <div className="step-time">
                          {new Date(selectedItem.proceededAt).toLocaleDateString()}<br/>
                          {new Date(selectedItem.proceededAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.completedAt && (
                    <div className="timeline-step">
                      <div className="step-icon completed">✅</div>
                      <div className="step-content">
                        <div className="step-title">Completed</div>
                        <div className="step-time">
                          {new Date(selectedItem.completedAt).toLocaleDateString()}<br/>
                          {new Date(selectedItem.completedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.deployedAt && (
                    <div className="timeline-step">
                      <div className="step-icon deployed">🚀</div>
                      <div className="step-content">
                        <div className="step-title">Dispatched</div>
                        <div className="step-time">
                          {new Date(selectedItem.deployedAt).toLocaleDateString()}<br/>
                          {new Date(selectedItem.deployedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.deletedAt && (
                    <div className="timeline-step">
                      <div className="step-icon deleted">🗑️</div>
                      <div className="step-content">
                        <div className="step-title">Deleted</div>
                        <div className="step-time">
                          {new Date(selectedItem.deletedAt).toLocaleDateString()}<br/>
                          {new Date(selectedItem.deletedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedItem.materialsUsed && selectedItem.materialsUsed.length > 0 && (
                <div className="detail-section">
                  <h4>📦 Materials Used</h4>
                  <table className="materials-table">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.materialsUsed.map((mat, idx) => (
                        <tr key={idx}>
                          <td>{mat.material}</td>
                          <td>{mat.requiredQty.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedItem.isBatch && Array.isArray(selectedItem.allocations) && selectedItem.allocations.length > 0 && (
                <div className="detail-section">
                  <h4>👥 Client Allocations</h4>
                  <table className="materials-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Client</th>
                        <th>Qty</th>
                        <th>Order #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.allocations.map((a, idx) => (
                        <tr key={idx}>
                          <td>{a.clientSeq}</td>
                          <td>{a.clientName}</td>
                          <td>{a.litres} {a.unit || 'litres'}</td>
                          <td>{a.displayOrderNumber || `${a.orderNumber}C${a.clientSeq}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProducedResins;
