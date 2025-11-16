import React, { useState, useEffect } from "react";
import axios from "axios";
import ResinCalculator from "./ResinCalculator";
import "./RawMaterials.css";


function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [showResinModal, setShowResinModal] = useState(false);
  const [newResin, setNewResin] = useState({
    name: "",
    rawMaterials: []
  });
  const [availableRawMaterials, setAvailableRawMaterials] = useState([]);
  const [showAddRawMaterialInput, setShowAddRawMaterialInput] = useState(false);
  const [newRawMaterialName, setNewRawMaterialName] = useState("");


  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/raw-materials");
      setMaterials(res.data);
      setAvailableRawMaterials(res.data.map(m => m.name));
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchMaterials();
  }, []);


  const handleAdd = async () => {
    if (!selectedMaterial || !addQuantity) return alert("Select material & quantity");
    try {
      await axios.post("http://localhost:5000/api/raw-materials/add", {
        name: selectedMaterial,
        quantity: Number(addQuantity),
      });
      setAddQuantity("");
      fetchMaterials();
      alert("✅ Quantity added successfully!");
    } catch (err) {
      console.error(err);
    }
  };


  const handleModify = async () => {
    if (!selectedMaterial || !modifyQuantity) return alert("Select material & new quantity");
    try {
      await axios.put("http://localhost:5000/api/raw-materials/modify", {
        name: selectedMaterial,
        newQuantity: Number(modifyQuantity),
      });
      setModifyQuantity("");
      fetchMaterials();
      alert("✅ Quantity modified successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRawMaterial = () => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { name: "", percentage: "" }]
    }));
  };

  const handleRemoveRawMaterial = (index) => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((_, i) => i !== index)
    }));
  };

  const handleRawMaterialChange = (index, field, value) => {
    setNewResin(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((rm, i) => 
        i === index ? { ...rm, [field]: value } : rm
      )
    }));
  };

  const handleSaveResin = async () => {
    if (!newResin.name.trim()) {
      alert("Please enter a resin name");
      return;
    }
    if (newResin.rawMaterials.length === 0) {
      alert("Please add at least one raw material");
      return;
    }
    
    // Validate all raw materials have name and percentage
    const invalid = newResin.rawMaterials.some(rm => !rm.name || !rm.percentage || Number(rm.percentage) <= 0);
    if (invalid) {
      alert("Please fill in all raw material names and percentages");
      return;
    }

    // Calculate total percentage
    const totalPercentage = newResin.rawMaterials.reduce((sum, rm) => sum + Number(rm.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert(`Total percentage must equal 100%. Current total: ${totalPercentage.toFixed(2)}%`);
      return;
    }

    console.log("Saving resin configuration:", newResin);
    alert("✅ Resin configuration saved! (Note: This is a placeholder - backend implementation needed)");
    
    // Reset and close modal
    setNewResin({ name: "", rawMaterials: [] });
    setShowResinModal(false);
  };

  const handleCloseModal = () => {
    setShowResinModal(false);
    setNewResin({ name: "", rawMaterials: [] });
    setShowAddRawMaterialInput(false);
    setNewRawMaterialName("");
  };

  const handleAddNewRawMaterial = () => {
    if (!newRawMaterialName.trim()) {
      alert("Please enter a raw material name");
      return;
    }
    
    // Check if already exists
    if (availableRawMaterials.includes(newRawMaterialName.trim())) {
      alert("This raw material already exists");
      return;
    }

    setAvailableRawMaterials([...availableRawMaterials, newRawMaterialName.trim()]);
    setNewRawMaterialName("");
    setShowAddRawMaterialInput(false);
    alert("✅ Raw material added to the list!");
  };


  return (
    <div className="raw-materials-container">
      <h2>🧱 Raw Materials Management</h2>

      <div className="controls-card">
        <h3>📊 Update Inventory</h3>
        <div className="controls-grid">
          <div className="form-group select-material">
            <label>Select Material <span className="required">*</span></label>
            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
              <option value="">-- Choose a material --</option>
              {materials.map((mat) => (
                <option key={mat.name} value={mat.name}>{mat.name}</option>
              ))}
            </select>
          </div>

          <div className="action-group">
            <div className="form-group">
              <label>Add Quantity</label>
              <input 
                type="number" 
                placeholder="Enter amount to add" 
                value={addQuantity} 
                onChange={(e) => setAddQuantity(e.target.value)} 
              />
            </div>
            <button className="btn-add" onClick={handleAdd}>➕ Add Stock</button>
          </div>

          <div className="action-group">
            <div className="form-group">
              <label>Set Total Quantity</label>
              <input 
                type="number" 
                placeholder="Enter new total" 
                value={modifyQuantity} 
                onChange={(e) => setModifyQuantity(e.target.value)} 
              />
            </div>
            <button className="btn-modify" onClick={handleModify}>✏️ Modify Total</button>
          </div>
        </div>
      </div>

      <div className="materials-table-card">
        <h3>📦 Current Inventory</h3>
        <div className="table-wrapper">
          <table className="materials-table">
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Total Quantity (kg/L)</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => (
                <tr key={mat.name}>
                  <td><strong>{mat.name}</strong></td>
                  <td className="quantity-cell">
                    <span className={`quantity-badge ${mat.totalQuantity < 100 ? 'low' : mat.totalQuantity < 500 ? 'medium' : 'high'}`}>
                      {mat.totalQuantity ?? 0}
                    </span>
                  </td>
                  <td>{new Date(mat.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resin Calculator with automatic refresh */}
      <div className="calculator-section">
        <ResinCalculator onProduced={fetchMaterials} showProduce={false} />
      </div>

      {/* Floating Add Button */}
      <button 
        className="floating-add-btn" 
        onClick={() => setShowResinModal(true)}
        title="Add New Resin Configuration"
      >
        ➕
      </button>

      {/* Add Resin Modal */}
      {showResinModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content resin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add New Resin Configuration</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Resin Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Epoxy Resin, Alkyd Resin"
                  value={newResin.name}
                  onChange={(e) => setNewResin({ ...newResin, name: e.target.value })}
                  className="resin-name-input"
                />
              </div>

              <div className="raw-materials-section">
                <div className="section-header">
                  <h4>Raw Materials & Percentages</h4>
                  <button className="btn-add-material" onClick={handleAddRawMaterial}>
                    ➕ Add Material
                  </button>
                </div>

                {newResin.rawMaterials.length === 0 ? (
                  <div className="empty-state">
                    <p>No raw materials added yet. Click "Add Material" to get started.</p>
                  </div>
                ) : (
                  <div className="materials-list">
                    {newResin.rawMaterials.map((rm, index) => (
                      <div key={index} className="material-row">
                        <div className="material-number">{index + 1}</div>
                        <div className="material-inputs">
                          <select
                            value={rm.name}
                            onChange={(e) => handleRawMaterialChange(index, 'name', e.target.value)}
                            className="material-select"
                          >
                            <option value="">-- Select Material --</option>
                            {availableRawMaterials.map((mat) => (
                              <option key={mat} value={mat}>{mat}</option>
                            ))}
                          </select>
                          <div className="percentage-input-group">
                            <input
                              type="number"
                              placeholder="0"
                              value={rm.percentage}
                              onChange={(e) => handleRawMaterialChange(index, 'percentage', e.target.value)}
                              min="0"
                              max="100"
                              step="0.1"
                              className="percentage-input"
                            />
                            <span className="percentage-symbol">%</span>
                          </div>
                        </div>
                        <button 
                          className="btn-remove-material" 
                          onClick={() => handleRemoveRawMaterial(index)}
                          title="Remove this material"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Raw Material Input */}
                {showAddRawMaterialInput ? (
                  <div className="add-raw-material-section">
                    <div className="add-raw-material-input-group">
                      <input
                        type="text"
                        placeholder="Enter new raw material name"
                        value={newRawMaterialName}
                        onChange={(e) => setNewRawMaterialName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddNewRawMaterial()}
                        className="new-raw-material-input"
                        autoFocus
                      />
                      <button className="btn-save-raw-material" onClick={handleAddNewRawMaterial}>
                        ✓ Save
                      </button>
                      <button 
                        className="btn-cancel-raw-material" 
                        onClick={() => {
                          setShowAddRawMaterialInput(false);
                          setNewRawMaterialName("");
                        }}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="btn-add-new-raw-material" 
                    onClick={() => setShowAddRawMaterialInput(true)}
                  >
                    ➕ Add New Raw Material
                  </button>
                )}

                {newResin.rawMaterials.length > 0 && (
                  <div className="total-percentage">
                    <strong>Total:</strong>
                    <span className={`total-value ${Math.abs(newResin.rawMaterials.reduce((sum, rm) => sum + (Number(rm.percentage) || 0), 0) - 100) < 0.01 ? 'valid' : 'invalid'}`}>
                      {newResin.rawMaterials.reduce((sum, rm) => sum + (Number(rm.percentage) || 0), 0).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-save" onClick={handleSaveResin}>💾 Save Resin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default RawMaterials;
