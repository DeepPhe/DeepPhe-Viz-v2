import getChartTitle from "./FilterBuilder";
import Grid from "@mui/material/Grid";
import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";

function DpFilterBox(props) {
  const theme = useTheme();
  const { definition } = props;
  return (
    <React.Fragment>
      <Grid item md={12}>
        <Box bgcolor={theme.palette.background.default} sx={{ marginBottom: 10 }}>
          {getChartTitle(definition)}
          {props.chart && props.chart}
          {props.slider && props.slider}
        </Box>
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
