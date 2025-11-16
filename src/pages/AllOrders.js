import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AllOrders.css";

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openResin, setOpenResin] = useState(null);
  const [godownPage, setGodownPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchProduced = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/produced-resins");
        // Filter for dispatched items that represent actual dispatch entries (exclude archived originals)
        // Only include records that have originalProductionId, which are the generated dispatch rows
        const items = (res.data?.items || []).filter(i => i.status === 'deployed' && i.clientName && i.originalProductionId);
        setOrders(items);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchProduced();
  }, []);

  // Separate client orders and godown items
  const { clientOrders, godownItems } = useMemo(() => {
    const clients = orders.filter(o => o.clientName && o.clientName !== 'Godown');
    const godown = orders.filter(o => o.clientName === 'Godown');
    return { clientOrders: clients, godownItems: godown };
  }, [orders]);

  // Group client orders by resin and then by client with total per unit
  const groupedClients = useMemo(() => {
    const byResin = new Map();
    for (const o of clientOrders) {
      const resin = o.resinType || "Unknown Resin";
      const unit = o.unit || "litres";
      const client = o.clientName || "Unknown Client";
      const qty = Number(o.litres) || 0;

      if (!byResin.has(resin)) byResin.set(resin, new Map());
      const resinMap = byResin.get(resin);

      if (!resinMap.has(client)) resinMap.set(client, {});
      const clientTotals = resinMap.get(client);

      clientTotals[unit] = (clientTotals[unit] || 0) + qty;
    }

    // Convert to display-friendly structure
    return Array.from(byResin.entries()).map(([resin, clientMap]) => ({
      resin,
      clients: Array.from(clientMap.entries()).map(([client, totals]) => ({
        client,
        totals, // { litres: x, kgs: y, pounds: z }
      })),
    }));
  }, [clientOrders]);

  // Group godown items by resin type with details
  const groupedGodown = useMemo(() => {
    const byResin = new Map();
    for (const item of godownItems) {
      const resin = item.resinType || "Unknown Resin";
      if (!byResin.has(resin)) byResin.set(resin, []);
      byResin.get(resin).push(item);
    }
    return Array.from(byResin.entries()).map(([resin, items]) => {
      // Sort by deployedAt descending (newest first)
      const sortedItems = [...items].sort((a, b) => 
        new Date(b.deployedAt) - new Date(a.deployedAt)
      );
      return {
        resin,
        items: sortedItems,
        totalsByUnit: items.reduce((acc, item) => {
          const unit = item.unit || 'litres';
          acc[unit] = (acc[unit] || 0) + (Number(item.litres) || 0);
          return acc;
        }, {})
      };
    });
  }, [godownItems]);

  // Paginate godown items
  const paginatedGodown = useMemo(() => {
    return groupedGodown.map(group => {
      const totalItems = group.items.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const startIndex = (godownPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedItems = group.items.slice(startIndex, endIndex);
      
      return {
        ...group,
        paginatedItems,
        totalItems,
        totalPages,
        currentPage: godownPage
      };
    });
  }, [groupedGodown, godownPage]);

  return (
    <div className="all-orders-container">
      <h2>📚 All Orders & Inventory</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">No dispatched orders or godown inventory yet.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          {/* Client Orders Section */}
          <div className="section-container">
            <h3 className="section-title">👥 Client Orders</h3>
            {groupedClients.length === 0 ? (
              <div className="empty-state">No client orders dispatched yet.</div>
            ) : (
              <div className="accordion">
                {groupedClients.map(({ resin, clients }) => {
                  const isOpen = openResin === resin;
                  // Compute totals across clients by unit for header
                  const totalsByUnit = clients.reduce((acc, c) => {
                    for (const [u, v] of Object.entries(c.totals)) {
                      acc[u] = (acc[u] || 0) + v;
                    }
                    return acc;
                  }, {});

                  return (
                    <div className="accordion-item" key={resin}>
                      <button className="accordion-header" onClick={() => setOpenResin(isOpen ? null : resin)}>
                        <div className="resin-title">🧪 {resin}</div>
                        <div className="resin-total">
                          {Object.entries(totalsByUnit).map(([u, v]) => (
                            <span className="unit-chip" key={u}>{v} {u}</span>
                          ))}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="accordion-body">
                          <table className="clients-table">
                            <thead>
                              <tr>
                                <th>Client</th>
                                <th>Totals</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clients.map(({ client, totals }) => (
                                <tr key={client}>
                                  <td>{client}</td>
                                  <td>
                                    {Object.entries(totals).map(([u, v]) => (
                                      <span className="unit-chip" key={u}>{v} {u}</span>
                                    ))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Godown Inventory Section */}
          <div className="section-container godown-section">
            <h3 className="section-title">🏭 Godown Inventory</h3>
            {paginatedGodown.length === 0 ? (
              <div className="empty-state">No items in godown.</div>
            ) : (
              <div className="godown-grid">
                {paginatedGodown.map(({ resin, paginatedItems, totalsByUnit, totalItems, totalPages, currentPage }) => (
                  <div className="godown-card" key={resin}>
                    <div className="godown-header">
                      <h4>🧪 {resin}</h4>
                      <div className="godown-totals">
                        {Object.entries(totalsByUnit).map(([u, v]) => (
                          <span className="total-chip" key={u}>{v} {u}</span>
                        ))}
                      </div>
                    </div>
                    <div className="godown-items">
                      <div className="pagination-info">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
                      </div>
                      <table className="godown-table">
                        <thead>
                          <tr>
                            <th>Quantity</th>
                            <th>Received</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedItems.map((item) => (
                            <tr key={item._id}>
                              <td>
                                <strong>{item.litres} {item.unit || 'litres'}</strong>
                              </td>
                              <td>
                                {new Date(item.deployedAt).toLocaleDateString()}<br/>
                                <small>{new Date(item.deployedAt).toLocaleTimeString()}</small>
                              </td>
                              <td>
                                {item.originalProductionId ? (
                                  <span className="split-badge">Split Production</span>
                                ) : (
                                  <span className="direct-badge">Direct</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {totalPages > 1 && (
                        <div className="pagination-controls">
                          <button 
                            onClick={() => setGodownPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="page-btn"
                          >
                            ← Previous
                          </button>
                          <span className="page-indicator">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button 
                            onClick={() => setGodownPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="page-btn"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AllOrders;
