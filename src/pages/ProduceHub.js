import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ListAltIcon from "@mui/icons-material/ListAlt";
import OrderForFuture from "./OrderForFuture";
import AllOrders from "./AllOrders";
import Production from "./Production";

function ProduceHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = useMemo(
    () => [
      {
        label: "📋 Orders",
        icon: <EventIcon />,
        component: (
          <Box sx={{ mt: 3 }}>
            <OrderForFuture />
          </Box>
        ),
      },
      {
        label: "📦 Production",
        icon: <ListAltIcon />,
        component: (
          <Box sx={{ mt: 3 }}>
            <Production />
          </Box>
        ),
      },
      {
        label: "📊 All Orders",
        icon: <ListAltIcon />,
        component: (
          <Box sx={{ mt: 3 }}>
            <AllOrders />
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}
        >
          🏭 Production Hub
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your resin production workflow: produce, track orders, and plan
          future orders all in one place.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: "#f3f4f6",
            borderBottom: "1px solid #e5e7eb",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              color: "text.secondary",
              py: 2,
              px: 3,
              minHeight: "auto",
              "&.Mui-selected": {
                color: "primary.main",
                backgroundColor: "#fff",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>{tabs[activeTab].component}</Box>
      </Paper>
    </Container>
  );
}

export default ProduceHub;
