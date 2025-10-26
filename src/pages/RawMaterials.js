import React, { useState, useEffect } from "react";
import axios from "axios";
import ResinCalculator from "./ResinCalculator";


function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");


  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/raw-materials");
      setMaterials(res.data);
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


  return (
    <div style={{ padding: "20px" }}>
      <h2>Raw Materials</h2>


      <div style={{ marginBottom: "20px" }}>
        <label>Select Material: </label>
        <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
          <option value="">-- Choose a material --</option>
          {materials.map((mat) => (
            <option key={mat.name} value={mat.name}>{mat.name}</option>
          ))}
        </select>


        <input type="number" placeholder="Add quantity" value={addQuantity} onChange={(e) => setAddQuantity(e.target.value)} />
        <button onClick={handleAdd}>Add</button>


        <input type="number" placeholder="Modify total" value={modifyQuantity} onChange={(e) => setModifyQuantity(e.target.value)} />
        <button onClick={handleModify}>Modify</button>
      </div>


      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Total Quantity (kg/L)</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((mat) => (
            <tr key={mat.name}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{mat.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>{mat.totalQuantity ?? 0}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{new Date(mat.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Resin Calculator with automatic refresh */}
      <div style={{ marginTop: "40px" }}>
        <ResinCalculator onProduced={fetchMaterials} />
      </div>
    </div>
  );
}


export default RawMaterials;
