import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./LocationReport.css";

const LocationReport = () => {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [filterState, setFilterState] = useState("");
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    fetchLocationReport();
  }, []);

  const fetchLocationReport = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/reports/location-orders");
      setLocationData(response.data);
      
      // Extract unique states for filter
      const states = [...new Set(response.data.map(loc => loc.state))].filter(Boolean).sort();
      setAvailableStates(states);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching location report:", err);
      setError("Failed to fetch location report");
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    setExpandedLocation(expandedLocation === index ? null : index);
  };

  const filteredData = filterState
    ? locationData.filter(loc => loc.state === filterState)
    : locationData;

  const totalStats = filteredData.reduce(
    (acc, loc) => ({
      locations: acc.locations + 1,
      clients: acc.clients + (Number(loc.clientCount) || 0),
      orders: acc.orders + (Number(loc.totalOrders) || 0),
      litres: acc.litres + (Number(loc.totalLitres) || 0)
    }),
    { locations: 0, clients: 0, orders: 0, litres: 0 }
  );

  if (loading) {
    return <div className="location-report-container"><p>Loading location report...</p></div>;
  }

  if (error) {
    return <div className="location-report-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="location-report-container">
      <div className="location-header">
        <h1>Location-Wise Orders Report</h1>
        <p>View orders aggregated by district and state</p>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-value">{totalStats.locations}</div>
          <div className="stat-label">Total Locations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStats.clients}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStats.orders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStats.litres.toFixed(2)}</div>
          <div className="stat-label">Total Litres</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <label>Filter by State:</label>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          <option value="">All States</option>
          {availableStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {filterState && (
          <button className="clear-filter" onClick={() => setFilterState("")}>
            Clear Filter
          </button>
        )}
      </div>

      {/* Location Cards */}
      <div className="location-grid">
        {filteredData.length === 0 ? (
          <p className="no-data">No location data available</p>
        ) : (
          filteredData.map((location, index) => (
            <div key={index} className="location-card">
              <div className="location-card-header" onClick={() => toggleExpand(index)}>
                <div className="location-title">
                  <h3>{location.district}</h3>
                  <span className="state-badge">{location.state}</span>
                </div>
                <button className="expand-btn">
                  {expandedLocation === index ? "▼" : "▶"}
                </button>
              </div>

              <div className="location-metrics">
                <div className="metric">
                  <span className="metric-label">Clients:</span>
                  <span className="metric-value">{location.clientCount}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Orders:</span>
                  <span className="metric-value">{location.totalOrders}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Total Litres:</span>
                  <span className="metric-value">{Number(location.totalLitres || 0).toFixed(2)}</span>
                </div>
              </div>

              {expandedLocation === index && (
                <div className="location-details">
                  {/* Resin Breakdown */}
                  <div className="detail-section">
                    <h4>Resin Breakdown</h4>
                    {Object.keys(location.resinBreakdown).length > 0 ? (
                      <table className="breakdown-table">
                        <thead>
                          <tr>
                            <th>Resin Type</th>
                            <th>Litres</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(location.resinBreakdown).map(([resin, litres]) => (
                            <tr key={resin}>
                              <td>{resin}</td>
                              <td>{Number(litres || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data-small">No resin data</p>
                    )}
                  </div>

                  {/* Clients List */}
                  <div className="detail-section">
                    <h4>Clients ({location.clientCount})</h4>
                    {location.clients.length > 0 ? (
                      <ul className="clients-list">
                        {location.clients.map((client, idx) => (
                          <li key={idx}>{client}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data-small">No clients</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LocationReport;
