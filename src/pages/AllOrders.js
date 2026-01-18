import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import * as XLSX from "xlsx";
import "./AllOrders.css";

function AllOrders() {
  const [resins, setResins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedResin, setExpandedResin] = useState(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  useEffect(() => {
    fetchDispatchedOrders();
  }, []);

  const fetchDispatchedOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/dispatched/all");
      if (res.data?.success) {
        setResins(res.data.data);
        setError(null);
      } else {
        setError("Failed to load dispatched orders");
      }
    } catch (err) {
      console.error("Error fetching dispatched orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setDownloadingExcel(true);
      
      const workbook = XLSX.utils.book_new();
      
      // Create a summary sheet
      const summaryData = resins.map(resin => ({
        'Resin Type': resin.resinType,
        'Total Produced': resin.totalProduced,
        'Unit': resin.totalProducedUnit,
        'No. of Orders': resin.orderCount,
        'Clients': resin.clients.map(c => c.clientName).join(', ')
      }));
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      
      // Create detailed sheets for each resin
      resins.forEach(resin => {
        const detailedData = resin.orders.map(order => ({
          'Dispatch Date': order.dispatchTime ? new Date(order.dispatchTime).toLocaleDateString() : '-',
          'Dispatch Time': order.dispatchTime ? new Date(order.dispatchTime).toLocaleTimeString() : '-',
          'Client Name': order.clientName,
          'Ordered Qty': order.orderedQty,
          'Unit': order.unit,
          'Ordered Time': order.orderedTime ? new Date(order.orderedTime).toLocaleString() : '-',
          'Produced At': order.producedAt ? new Date(order.producedAt).toLocaleDateString() : '-',
          'Order Number': order.orderNumber || '-'
        }));
        
        const sheet = XLSX.utils.json_to_sheet(detailedData);
        // Set column widths
        sheet['!cols'] = [
          { wch: 15 },
          { wch: 12 },
          { wch: 20 },
          { wch: 12 },
          { wch: 10 },
          { wch: 20 },
          { wch: 15 },
          { wch: 12 }
        ];
        
        XLSX.utils.book_append_sheet(workbook, sheet, resin.resinType.substring(0, 31));
      });
      
      // Generate file name with timestamp
      const fileName = `AllOrders_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      alert("Failed to export Excel file");
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="all-orders-container">
      <div className="all-orders-header">
        <h2>📊 All Dispatched Orders</h2>
        <button 
          className="excel-export-btn"
          onClick={handleExportExcel}
          disabled={downloadingExcel || resins.length === 0}
        >
          {downloadingExcel ? "⏳ Downloading..." : "📥 Download Excel"}
        </button>
      </div>

      {loading && <div className="loading">Loading dispatched orders...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && resins.length === 0 && (
        <div className="empty-state">No dispatched orders found.</div>
      )}

      {!loading && !error && resins.length > 0 && (
        <div className="resins-accordion">
          {resins.map(resin => {
            const isExpanded = expandedResin === resin.resinType;
            
            return (
              <div className="resin-accordion-item" key={resin.resinType}>
                <button 
                  className="resin-accordion-header"
                  onClick={() => setExpandedResin(isExpanded ? null : resin.resinType)}
                >
                  <div className="resin-header-left">
                    <span className="resin-icon">🧪</span>
                    <span className="resin-name">{resin.resinType}</span>
                  </div>
                  <div className="resin-header-right">
                    <div className="total-produced">
                      <span className="label">Total:</span>
                      <span className="value">{resin.totalProduced} {resin.totalProducedUnit}</span>
                    </div>
                    <div className="order-count">
                      <span className="label">Orders:</span>
                      <span className="value">{resin.orderCount}</span>
                    </div>
                    <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="resin-accordion-body">
                    {/* Clients Section */}
                    <div className="clients-section">
                      <h4>👥 Clients Dispatched To</h4>
                      <div className="clients-list">
                        {resin.clients.map(client => (
                          <div className="client-chip" key={client.clientName}>
                            <span className="client-name">{client.clientName}</span>
                            <span className="client-qty">{client.totalDispatched} {client.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className="orders-section">
                      <h4>📦 Dispatch Details (Date-wise)</h4>
                      <div className="orders-table-wrapper">
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>📅 Dispatch Date & Time</th>
                              <th>Client</th>
                              <th>Qty</th>
                              <th>Unit</th>
                              <th>Ordered Time</th>
                              <th>Produced Date</th>
                              <th>Order #</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resin.orders.map(order => (
                              <tr key={order._id}>
                                <td className="dispatch-datetime">
                                  <div className="dispatch-date">{order.dispatchTime ? new Date(order.dispatchTime).toLocaleDateString() : '-'}</div>
                                  <div className="dispatch-time">{order.dispatchTime ? new Date(order.dispatchTime).toLocaleTimeString() : '-'}</div>
                                </td>
                                <td className="client-td">{order.clientName}</td>
                                <td className="qty-td">{order.orderedQty}</td>
                                <td>{order.unit}</td>
                                <td>{order.orderedTime ? new Date(order.orderedTime).toLocaleString() : '-'}</td>
                                <td>{order.producedAt ? new Date(order.producedAt).toLocaleDateString() : '-'}</td>
                                <td>{order.orderNumber || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllOrders;
