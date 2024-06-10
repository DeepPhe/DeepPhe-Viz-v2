import Typography from "@mui/material/Typography";
import React from "react";
import { useTheme } from "@mui/styles";

const getChartTitle = (definition) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        color: theme.palette.text.primary,
      }}
      variant="h4"
      component="h4"
    >
      {definition.fieldName}
    </Typography>
  );
};

export default getChartTitle;
