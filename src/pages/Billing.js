import React, { useEffect, useMemo, useState } from "react";
import axiosInstance, { API_ENDPOINTS } from "../utils/axiosInstance";
import "./Billing.css";
import { printInvoice } from "../utils/printInvoice";

// Default rates (per litre) - editable by user
const DEFAULT_RATES = {
  epoxy: 1.5,
  alkyd: 1.89,
  acrylic: 3.3,
  phenolic: 5.23,
};

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [produced, setProduced] = useState([]); // deployed items (includes client and godown)
  const [orderInput, setOrderInput] = useState("");
  const [orderNumbers, setOrderNumbers] = useState([]); // selected order numbers
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [allResins, setAllResins] = useState([]); // All resins from backend
  const [transactionPercent, setTransactionPercent] = useState(100);
  const [includeGodown, setIncludeGodown] = useState(false);
  const [clientFilter, setClientFilter] = useState(""); // Client name filter

  // Fetch all resins to initialize rates
  useEffect(() => {
    const fetchResins = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.RESINS.GET_ALL);
        const resins = res.data || [];
        setAllResins(resins);
        
        // Initialize rates for all resins
        const newRates = { ...DEFAULT_RATES };
        resins.forEach(resin => {
          if (!newRates[resin.name]) {
            newRates[resin.name] = 1.0; // Default rate for new resins
          }
        });
        setRates(newRates);
      } catch (err) {
        console.error("Failed to fetch resins:", err);
      }
    };
    fetchResins();
  }, []);

  // Fetch deployed items function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/api/dispatched/all");
      // Convert the grouped resin data into a flat list of items
      const items = [];
      if (res.data?.success && res.data?.data) {
        res.data.data.forEach(resinGroup => {
          resinGroup.orders.forEach(order => {
            items.push({
              _id: order._id,
              orderNumber: order.orderNumber,
              clientName: order.clientName,
              resinType: resinGroup.resinType,
              litres: order.dispatchedQty,
              unit: order.unit,
              deployedAt: order.dispatchTime,
              status: 'deployed'
            });
          });
        });
      }
      setProduced(items);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load deployed items");
    } finally {
      setLoading(false);
    }
  };

  // Fetch deployed items once
  useEffect(() => {
    fetchData();
  }, []);

  // Unique, recent order numbers for help/suggestion
  const availableOrders = useMemo(() => {
    const set = new Set();
    const list = [];
    for (const i of produced) {
      if (!includeGodown && (i.clientName || '').toLowerCase() === 'godown') continue;
      // Apply client filter
      if (clientFilter && !(i.clientName || '').toLowerCase().includes(clientFilter.toLowerCase())) continue;
      if (i.orderNumber && !set.has(i.orderNumber)) {
        set.add(i.orderNumber);
        list.push(i.orderNumber);
      }
    }
    // sort by recency using deployedAt
    return list.sort((a, b) => {
      const ia = produced.find((x) => x.orderNumber === a);
      const ib = produced.find((x) => x.orderNumber === b);
      return new Date(ib?.deployedAt || 0) - new Date(ia?.deployedAt || 0);
    });
  }, [produced, includeGodown, clientFilter]);

  // Get unique client names for filter dropdown
  const availableClients = useMemo(() => {
    const clients = new Set();
    produced.forEach(i => {
      if (i.clientName && (!includeGodown || (i.clientName || '').toLowerCase() !== 'godown')) {
        clients.add(i.clientName);
      }
    });
    return Array.from(clients).sort();
  }, [produced, includeGodown]);

  const addOrderNumber = () => {
    // Support comma/space separated entries
    const parts = orderInput
      .split(/[,\n\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setOrderNumbers((prev) => {
      const set = new Set(prev);
      parts.forEach((p) => set.add(p));
      return Array.from(set);
    });
    setOrderInput("");
  };

  const removeOrder = (ord) => {
    setOrderNumbers((prev) => prev.filter((o) => o !== ord));
  };

  const handlePickOrder = (ord) => {
    if (!ord) return;
    setOrderNumbers((prev) => (prev.includes(ord) ? prev : [...prev, ord]));
  };

  // Find items matching selected order numbers
  const matchedItems = useMemo(() => {
    if (orderNumbers.length === 0) return [];
    const set = new Set(orderNumbers.map((o) => String(o).trim()));
    return produced.filter((i) => {
      if (!includeGodown && (i.clientName || '').toLowerCase() === 'godown') return false;
      return i.orderNumber && set.has(i.orderNumber);
    });
  }, [orderNumbers, produced, includeGodown]);


  // Track already billed orders
  const [billedOrders, setBilledOrders] = useState([]);

  // Fetch billed orders on mount
  useEffect(() => {
    const fetchBilled = async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.BILLING.GET_ALL);
        // Flatten all billed order numbers
        const billed = [];
        (res.data || []).forEach(doc => {
          (doc.items || []).forEach(it => {
            if (it.orderNumber) billed.push(it.orderNumber);
          });
        });
        setBilledOrders(billed);
      } catch (err) {
        // Non-fatal
        setBilledOrders([]);
      }
    };
    fetchBilled();
  }, []);

  // Only show available orders that are not billed
  const unbilledOrders = useMemo(() => {
    const billedSet = new Set(billedOrders);
    return availableOrders.filter(o => !billedSet.has(o));
  }, [availableOrders, billedOrders]);

  const notFoundOrders = useMemo(() => {
    if (orderNumbers.length === 0) return [];
    const avail = new Set(availableOrders);
    return orderNumbers.filter((o) => !avail.has(o));
  }, [orderNumbers, availableOrders]);

  // Build a dynamic set of resin keys to show editable rates for any unknowns
  const dynamicRateKeys = useMemo(() => {
    const keys = new Set(Object.keys(rates)); // Use all available rates
    matchedItems.forEach((i) => keys.add(i.resinType)); // Add resin types from matched items
    return Array.from(keys).sort();
  }, [matchedItems, rates]);

  // Line totals and subtotal
  const lines = useMemo(() => {
    return matchedItems.map((i) => {
      const key = i.resinType; // Use actual resin name
      const rate = rates[key] ?? 1.0; // Default to 1.0 if not found
      const qty = Number(i.litres) || 0;
      const lineTotal = qty * rate;
      return { id: i._id, orderNumber: i.orderNumber, date: i.deployedAt, client: i.clientName, resin: i.resinType, unit: i.unit || "litres", qty, rate, lineTotal };
    });
  }, [matchedItems, rates]);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);

  // Payment split calculations
  const txPct = Math.max(0, Math.min(100, Number(transactionPercent) || 0));
  const transactionBase = subtotal * (txPct / 100);
  const gst = transactionBase * 0.18;
  const transactionTotal = transactionBase + gst;
  const cashAmount = subtotal * (1 - txPct / 100);
  const grandTotal = cashAmount + transactionTotal;

  const handleRateChange = (key, val) => {
    const num = Number(val);
    setRates((prev) => ({ ...prev, [key]: isNaN(num) ? prev[key] : num }));
  };

  const handlePrint = () => {
    if (lines.length === 0) return;
    
    printInvoice({
      items: lines.map(l => ({
        orderNumber: l.orderNumber,
        clientName: l.client,
        resinType: l.resin,
        litres: l.qty,
        rate: l.rate,
        lineTotal: l.lineTotal
      })),
      totals: {
        subtotal,
        transactionPercent: txPct,
        transactionBase,
        gst,
        transactionTotal,
        cashAmount,
        grandTotal
      },
      date: new Date()
    });
  };

  const handleMarkDone = async () => {
    if (lines.length === 0) return;
    const pass = window.prompt("Enter admin password to mark billing as done:");
    if (pass == null) return; // cancelled
    if (pass !== '123@Ako') {
      alert('Incorrect password. Action cancelled.');
      return;
    }

    // Pre-check if any of these orders were already billed
    try {
      const orderSet = Array.from(new Set(lines.map(l => l.orderNumber).filter(Boolean)));
      if (orderSet.length > 0) {
        const qp = encodeURIComponent(orderSet.join(','));
        const ex = await axiosInstance.get(`/api/billing/by-orders?orders=${qp}`);
        const existingOrders = new Set();
        (ex.data || []).forEach(doc => {
          (doc.items || []).forEach(it => existingOrders.add(it.orderNumber));
        });
        const dups = orderSet.filter(o => existingOrders.has(o));
        if (dups.length > 0) {
          alert(`⚠️ Billing is already done for these order(s): ${dups.join(', ')}\n\nRedirecting to Billing History...`);
          // Redirect to billing history
          window.location.href = '/billing-history';
          return;
        }
      }
    } catch (preErr) {
      // Non-fatal: proceed; server will still guard duplicates
      console.warn('Billing pre-check failed:', preErr);
    }

    // Build per-item payment split
    const items = lines.map(l => {
      const txBaseShare = l.lineTotal * (txPct / 100);
      const gstShare = txBaseShare * 0.18;
      const transactionShare = txBaseShare + gstShare;
      const cashShare = l.lineTotal - txBaseShare;
      return {
        orderNumber: l.orderNumber,
        resinType: l.resin,
        clientName: l.client,
        litres: l.qty,
        rate: l.rate,
        lineTotal: l.lineTotal,
        deployedAt: l.date,
        transactionShare,
        cashShare,
        gstShare
      };
    });

    const totals = {
      subtotal,
      transactionPercent: txPct,
      transactionBase,
      gst,
      transactionTotal,
      cashAmount,
      grandTotal,
    };

    try {
      await axiosInstance.post('/api/billing/done', { items, totals }, {
        headers: { 'x-admin-pass': pass }
      });
      alert('✅ Billing recorded successfully!\n\nYou can view this in Billing History.');
      // Clear selection and refresh the items list
      setOrderNumbers([]);
      fetchData(); // Refresh to remove billed items from the list
    } catch (err) {
      console.error('Mark done error', err);
      const msg = err.response?.data?.message || err.message || 'Failed to mark billing as done';
      alert(msg);
    }
  };

  return (
    <div className="billing-container">
      <div className="billing-header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>🧾 Billing & Invoicing</h2>
            <p className="subtitle">Create and manage billing invoices for dispatched orders</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => window.location.href = '/billing-history'}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              📚 View Billing History
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
      </div>

      {loading && <div className="loading-state">⏳ Loading dispatched items…</div>}
      {error && <div className="error">{error}</div>}

      <div className="billing-grid">
        {/* Left: Select orders and set rates */}
        <div className="panel">
          <div className="panel-header">
            <h3>📋 Select Orders</h3>
          </div>

          {/* Client Filter */}
          <div className="filter-section">
            <label htmlFor="client-filter">Filter by Client:</label>
            <select
              id="client-filter"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="client-filter-select"
            >
              <option value="">All Clients</option>
              {availableClients.map((client) => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
            {clientFilter && (
              <button 
                onClick={() => setClientFilter("")} 
                className="clear-filter-btn"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>

          <div className="order-inputs">
            <input
              type="text"
              placeholder="Enter order numbers (comma/space separated)"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOrderNumber()}
            />
            <button onClick={addOrderNumber} className="add-btn">Add</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={includeGodown}
                onChange={(e) => setIncludeGodown(e.target.checked)}
              />
              Include Godown items
            </label>
          </div>

          {unbilledOrders.length > 0 && (
            <div className="suggestions">
              <label htmlFor="unbilled-dropdown">Pick unbilled order:</label>
              <select
                id="unbilled-dropdown"
                style={{ marginLeft: 8, minWidth: 120 }}
                value=""
                onChange={e => {
                  if (e.target.value) handlePickOrder(e.target.value);
                }}
              >
                <option value="">-- Select order --</option>
                {unbilledOrders.map((o) => (
                  <option key={o} value={o}># {o}</option>
                ))}
              </select>
            </div>
          )}

          {orderNumbers.length > 0 && (
            <div className="selected-orders">
              {orderNumbers.map((o) => (
                <span className="order-chip" key={o}>
                  #{o}
                  <button onClick={() => removeOrder(o)} className="remove">×</button>
                </span>
              ))}
            </div>
          )}

          {notFoundOrders.length > 0 && (
            <div className="error" style={{ margin: '0 24px 16px 24px' }}>
              ⚠️ Not found: {notFoundOrders.join(", ")} (make sure you use dispatched order numbers{includeGodown ? '' : '; toggle "Include Godown" for godown IDs'})
            </div>
          )}

          <div className="rates-section">
            <h3>💰 Rates (per litre)</h3>
            <div className="rates-grid">
              {dynamicRateKeys.map((k) => (
                <div className="rate-row" key={k}>
                  <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <div className="rate-input-group">
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rates[k] ?? 0}
                      onChange={(e) => handleRateChange(k, e.target.value)}
                    />
                    <span className="unit">/L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Invoice preview */}
        <div className="panel invoice-panel">
          <div className="panel-header">
            <h3>📄 Invoice Preview</h3>
          </div>
          {lines.length === 0 ? (
            <div className="empty">Add order numbers to build the invoice.</div>
          ) : (
            <div className="invoice" style={{ padding: '24px' }}>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Resin</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td>#{l.orderNumber}</td>
                      <td>{l.date ? new Date(l.date).toLocaleDateString() : "-"}</td>
                      <td>{l.client}</td>
                      <td>{l.resin}</td>
                      <td>
                        {l.qty} {l.unit}
                        {l.unit !== "litres" && (
                          <span className="warn"> • rate shown is per litre</span>
                        )}
                      </td>
                      <td>₹ {l.rate.toFixed(2)}</td>
                      <td>₹ {l.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="right">Subtotal</td>
                    <td>₹ {subtotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="split">
                <div className="split-row">
                  <label>Transaction percentage</label>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={transactionPercent}
                      onChange={(e) => setTransactionPercent(e.target.value)}
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="split-row">
                  <span>Transaction base</span>
                  <span>₹ {transactionBase.toFixed(2)}</span>
                </div>
                <div className="split-row">
                  <span>GST @ 18% (on transaction)</span>
                  <span>₹ {gst.toFixed(2)}</span>
                </div>
                <div className="split-row">
                  <span>Transaction total</span>
                  <span>₹ {transactionTotal.toFixed(2)}</span>
                </div>
                <div className="split-row">
                  <span>Cash (no tax)</span>
                  <span>₹ {cashAmount.toFixed(2)}</span>
                </div>
                <div className="split-row grand">
                  <span>Grand Total</span>
                  <span>₹ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="actions">
                <button onClick={handlePrint}>Print</button>
                <button onClick={handleMarkDone} style={{ marginLeft: 8 }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
