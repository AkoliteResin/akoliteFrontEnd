import React, { useState, useEffect } from "react";
import axiosInstance, { API_ENDPOINTS } from "../utils/axiosInstance";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function ClientInactivity() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInactiveClients();
  }, []);

  const fetchInactiveClients = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(`/api/clients/analytics/inactive-clients`);
      setClients(response.data || []);
    } catch (err) {
      console.error("Error fetching inactive clients:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load client data";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Group clients by inactivity category
  const groupedClients = {
    "0-30 days": clients.filter((c) => c.inactivityCategory === "0-30 days"),
    "31-60 days": clients.filter((c) => c.inactivityCategory === "31-60 days"),
    "61-90 days": clients.filter((c) => c.inactivityCategory === "61-90 days"),
    "90+ days": clients.filter((c) => c.inactivityCategory === "90+ days"),
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "0-30 days":
        return "#10b981"; // green
      case "31-60 days":
        return "#3b82f6"; // blue
      case "61-90 days":
        return "#f59e0b"; // amber
      case "90+ days":
        return "#ef4444"; // red
      default:
        return "#6b7280";
    }
  };

  const downloadAsCSV = () => {
    if (clients.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Client Name",
      "Phone",
      "Address",
      "Last Order Date",
      "Days Inactive",
      "Inactivity Category",
    ];
    const rows = clients.map((c) => [
      c.clientName,
      c.phone,
      c.address,
      c.lastOrderDate,
      c.daysInactive,
      c.inactivityCategory,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : cell
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `client-inactivity-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsExcel = () => {
    if (clients.length === 0) {
      alert("No data to download");
      return;
    }

    // Create HTML table for Excel
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 10px; font-weight: bold; }
            td { border: 1px solid #d1d5db; padding: 10px; }
            tr:nth-child(even) { background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Last Order Date</th>
                <th>Days Inactive</th>
                <th>Inactivity Category</th>
              </tr>
            </thead>
            <tbody>
              ${clients
                .map(
                  (c) => `
                <tr>
                  <td>${c.clientName}</td>
                  <td>${c.phone}</td>
                  <td>${c.address}</td>
                  <td>${c.lastOrderDate}</td>
                  <td>${c.daysInactive}</td>
                  <td>${c.inactivityCategory}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `client-inactivity-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}
          >
            📊 Client Inactivity Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track clients by their last order date. Click a category to filter or download the data.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadAsCSV}
            sx={{ backgroundColor: "#10b981" }}
          >
            Download CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadAsExcel}
            sx={{ backgroundColor: "#3b82f6" }}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Object.entries(groupedClients).map(([category, items]) => (
              <Grid item xs={12} sm={6} md={3} key={category}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {category}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: getCategoryColor(category), mb: 1 }}
                  >
                    {items.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {items.length === 1 ? "client" : "clients"}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Detailed Table */}
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      Client Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      Last Order Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }} align="right">
                      Days Inactive
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }} align="center">
                      Category
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <Typography color="text.secondary">No client data available</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": { backgroundColor: "#f9fafb" },
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {client.clientName}
                        </TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.address}</TableCell>
                        <TableCell>{client.lastOrderDate}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {client.daysInactive === 999999 ? "Never" : client.daysInactive}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={client.inactivityCategory}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(client.inactivityCategory),
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default ClientInactivity;
