import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Grid, Typography, AppBar, Toolbar, Box } from "@mui/material";

import SectionCard from "./components/SectionCard";
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
      icon: "📦",
    },
    {
      title: "Sellers details",
      description: "Manage client orders and godown products.",
      link: "/sellers-details",
      icon: "👥",
    },
    {
      title: "Products Produced",
      description: "See finished resin products ready for sale.",
      link: "/produced-resins",
      icon: "⚗️",
    },
    {
      title: "Orders for the Future",
      description: "Plan and manage upcoming resin orders.",
      link: "/future-orders",
      icon: "🗓️",
    },
    {
      title: "All Orders",
      description: "See totals by resin and client.",
      link: "/all-orders",
      icon: "📋",
    },
    {
      title: "Billing",
      description: "View invoices and payment records.",
      link: "/billing",
      icon: "💳",
    },
    {
      title: "Billing History",
      description: "View all past billing records and invoices.",
      link: "/billing-history",
      icon: "📜",
    },
    {
      title: "Day's Summary",
      description: "Get daily insights on production and sales.",
      link: "/day-summary",
      icon: "📊",
    },
    {
      title: "Daily Expenses",
      description: "Track HR, Labour, and Employee expenses.",
      link: "/expenses",
      icon: "💰",
    },
    {
      title: "Location Report",
      description: "View orders by district and state.",
      link: "/location-report",
      icon: "📍",
    },
    {
      title: "Resin Calculator",
      description: "Calculate resin requirements for orders.",
      link: "/resin-calculator",
      icon: "🧮",
    },
    {
      title: "Logistics",
      description: "Monitor transportation and delivery updates.",
      link: null, // Coming soon
      icon: "🚚",
    },
  ];

  const HomePage = () => (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            AKOLITE Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 2, fontWeight: "medium" }}
        >
          Operational Management
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          align="center"
          sx={{ mb: 5 }}
        >
          Monitor and manage your daily operations in one place.
        </Typography>
        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <SectionCard
                title={section.title}
                description={section.description}
                link={section.link}
                icon={section.icon}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resin-calculator" element={<ResinCalculator />} />
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/produced-resins" element={<ProducedResins />} />
        <Route path="/future-orders" element={<OrderForFuture />} />
        <Route path="/all-orders" element={<AllOrders />} />
        <Route path="/sellers-details" element={<SellersDetails />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/billing-history" element={<BillingHistory />} />
        <Route path="/day-summary" element={<DaySummary />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/location-report" element={<LocationReport />} />
      </Routes>
    </Router>
  );
}

export default App;



