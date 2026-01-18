import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

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

export default function DaySummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]); // deployed items for the day
  const [billingDocs, setBillingDocs] = useState([]);
  const [billingError, setBillingError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => formatYMD(new Date()));
  const [availableDates, setAvailableDates] = useState([]); // Dates with dispatched items

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setBillingError(null);
      let deployedForDay = [];
      try {
        const res = await axiosInstance.get("/api/produced-resins");
        const all = res.data?.items || [];
        const day = selectedDate;
        
        // Find all unique dates with dispatched items
        const allDeployedItems = all.filter(i => i.status === 'deployed' && i.originalProductionId);
        const datesSet = new Set();
        allDeployedItems.forEach(i => {
          // Try deployedAt first, then fall back to producedAt or createdAt
          const d = getLocalYMD(i.deployedAt) || getLocalYMD(i.completedAt) || getLocalYMD(i.producedAt) || getLocalYMD(i.createdAt);
          if (d) datesSet.add(d);
        });
        const sortedDates = Array.from(datesSet).sort().reverse(); // Most recent first
        setAvailableDates(sortedDates);
        
        // Debug logging
        console.log('=== Day Summary Debug ===');
        console.log('Selected date:', day);
        console.log('Total items from API:', all.length);
        console.log('Items with status=deployed:', all.filter(i => i.status === 'deployed').length);
        console.log('Items with originalProductionId:', all.filter(i => i.originalProductionId).length);
        console.log('All deployed items (with originalProductionId):', allDeployedItems.length);
        console.log('Available dispatch dates:', sortedDates);
        
        // Sample deployed items for debugging
        if (allDeployedItems.length > 0) {
          console.log('Sample deployed item:', {
            resinType: allDeployedItems[0].resinType,
            clientName: allDeployedItems[0].clientName,
            deployedAt: allDeployedItems[0].deployedAt,
            deployedAtParsed: getLocalYMD(allDeployedItems[0].deployedAt),
            producedAt: allDeployedItems[0].producedAt,
            producedAtParsed: getLocalYMD(allDeployedItems[0].producedAt),
            createdAt: allDeployedItems[0].createdAt,
            orderNumber: allDeployedItems[0].orderNumber,
            originalProductionId: allDeployedItems[0].originalProductionId
          });
        }
        
        // Only show actual dispatch records (those with originalProductionId), not the original production record
        // Use deployedAt if available, otherwise fall back to other timestamps
        const allDeployed = all.filter(i => {
          const itemDate = getLocalYMD(i.deployedAt) || getLocalYMD(i.completedAt) || getLocalYMD(i.producedAt) || getLocalYMD(i.createdAt);
          return i.status === 'deployed' && itemDate === day;
        });
        deployedForDay = allDeployed.filter(i => i.originalProductionId);
        console.log('Items matching selected date:', deployedForDay.length);
        console.log('========================');
        setItems(deployedForDay);
      } catch (err) {
        console.error('Produced resins fetch failed', err);
        setError(err.response?.data?.message || err.message || 'Failed to load day summary');
        setLoading(false);
        return;
      }

      // Fetch billing docs separately so a failure here doesn't block the summary
      try {
        const orders = Array.from(new Set(deployedForDay
          .map(i => i.orderNumber)
          .filter(Boolean)));
        if (orders.length > 0) {
          const qp = encodeURIComponent(orders.join(','));
          const bill = await axiosInstance.get(`/api/billing/by-orders?orders=${qp}`);
          setBillingDocs(bill.data || []);
        } else {
          setBillingDocs([]);
        }
      } catch (err) {
        console.error('Billing fetch failed', err);
        setBillingError(err.response?.data?.message || err.message || 'Billing data unavailable');
        setBillingDocs([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedDate]);

  // Map orderNumber -> billing item breakdown
  const billingByOrder = useMemo(() => {
    const map = new Map();
    billingDocs.forEach(doc => {
      (doc.items || []).forEach(it => {
        if (!map.has(it.orderNumber)) map.set(it.orderNumber, it);
      });
    });
    return map;
  }, [billingDocs]);

  // Group by resin type
  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach(i => {
      const key = i.resinType || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(i);
    });
    return Array.from(map.entries()).map(([resin, list]) => ({ resin, list }));
  }, [items]);

  const totals = useMemo(() => {
    let litres = 0, tx = 0, cash = 0, gst = 0;
    items.forEach(i => {
      litres += Number(i.litres) || 0;
      const b = i.orderNumber ? billingByOrder.get(i.orderNumber) : null;
      if (b) {
        tx += Number(b.transactionShare) || 0;
        cash += Number(b.cashShare) || 0;
        gst += Number(b.gstShare) || 0;
      }
    });
    return { litres, tx, cash, gst, total: tx + cash };
  }, [items, billingByOrder]);

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>📅 Day's Summary</h2>
        <button onClick={() => window.location.href = '/'} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>
          🏠 Home
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, background: '#f8f9fa', padding: 12, borderRadius: 8 }}>
        <label style={{ fontWeight: 600 }}>Select Date:</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 6, fontSize: 14 }}
        />
        <button 
          onClick={() => setSelectedDate(formatYMD(new Date()))}
          style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          Today
        </button>
        {availableDates.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#666' }}>Available dates:</span>
            {availableDates.slice(0, 5).map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                style={{
                  padding: '6px 12px',
                  background: date === selectedDate ? '#28a745' : '#e9ecef',
                  color: date === selectedDate ? 'white' : '#495057',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: date === selectedDate ? 600 : 400
                }}
              >
                {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div>
          {grouped.length === 0 ? (
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: 10, 
              padding: 20, 
              textAlign: 'center',
              color: '#856404'
            }}>
              <h3>📭 No dispatched orders for {new Date(selectedDate).toLocaleDateString()}</h3>
              <p>Dispatched orders will appear here once you complete and dispatch batches or individual productions.</p>
              {availableDates.length > 0 ? (
                <p style={{ marginTop: 12, fontSize: 14 }}>
                  ℹ️ You have dispatched items on: <strong>{availableDates.slice(0, 3).map(d => new Date(d).toLocaleDateString()).join(', ')}</strong>
                  {availableDates.length > 3 && ` and ${availableDates.length - 3} more date(s)`}
                </p>
              ) : (
                <p style={{ marginTop: 12, fontSize: 14, color: '#721c24', background: '#f8d7da', padding: 10, borderRadius: 6 }}>
                  ⚠️ No items have been dispatched yet. Go to <strong>Products Produced → Active Orders</strong> and dispatch some batches first.
                </p>
              )}
            </div>
          ) : (
            grouped.map(({ resin, list }) => {
              const totalLitres = list.reduce((s, i) => s + (Number(i.litres) || 0), 0);
              const resinTx = list.reduce((s, i) => {
                const b = i.orderNumber ? billingByOrder.get(i.orderNumber) : null;
                return s + (b ? (Number(b.transactionShare) || 0) : 0);
              }, 0);
              const resinCash = list.reduce((s, i) => {
                const b = i.orderNumber ? billingByOrder.get(i.orderNumber) : null;
                return s + (b ? (Number(b.cashShare) || 0) : 0);
              }, 0);
              const resinGST = list.reduce((s, i) => {
                const b = i.orderNumber ? billingByOrder.get(i.orderNumber) : null;
                return s + (b ? (Number(b.gstShare) || 0) : 0);
              }, 0);
              return (
                <div key={resin} style={{ background: '#fff', border: '2px solid #3498db', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: 8 }}>
                    🧪 {resin} — {totalLitres.toFixed(2)} litres
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #dee2e6', padding: 10 }}>Client</th>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #dee2e6', padding: 10 }}>Order #</th>
                        <th style={{ textAlign: 'right', borderBottom: '2px solid #dee2e6', padding: 10 }}>Litres</th>
                        <th style={{ textAlign: 'right', borderBottom: '2px solid #dee2e6', padding: 10 }}>Transaction (₹)</th>
                        <th style={{ textAlign: 'right', borderBottom: '2px solid #dee2e6', padding: 10 }}>Cash (₹)</th>
                        <th style={{ textAlign: 'right', borderBottom: '2px solid #dee2e6', padding: 10 }}>GST (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(i => {
                        const b = i.orderNumber ? billingByOrder.get(i.orderNumber) : null;
                        return (
                          <tr key={i._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: 10 }}>{i.clientName || '-'}</td>
                            <td style={{ padding: 10, fontFamily: 'monospace' }}>#{i.orderNumber || '-'}</td>
                            <td style={{ padding: 10, textAlign: 'right' }}>{i.litres} {i.unit || 'litres'}</td>
                            <td style={{ padding: 10, textAlign: 'right' }}>{b ? `₹ ${(Number(b.transactionShare) || 0).toFixed(2)}` : '-'}</td>
                            <td style={{ padding: 10, textAlign: 'right' }}>{b ? `₹ ${(Number(b.cashShare) || 0).toFixed(2)}` : '-'}</td>
                            <td style={{ padding: 10, textAlign: 'right' }}>{b ? `₹ ${(Number(b.gstShare) || 0).toFixed(2)}` : '-'}</td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#e8f5e9', fontWeight: 600 }}>
                        <td colSpan={2} style={{ padding: 10, textAlign: 'right' }}>Subtotals</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{totalLitres.toFixed(2)} litres</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>₹ {resinTx.toFixed(2)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>₹ {resinCash.toFixed(2)}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>₹ {resinGST.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          )}

          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: '2px solid #5568d3', borderRadius: 12, padding: 20, marginTop: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.5em' }}>💰 Grand Totals for {new Date(selectedDate).toLocaleDateString()}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Total Litres</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{totals.litres.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Transaction</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>₹ {totals.tx.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Cash</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>₹ {totals.cash.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>GST</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold' }}>₹ {totals.gst.toFixed(2)}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.3)', padding: 12, borderRadius: 8, gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>Total Revenue</div>
                <div style={{ fontSize: '2.2em', fontWeight: 'bold' }}>₹ {totals.total.toFixed(2)}</div>
              </div>
            </div>
            {billingError && (
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.9)', color: '#92400e', padding: 10, borderRadius: 8 }}>
                ⚠️ Billing note: {billingError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
