import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ResinCalculator.css";


function ResinCalculator({ onProduced }) {
  const [resinType, setResinType] = useState("");
  const [litres, setLitres] = useState("");
  const [result, setResult] = useState(null);
  const [resinData, setResinData] = useState([]);


  // Fetch resin definitions (or use fallback static data)
  useEffect(() => {
    const fetchResinData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/resins"); // optional API
        setResinData(res.data);
      } catch {
        setResinData([
          { name: "Epoxy Resin", raw_materials: [{ name: "Bisphenol-A", ratio: 1 }, { name: "Epichlorohydrin", ratio: 10 }, { name: "NaOH", ratio: 0.2 }] },
          { name: "Alkyd Resin", raw_materials: [{ name: "Phthalic Anhydride", ratio: 28 }, { name: "Glycerol", ratio: 12 }, { name: "Linseed Oil", ratio: 60 }] },
          { name: "Acrylic Resin", raw_materials: [{ name: "MMA", ratio: 70 }, { name: "BA", ratio: 25 }, { name: "Styrene", ratio: 5 }, { name: "Initiator", ratio: 1 }] },
          { name: "Phenolic Resin", raw_materials: [{ name: "Phenol", ratio: 1 }, { name: "Formaldehyde", ratio: 2 }, { name: "Catalyst", ratio: 0.01 }] },
        ]);
      }
    };
    fetchResinData();
  }, []);


  // Calculate without modifying stock
  const handleCalculate = () => {
    if (!resinType || !litres) return alert("Please fill all fields.");


    const resin = resinData.find((r) => r.name === resinType);
    if (!resin) return alert("Invalid resin type");


    const totalRatio = resin.raw_materials.reduce((sum, r) => sum + r.ratio, 0);


    const output = resin.raw_materials.map((r) => {
      const percentage = (r.ratio / totalRatio) * 100;
      const volume = (percentage / 100) * litres;
      return { material: r.name, percentage: percentage.toFixed(2), volume: volume.toFixed(2) };
    });


    setResult(output);
  };


  // Produce resin (subtract stock)
  const handleProduce = async () => {
    if (!resinType || !litres) return alert("Please fill all fields.");


    try {
      const res = await axios.post("http://localhost:5000/api/produce-resin", {
        resinType,
        litres: Number(litres),
      });


      setResult(
        res.data.requiredMaterials.map((r) => ({
          material: r.material,
          volume: r.requiredQty.toFixed(2),
          percentage: ((r.requiredQty / litres) * 100).toFixed(2),
        }))
      );


      onProduced?.(); // refresh raw materials table
      alert("✅ Resin produced successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error producing resin");
      console.error(err.response?.data || err);
    }
  };


  return (
    <div className="calculator-container">
      <h1>🧪 Resin Production Calculator</h1>


      <div className="form">
        <label>Resin Type:</label>
        <select value={resinType} onChange={(e) => setResinType(e.target.value)}>
          <option value="">Select</option>
          {resinData.map((r) => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>


        <label>Litres to Produce:</label>
        <input type="number" value={litres} onChange={(e) => setLitres(e.target.value)} />


        <button onClick={handleCalculate}>Calculate</button>
        <button onClick={handleProduce}>Produce</button>
      </div>


      {result && (
        <div className="result">
          <h2>Required Raw Materials:</h2>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Percentage (%)</th>
                <th>Litres</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r, i) => (
                <tr key={i}>
                  <td>{r.material}</td>
                  <td>{r.percentage}</td>
                  <td>{r.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


export default ResinCalculator;


