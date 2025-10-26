

import React from "react";
import SectionCard from "./components/SectionCard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResinCalculator from "./pages/ResinCalculator";
import RawMaterials from "./pages/RawMaterials";
import ProducedResins from "./pages/ProducedResins";
import "./App.css";






function App() {
  const sections = [
    {
      title: "Raw Materials",
      description: "View and manage raw material stock.",
      link: "/raw-materials",
    },
    {
      title: "Resin Production",
      description: "Track resin manufacturing process.",
      link: "/resin-production",
    },
    {
      title: "Sellers details",
      description:
        "Track the seller/client that gives the order + the products in the godown.",
    },
    {
      title: "Products Produced",
      description: "See finished resin products ready for sale.",
      link: "/produced-resins",
    },
    {
      title: "Logistics",
      description: "Monitor transportation and delivery updates.",
    },
    {
      title: "Orders for the Future",
      description: "Plan and manage upcoming resin orders.",
    },
    {
      title: "Billing",
      description: "View invoices and payment records.",
    },
    {
      title: "Day’s Summary",
      description: "Get daily insights on production and sales.",
    },
  ];


  return (
    <Router>
      <Routes>
        {/* 🏠 Dashboard (Home Page) */}
        <Route
          path="/"
          element={
            <div className="app-container">
              <header className="header">
                <h1>AKOLITE</h1>
                <p>Monitor and manage your daily operations in one place</p>
               
              </header>


              <div className="sections-grid">
                {sections.map((sec, index) => (
                  <SectionCard
                    key={index}
                    title={sec.title}
                    description={sec.description}
                    link={sec.link}
                  />
                ))}
              </div>
            </div>
          }
        />


        {/* ⚗️ Resin Calculator */}
        <Route path="/resin-production" element={<ResinCalculator />} />


        {/* 🧱 Raw Materials Management */}
        <Route path="/raw-materials" element={<RawMaterials />} />


        <Route path="/produced-resin" element={<ProducedResins />} />
      </Routes>
    </Router>
  );
}


export default App;



