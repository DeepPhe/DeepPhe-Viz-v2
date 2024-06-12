import Typography from "@mui/material/Typography";
import React from "react";
import { useTheme } from "@mui/styles";

const getChartTitle = (definition) => {
  const theme = useTheme();
  return <Typography>{definition.fieldName}</Typography>;
};

export default getChartTitle;
