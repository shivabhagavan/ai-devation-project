import React, { useEffect, useState } from "react";
import { Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Box } from "@mui/material";
import MainLayout from "../components/MainLayout";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/deviations")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Deviation Reports
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, background: "#fff" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Deviation Title</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Batch Number</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Process Point</TableCell>
              <TableCell>Cause Category</TableCell>
              <TableCell>Functional Area</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.event}</TableCell>
                <TableCell>{row.study || '-'}</TableCell>
                <TableCell>{row.batch_number || '-'}</TableCell>
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
                <TableCell>{row.process_point || '-'}</TableCell>
                <TableCell>{row.assignable_cause_category || '-'}</TableCell>
                <TableCell>{row.functional_area || '-'}</TableCell>
                <TableCell>
                  <Chip label={row.status} />
                </TableCell>
                <TableCell>
                  <Button variant="contained" size="small">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </MainLayout>
  );
}