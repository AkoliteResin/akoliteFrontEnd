

import React from "react";
import SectionCard from "./components/SectionCard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResinCalculator from "./pages/ResinCalculator";
import RawMaterials from "./pages/RawMaterials";
import ProducedResins from "./pages/ProducedResins";
import OrderForFuture from "./pages/OrderForFuture";
import AllOrders from "./pages/AllOrders";
import SellersDetails from "./pages/SellersDetails";
import Billing from "./pages/Billing";
import BillingHistory from "./pages/BillingHistory";
import DaySummary from "./pages/DaySummary";
import Expenses from "./pages/Expenses";
import LocationReport from "./pages/LocationReport";
import "./App.css";






function App() {
  const sections = [
    {
      title: "Raw Materials",
      description: "View and manage raw material stock.",
      link: "/raw-materials",
    },
    // {
    //   title: "Resin Production",
    //   description: "Track resin manufacturing process.",
    //   link: "/resin-production",
    // },
    {
      title: "Sellers details",
      description:
        "Track the seller/client that gives the order + the products in the godown.",
      link: "/sellers-details",
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
      link: "/future-orders",
    },
    {
      title: "All Orders",
      description: "See totals by resin and client.",
      link: "/all-orders",
    },
    {
      title: "Billing",
      description: "View invoices and payment records.",
      link: "/billing",
    },
    {
      title: "Billing History",
      description: "View all past billing records and invoices.",
      link: "/billing-history",
    },
    {
      title: "Day's Summary",
      description: "Get daily insights on production and sales.",
      link: "/day-summary",
    },
    {
      title: "Daily Expenses",
      description: "Track HR, Labour, and Employee expenses.",
      link: "/expenses",
    },
    {
      title: "Location Report",
      description: "View orders by district and state.",
      link: "/location-report",
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


        {/* 📦 Produced Resins List */}
        <Route path="/produced-resins" element={<ProducedResins />} />

  {/* 📅 Orders for Future */}
        <Route path="/future-orders" element={<OrderForFuture />} />

  {/* 📚 All Orders Aggregation */}
  <Route path="/all-orders" element={<AllOrders />} />

  {/* 👥 Sellers/Clients Details */}
  <Route path="/sellers-details" element={<SellersDetails />} />

  {/* 🧾 Billing */}
  <Route path="/billing" element={<Billing />} />
  {/* 📜 Billing History */}
  <Route path="/billing-history" element={<BillingHistory />} />
  {/* 📊 Day's Summary */}
  <Route path="/day-summary" element={<DaySummary />} />
  {/* 💰 Daily Expenses */}
  <Route path="/expenses" element={<Expenses />} />
  {/* 📍 Location Report */}
  <Route path="/location-report" element={<LocationReport />} />
      </Routes>
    </Router>
  );
}


export default App;



