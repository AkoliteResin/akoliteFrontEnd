// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import RawMaterials from "./pages/RawMaterials";
import RawMaterialHistory from "./pages/RawMaterialHistory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/raw-materials/history" element={<RawMaterialHistory />} />
        </Routes>
      </Layout>

      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  );
}

export default App;
