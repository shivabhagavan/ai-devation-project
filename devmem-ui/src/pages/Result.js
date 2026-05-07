import React from "react";
import axios from "axios";
import {
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  Paper,
  Divider
} from "@mui/material";
import MainLayout from "../components/MainLayout";

// 🔥 Backend URL
const API_BASE_URL = "https://gray-pond-02c148a10.7.azurestaticapps.net";

export default function Result({ result }) {
  if (!result) return null;

  const severity = result.analysis?.severity;

  const getSeverityColor = () => {
    if (severity === "High") return "error";
    if (severity === "Medium") return "warning";
    return "success";
  };

  const handleCloseDeviation = async () => {
    if (!result.id) return;

    try {
      await axios.put(
        `${API_BASE_URL}/close-deviation/${result.id}`,
        {},
        { timeout: 10000 }
      );

      alert("Deviation Closed");
      window.location.reload();

    } catch (err) {
      console.error("Close API Error:", err);
    }
  };

  const handleDownloadPDF = () => {
    window.open(
      `${API_BASE_URL}/download-pdf/${result.id}`,
      "_blank"
    );
  };

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Investigation Result
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, background: '#fff', mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography><b>Deviation ID:</b> {result.id}</Typography>
          </Grid>

          <Grid item>
            <Typography><b>Date:</b> {result.date}</Typography>
          </Grid>

          <Grid item>
            <Chip
              label={result.status}
              color={result.status === "Open" ? "warning" : "success"}
            />
          </Grid>

          <Grid item>
            <Button variant="contained" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          </Grid>

          <Grid item>
            {result.status === "Open" && (
              <Button
                variant="contained"
                color="success"
                onClick={handleCloseDeviation}
              >
                Close Deviation
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Deviation Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><b>ID:</b> {result.id}</Typography>
            <Typography><b>Title:</b> {result.event}</Typography>
            <Typography><b>Product:</b> {result.study}</Typography>
            <Typography><b>Date:</b> {result.date}</Typography>
            <Typography>
              <b>Severity:</b> <Chip label={severity} color={getSeverityColor()} />
            </Typography>
            <Typography>
              <b>Status:</b> <Chip label={result.status} />
            </Typography>
          </Paper>
        </Grid>

        {/* Risk */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Risk Assessment</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>Patient Safety: {result.analysis?.risk_assessment?.patient_safety}</Typography>
            <Typography>Regulatory Compliance: {result.analysis?.risk_assessment?.regulatory_compliance}</Typography>
            <Typography>Data Integrity: {result.analysis?.risk_assessment?.data_integrity}</Typography>
            <Typography>Product Quality: {result.analysis?.risk_assessment?.product_quality}</Typography>
          </Paper>
        </Grid>

        {/* Root Cause */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Root Cause Analysis</Typography>
            <Divider sx={{ mb: 2 }} />
            {result.analysis?.probable_root_causes?.map((cause, index) => (
              <Typography key={index}>• {cause}</Typography>
            ))}
          </Paper>
        </Grid>

        {/* Corrective */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Corrective Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            {result.analysis?.corrective_actions?.length ? (
              result.analysis.corrective_actions.map((c, i) => (
                <Typography key={i}>• {c}</Typography>
              ))
            ) : (
              <Typography color="text.secondary">
                No corrective actions generated.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Preventive */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Preventive Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            {result.analysis?.preventive_actions?.length ? (
              result.analysis.preventive_actions.map((c, i) => (
                <Typography key={i}>• {c}</Typography>
              ))
            ) : (
              <Typography color="text.secondary">
                No preventive actions generated.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Memo */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">AI Generated Deviation Memo</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
              {result.deviation_memo_draft}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
}