import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container, Grid, Typography, Box, Paper } from "@mui/material";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import SectionCard from "./components/SectionCard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import ResinCalculator from "./pages/ResinCalculator";
import RawMaterials from "./pages/RawMaterials";
import Production from "./pages/Production";
import ProduceHub from "./pages/ProduceHub";
import OrderForFuture from "./pages/OrderForFuture";
import AllOrders from "./pages/AllOrders";
import ClientInactivity from "./pages/ClientInactivity";
import ClientsDetails from "./pages/ClientsDetails";
import Sellers from "./pages/Sellers";
import Billing from "./pages/Billing";
import BillingHistory from "./pages/BillingHistory";
import DaySummary from "./pages/DaySummary";
import Expenses from "./pages/Expenses";
import LocationReport from "./pages/LocationReport";
import { menuItems } from "./utils/menuItems";
import Sales from "./pages/Sales";
import PaymentsDue from "./pages/PaymentsDue";
import GeneralManager from "./pages/GeneralManager";
import PurchaseReport from "./pages/PurchaseReport";
import StoreManager from "./pages/StoreManager";
import ProductionTeam from "./pages/ProductionTeam";
import Account from "./pages/Account";
import Collection from "./pages/Collection";
import PaymentCollected from "./pages/PaymentCollected";
import ClientPayments from "./pages/ClientPayments";
import "./App.css";

const HomePage = () => (
  <Container maxWidth="xl">
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 800, color: 'text.primary' }}
      >
        Dashboard Overview
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ maxWidth: 800 }}
      >
        Welcome to the Akolite Admin Dashboard. Select a module below to get started.
      </Typography>
    </Box>

    {/* Quick Stats Row (Dummy Data for Visuals) */}
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {[
        { label: 'Pending Orders', value: '12', color: '#ef4444' },
        { label: 'Production Today', value: '2,500 L', color: '#10b981' },
        { label: 'Active Batches', value: '5', color: '#f59e0b' },
        { label: 'Total Clients', value: '48', color: '#3b82f6' },
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>

    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
      Quick Access
    </Typography>
    <Grid container spacing={3}>
      {menuItems.map((section, index) => (
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
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<Signup onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/verify-otp" element={<VerifyOTP onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} user={user} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produce" element={<ProtectedRoute userRole={user?.role} path="/produce"><ProduceHub /></ProtectedRoute>} />
          <Route path="/resin-calculator" element={<ProtectedRoute userRole={user?.role} path="/resin-calculator"><ResinCalculator /></ProtectedRoute>} />
          <Route path="/resin-production" element={<ProtectedRoute userRole={user?.role} path="/resin-production"><ResinCalculator /></ProtectedRoute>} />
          <Route path="/raw-materials" element={<ProtectedRoute userRole={user?.role} path="/raw-materials"><RawMaterials /></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute userRole={user?.role} path="/production"><Production /></ProtectedRoute>} />
          <Route path="/future-orders" element={<ProtectedRoute userRole={user?.role} path="/future-orders"><OrderForFuture /></ProtectedRoute>} />
          <Route path="/all-orders" element={<ProtectedRoute userRole={user?.role} path="/all-orders"><AllOrders /></ProtectedRoute>} />
          <Route path="/client-inactivity" element={<ProtectedRoute userRole={user?.role} path="/client-inactivity"><ClientInactivity /></ProtectedRoute>} />
          <Route path="/clients-details" element={<ProtectedRoute userRole={user?.role} path="/clients-details"><ClientsDetails /></ProtectedRoute>} />
          <Route path="/sellers" element={<ProtectedRoute userRole={user?.role} path="/sellers"><Sellers /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute userRole={user?.role} path="/billing"><Billing /></ProtectedRoute>} />
          <Route path="/billing-history" element={<ProtectedRoute userRole={user?.role} path="/billing-history"><BillingHistory /></ProtectedRoute>} />
          <Route path="/day-summary" element={<ProtectedRoute userRole={user?.role} path="/day-summary"><DaySummary /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute userRole={user?.role} path="/expenses"><Expenses /></ProtectedRoute>} />
          <Route path="/location-report" element={<ProtectedRoute userRole={user?.role} path="/location-report"><LocationReport /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute userRole={user?.role} path="/sales"><Sales /></ProtectedRoute>} />
          <Route path="/client-payments" element={<ProtectedRoute userRole={user?.role} path="/client-payments"><ClientPayments /></ProtectedRoute>} />
          <Route path="/payments-due" element={<ProtectedRoute userRole={user?.role} path="/payments-due"><PaymentsDue /></ProtectedRoute>} />
          <Route path="/general-manager" element={<ProtectedRoute userRole={user?.role} path="/general-manager"><GeneralManager /></ProtectedRoute>} />
          <Route path="/purchase-report" element={<ProtectedRoute userRole={user?.role} path="/purchase-report"><PurchaseReport /></ProtectedRoute>} />
          <Route path="/store-manager" element={<ProtectedRoute userRole={user?.role} path="/store-manager"><StoreManager /></ProtectedRoute>} />
          <Route path="/production-team" element={<ProtectedRoute userRole={user?.role} path="/production-team"><ProductionTeam /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute userRole={user?.role} path="/account"><Account /></ProtectedRoute>} />
          <Route path="/collection" element={<ProtectedRoute userRole={user?.role} path="/collection"><Collection /></ProtectedRoute>} />
          <Route path="/payment-collected" element={<ProtectedRoute userRole={user?.role} path="/payment-collected"><PaymentCollected /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;




