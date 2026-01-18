import React from 'react';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import FactoryIcon from '@mui/icons-material/Factory';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import TodayIcon from '@mui/icons-material/Today';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorageIcon from '@mui/icons-material/Storage';
import HomeIcon from '@mui/icons-material/Home';

export const menuItems = [
  {
    title: "💼 Sales",
    description: "View sales, orders, clients, and payments due.",
    link: "/sales",
    icon: <AttachMoneyIcon />,
    submenu: [
      {
        title: "👥 Client Payments",
        description: "Manage your sales operations including orders, clients, and payments.",
        link: "/client-payments",
      },
      {
        title: "📋 Order for Future",
        link: "/future-orders",
      },
      {
        title: "👤 Client Details",
        link: "/clients-details",
      },
      {
        title: "💳 Payments Due",
        link: "/payments-due",
      },
    ],
  },
  {
    title: "📊 General Manager",
    description: "Overview of all reports, expenses, and inventory.",
    link: "/general-manager",
    icon: <AnalyticsIcon />,
    submenu: [
      {
        title: "📅 Day's Summary",
        link: "/day-summary",
      },
      {
        title: "💵 Daily Expenses",
        link: "/expenses",
      },
      {
        title: "🗺️ Location Report",
        link: "/location-report",
      },
      {
        title: "📊 Client Inactivity",
        link: "/client-inactivity",
      },
      {
        title: "📋 All Orders",
        link: "/all-orders",
      },
      {
        title: "💳 Payments Due",
        link: "/payments-due",
      },
      {
        title: "🛒 Purchase Report",
        link: "/purchase-report",
      },
      {
        title: "📦 Inventory",
        link: "/raw-materials",
      },
      {
        title: "🧮 Resin Calculator",
        link: "/resin-calculator",
      },
    ],
  },
  {
    title: "🏪 Store Manager",
    description: "Manage inventory and resin calculator.",
    link: "/store-manager",
    icon: <StorageIcon />,
    submenu: [
      {
        title: "📦 Inventory",
        link: "/raw-materials",
      },
      {
        title: "🧮 Resin Calculator",
        link: "/resin-calculator",
      },
    ],
  },
  {
    title: "👷 Production Team",
    description: "Manage inventory and track production activities.",
    link: "/production-team",
    icon: <FactoryIcon />,
    submenu: [
      {
        title: "📦 Inventory",
        link: "/raw-materials",
      },
      {
        title: "🏭 Production",
        link: "/production",
      },
    ],
  },
  {
    title: "💳 Account",
    description: "Manage billing and payment records.",
    link: "/account",
    icon: <ReceiptIcon />,
    submenu: [
      {
        title: "📄 Billing",
        link: "/billing",
      },
      {
        title: "📋 Billing History",
        link: "/billing-history",
      },
    ],
  },
  {
    title: "💰 Collection",
    description: "Manage payment collection and outstanding payments.",
    link: "/collection",
    icon: <AttachMoneyIcon />,
    submenu: [
      {
        title: "✅ Payment Collected",
        link: "/payment-collected",
      },
      {
        title: "💳 Payment Due",
        link: "/payments-due",
      },
    ],
  },
  {
    title: "🏭 Procurement",
    description: "Manage suppliers and raw material vendors.",
    link: "/sellers",
    icon: <PeopleIcon />,
  },
  {
    title: "Logistics",
    description: "Monitor transportation and delivery updates.",
    link: null, // Coming soon
    icon: <LocalShippingIcon />,
  },
];
