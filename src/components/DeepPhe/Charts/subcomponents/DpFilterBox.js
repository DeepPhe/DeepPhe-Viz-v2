import getChartTitle from "./FilterBuilder";
import Grid from "@mui/material/Grid";
import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import BarChartWithSlider from "./BarChartWithSlider";
import { BarChart } from "@mui/x-charts";

function DpFilterBox(props) {
  const theme = useTheme();
  const { definition } = props;
  let filterObject = undefined;
  if (
    definition.class === "categoricalRangeSelector" ||
    definition.class === "numericRangeSelector"
  ) {
    filterObject = (
      <BarChartWithSlider
        definition={props.definition}
        seriesArray={props.seriesArray}
      ></BarChartWithSlider>
    );
  }

  const getChart = () => {
    const seriesA = {
      data: [Math.floor(Math.random() * 20)],
      label: "Patients Meeting All Filters",
      color: "#187bcd",
      id: "patients-meeting-all-filters",
    };
    const seriesB = {
      data: [20 + Math.floor(Math.random() * 20)],
      label: "Patients Meeting This Filter",
      color: "#2a9df4",
      id: "patients-meeting-this-filter",
    };
    const seriesC = {
      data: [40 + Math.floor(Math.random() * 20)],
      label: "Remaining Patients",
      color: "#d0efff",
      id: "remaining-patients",
    };
    const seriesArray = [
      { ...seriesA, stack: "total" },
      { ...seriesB, stack: "total" },
      { ...seriesC, stack: "total" },
    ];
    const categories = ["Patients"];
    const sizingProps = { width: 200, height: 200 };
    return (
      <BarChart
        label="Total"
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        // colors={blueberryTwilightPalette}
        slotProps={{ legend: { hidden: true } }}
        series={seriesArray}
        xAxis={[
          {
            // id: "x-axis-id",
            // label: this.state.definition.fieldName,
            scaleType: "band",
            data: categories,
          },
        ]}
        {...sizingProps}
      >
        {/*<ChartsXAxis*/}
        {/*  label={this.state.definition.fieldName}*/}
        {/*  position="bottom"*/}
        {/*  axisId="x-axis-id"*/}
        {/*/>*/}
      </BarChart>
    );
  };

  return (
    <React.Fragment>
      <Grid container>
        <Grid item md={2} sx={{ alignContent: "center" }}>
          {getChartTitle(definition)}
        </Grid>
        <Grid item md={8}>
          <Box align={"bottom"} bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
            {props.chart && props.chart}
            {props.list && props.list}

            {props.slider && props.slider}
            {filterObject && filterObject}
          </Box>
        </Grid>
        <Grid item md={1}>
          <Box align={"bottom"} bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
            {getChart()}
          </Box>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
