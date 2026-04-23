import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody, Divider } from "@mui/material";
import MainLayout from "../components/MainLayout";

const metricColors = ["#2563eb", "#dc2626", "#f59e42", "#22c55e"];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard-metrics")
      .then((res) => res.json())
      .then((data) => setMetrics({
        total: data.total_deviations,
        high: data.high,
        medium: data.medium,
        low: data.low
      }));
    fetch("http://127.0.0.1:8000/deviations")
      .then((res) => res.json())
      .then((data) => setRecent(data.slice(0, 5)));
  }, []);

  const metricLabels = [
    "Total Deviations",
    "High Risk Deviations",
    "Medium Risk Deviations",
    "Low Risk Deviations"
  ];
  const metricValues = [metrics.total, metrics.high, metrics.medium, metrics.low];

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricLabels.map((label, idx) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, background: "#fff" }}>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>{label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: metricColors[idx] }}>{metricValues[idx]}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, background: "#fff" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Recent Deviations
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Deviation Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recent.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.event}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Chip
                    label={row.severity}
                    color={
                      row.severity === "High"
                        ? "error"
                        : row.severity === "Medium"
                        ? "warning"
                        : "success"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip label={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </MainLayout>
  );
}