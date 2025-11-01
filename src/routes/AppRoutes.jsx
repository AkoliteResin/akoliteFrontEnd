// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import PossibleRawMaterialsList from "../pages/PossibleRawMaterials/PossibleRawMaterialsList";
import AddPossibleRawMaterial from "../pages/PossibleRawMaterials/AddPossibleRawMaterial";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/possible-raw-materials" element={<PossibleRawMaterialsList />} />
      <Route path="/possible-raw-materials/add" element={<AddPossibleRawMaterial />} />
    </Routes>
  );
}

export default AppRoutes;
