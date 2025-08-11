// CancerDataTable.jsx
import React from "react";
import { Box } from "@mui/material";
import CancerDataTable from "./CancerDataTable";

export default function CancerDataTables({ cancers }) {
  return (
    <Box sx={{ p: 2 }}>
      {cancers.map((c) => (
        <CancerDataTable key={c.cancerId} cancer={c} />
      ))}
    </Box>
  );
}
