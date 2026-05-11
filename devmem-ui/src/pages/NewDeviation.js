import React, { useState } from "react";
import { post } from "../api";
import { TextField, Button, Typography, Paper, Box, Grid } from "@mui/material";
import Result from "./result";



function NewDeviation() {
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [study, setStudy] = useState("");
  const [detection, setDetection] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const data = {
        event,
        date,
        study,
        detection_method: detection,
        immediate_action: action,
      };


      const resultData = await post('/analyze-deviation', data);
      console.log(resultData);
      setResult(resultData);

    } catch (err) {
      console.error("API Error:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: "1000px" }}>
      <Typography variant="h4" gutterBottom>
        Initiate New Deviation
      </Typography>

      <Paper sx={{ padding: 4, marginTop: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Deviation Event"
              fullWidth
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Product / Study"
              fullWidth
              value={study}
              onChange={(e) => setStudy(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Detection Method"
              fullWidth
              value={detection}
              onChange={(e) => setDetection(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Immediate Action Taken"
              fullWidth
              multiline
              rows={3}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="large"
          sx={{ marginTop: 3 }}
          onClick={handleSubmit}
        >
          Run AI Investigation
        </Button>
      </Paper>

      {result && <Result result={result} />}
    </Box>
  );
}

export default NewDeviation;