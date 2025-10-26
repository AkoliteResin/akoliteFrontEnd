// import React, { useState, useEffect } from "react";
// Keep the first (updated) component only: remove duplicate trailing content


import React, { useState, useEffect } from "react";
import axios from "axios";

function ProducedResins() {
  const [producedResins, setProducedResins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchProducedResins = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching produced resins...");
      
      const response = await axios.get("http://localhost:5000/api/produced-resins");
      console.log("API Response:", response.data);
      
      if (response.data && response.data.items) {
        setProducedResins(response.data.items);
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

  const handleProceed = async (id) => {
    if (!window.confirm("Are you sure you want to proceed with this production?")) {
      return;
    }
    try {
      setProcessing(true);
      // Mark as in process locally (optimistic). Backend endpoint can persist if available.
      try {
        await axios.post(`http://localhost:5000/api/produced-resins/${id}/proceed`);
        await fetchProducedResins();
        return;
      } catch (err) {
        // fallback to optimistic local update
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

  // Mark a production as completed (done)
  const handleComplete = async (id) => {
    if (!window.confirm("Mark this production as completed?")) return;
    try {
      setProcessing(true);
      try {
        await axios.post(`http://localhost:5000/api/produced-resins/${id}/complete`);
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
    if (!window.confirm("Are you sure you want to deploy this production?")) {
      return;
    }
    try {
      setProcessing(true);
      await axios.post(`http://localhost:5000/api/produced-resins/${id}/deploy`);
      alert("Production deployed successfully");
      fetchProducedResins();
    } catch (error) {
      console.error("Error deploying production:", error);
      alert(error.response?.data?.message || "Failed to deploy production");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this production? Materials will be returned to stock.")) {
      return;
    }
    try {
      setProcessing(true);
      await axios.delete(`http://localhost:5000/api/produced-resins/${id}`);
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
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return '#17a2b8'; // info blue
      case 'deployed': return '#28a745'; // success green
      case 'deleted': return '#dc3545'; // danger red
      default: return '#ffc107'; // warning yellow
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Produced Resins</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: "10px" }}>
            Total items: {producedResins.length}
          </div>
          {producedResins.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {producedResins.map((resin) => (
                <li key={resin._id} style={{ 
                  padding: "15px", 
                  margin: "10px 0", 
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ fontSize: "1.1em" }}>{resin.resinType}</strong>
                    <span style={{ marginLeft: "10px" }}>{resin.litres} litres</span>
                    <span style={{
                      marginLeft: "10px",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor: getStatusColor(resin.status),
                      color: resin.status === 'pending' ? '#000' : '#fff',
                      fontSize: '0.8em'
                    }}>
                      {resin.status || 'pending'}
                    </span>
                  </div>
                  <div style={{ marginBottom: "10px", fontSize: "0.9em", color: "#666" }}>
                    Produced on: {new Date(resin.producedAt).toLocaleString()}
                    {resin.proceededAt && (
                      <span style={{ marginLeft: "10px" }}>
                        • Done on: {new Date(resin.proceededAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {(resin.status !== 'deleted' && resin.status !== 'deployed' && resin.status !== 'done') && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      {/* Show Proceed when pending */}
                      {(!resin.status || resin.status === 'pending') && (
                        <button
                          onClick={() => handleProceed(resin._id)}
                          style={{
                            padding: "5px 15px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          disabled={processing}
                        >
                          Proceed
                        </button>
                      )}

                      {/* Show Completed when in process */}
                      {resin.status === 'in_process' && (
                        <button
                          onClick={() => handleComplete(resin._id)}
                          style={{
                            padding: "5px 15px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          disabled={processing}
                        >
                          Completed
                        </button>
                      )}

                      <button
                        onClick={() => handleDeploy(resin._id)}
                        style={{
                          padding: "5px 15px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        disabled={processing}
                      >
                        Deploy
                      </button>

                      <button
                        onClick={() => handleDelete(resin._id)}
                        style={{
                          padding: "5px 15px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                        disabled={processing}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No resins have been produced yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default ProducedResins;