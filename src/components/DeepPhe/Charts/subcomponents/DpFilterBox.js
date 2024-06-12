import getChartTitle from "./FilterBuilder";
import Grid from "@mui/material/Grid";
import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import BarChartWithSlider from "./BarChartWithSlider";

function DpFilterBox(props) {
  const theme = useTheme();
  const { definition } = props;
  let filterObject = undefined;
  if (definition.class === "categoricalRangeSelector") {
    filterObject = (
      <BarChartWithSlider
        definition={props.definition}
        seriesArray={props.seriesArray}
      ></BarChartWithSlider>
    );
  }
  return (
    <React.Fragment>
      <Grid item md={12}>
        <Box align={"bottom"} bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
          {getChartTitle(definition)}
          {props.list && props.list}
          {props.chart && props.chart}
          {props.slider && props.slider}
          {filterObject && filterObject}
        </Box>
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
