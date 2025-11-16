import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./ResinCalculator.css";


function ResinCalculator({ onProduced, showProduce = true }) {
  const location = useLocation();
  const [resinType, setResinType] = useState(location.state?.resinType || "");
  const [litres, setLitres] = useState(location.state?.litres || "");
  const [unit, setUnit] = useState(location.state?.unit || "litres");
  const orderId = location.state?.orderId || null;
  const [result, setResult] = useState(null);
  const [resinData, setResinData] = useState([]);
  const isLocked = Boolean(orderId); // lock inputs when coming from Orders
  const [producing, setProducing] = useState(false);
  const [alreadyProduced, setAlreadyProduced] = useState(false);


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

  // If opened from an order, check if it's already produced and disable Produce
  useEffect(() => {
    const checkAlreadyProduced = async () => {
      if (!orderId) return;
      try {
        const res = await axios.get("http://localhost:5000/api/produced-resins");
        const items = res.data?.items || [];
        const exists = items.some(i => i.fromOrderId && i.fromOrderId === orderId);
        if (exists) setAlreadyProduced(true);
      } catch (err) {
        console.warn('Failed to check existing production for order', err);
      }
    };
    checkAlreadyProduced();
  }, [orderId]);


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
      setProducing(true);
      const res = await axios.post("http://localhost:5000/api/produce-resin", {
        resinType,
        litres: Number(litres),
        unit,
        orderId,
      });

      setResult(
        res.data.requiredMaterials.map((r) => ({
          material: r.material,
          volume: r.requiredQty.toFixed(2),
          percentage: ((r.requiredQty / litres) * 100).toFixed(2),
        }))
      );

      onProduced?.(); // refresh raw materials table
      
      if (orderId) {
        setAlreadyProduced(true); // disable produce for this order
        alert("✅ Resin produced successfully!\nCheck Produced Resins → Active Orders to proceed/complete/dispatch.");
      } else {
        alert("✅ Resin produced successfully!\nCheck Produced Resins → Active Orders.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error producing resin";
      alert(errorMsg);
      console.error(err.response?.data || err);
    }
    finally {
      setProducing(false);
    }
  };


  return (
    <div className="calculator-container">
      <h1>🧪 Resin Production Calculator</h1>


      <div className="form">
        <label>Resin Type:</label>
        <select
          value={resinType}
          onChange={(e) => setResinType(e.target.value)}
          disabled={isLocked}
          title={isLocked ? "Locked for this order" : undefined}
        >
          <option value="">Select</option>
          {resinData.map((r) => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>

        <label>Quantity to Produce ({unit}):</label>
        <input
          type="number"
          value={litres}
          onChange={(e) => setLitres(e.target.value)}
          disabled={isLocked}
          title={isLocked ? "Locked for this order" : undefined}
        />

        <label>Unit:</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          disabled={isLocked}
          title={isLocked ? "Locked for this order" : undefined}
        >
          <option value="litres">Litres</option>
          <option value="kgs">Kgs</option>
          <option value="pounds">Pounds</option>
        </select>


        <button onClick={handleCalculate}>Calculate</button>
        {showProduce && (
          <button onClick={handleProduce} disabled={producing || (isLocked && alreadyProduced)}>
            {producing ? 'Producing…' : (isLocked && alreadyProduced ? 'Already Produced' : 'Produce')}
          </button>
        )}
      </div>


      {result && (
        <div className="result">
          <h2>Required Raw Materials:</h2>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Percentage (%)</th>
                <th>{unit.charAt(0).toUpperCase() + unit.slice(1)}</th>
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


