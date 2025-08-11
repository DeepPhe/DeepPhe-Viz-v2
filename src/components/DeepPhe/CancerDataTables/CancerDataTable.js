// CancerDataTable.jsx
import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";

export default function CancerDataTable({ cancer }) {
  const { cancerId, details, clinicalTNM, tumorSummaries } = cancer;
  const detailCount = Object.keys(details).length;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Typography variant="h6">
        Cancer ID:&nbsp;
        <Box component="span" sx={{ fontWeight: "bold" }}>
          {cancerId}
        </Box>
      </Typography>

      {/* Main details + Clinical TNM */}
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              {Object.entries(details).map(([key, value]) => (
                <React.Fragment key={key}>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Clinical TNM</TableCell>
              <TableCell colSpan={detailCount * 2 - 1}>
                {Object.entries(clinicalTNM)
                  .map(([axis, val]) => `${axis}${val}`)
                  .join(" ")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tumor Summaries */}
      {tumorSummaries.map((summary, idx) => (
        <Box key={idx}>
          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Tumor Summary{tumorSummaries.length > 1 ? ` #${idx + 1}` : ""}
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table size="small">
              <TableBody>
                {/* Title row */}
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: "bold", bgcolor: "grey.200" }}>
                    {summary.title}
                  </TableCell>
                </TableRow>
                {/* Detail rows */}
                {Object.entries(summary.fields).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}
