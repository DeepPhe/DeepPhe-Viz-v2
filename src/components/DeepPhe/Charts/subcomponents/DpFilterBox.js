import Grid from "@mui/material/Grid";
import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import BarChartWithSlider from "./BarChartWithSlider";
import { BarChart } from "@mui/x-charts";
import Typography from "@mui/material/Typography";
import { FormControlLabel, FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

function DpFilterBox(props) {
  const theme = useTheme();
  const { definition } = props;
  const fullWidth = props.fullWidth;
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

  const getList = (title) => {
    let width = "100%";
    let mt = 0;
    let mr = 0;
    let marginLeftCb = "0px";
    const numCheckboxes = 1;
    if (numCheckboxes === 1) {
      width = "8%";
      mt = "117px";
      mr = "0px";
      marginLeftCb = "-35px";
    }
    const theme = useTheme();
    return (
      <FormGroup
        alignItems="center"
        row
        sx={{
          width: width,
          justifyContent: "space-between",
          fontSize: "12px",
          rowWrap: "nowrap",
        }}
      >
        <FormControlLabel
          sx={{
            "& .MuiFormControlLabel-label": { fontSize: "14px" },
            color: theme.palette.text.primary,
            marginRight: marginLeftCb,

            fontSize: "10px",
          }}
          key={title}
          labelPlacement={"bottom"}
          control={
            <Checkbox
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 14 },
                marginTop: mt,
                marginLeft: mr,
              }}
              size={"small"}
              checked={true}
              name={title}
            />
          }
          label={""}
        />
      </FormGroup>
    );
  };

  const getChart = (title) => {
    const seriesA = {
      data: [Math.floor(Math.random() * 2)],
      label: "Patients Meeting All Filters",
      color: "#187bcd",
      id: "patients-meeting-all-filters",
    };
    const seriesB = {
      data: [2 + Math.floor(Math.random() * 2)],
      label: "Patients Meeting This Filter",
      color: "#2a9df4",
      id: "patients-meeting-this-filter",
    };
    const seriesC = {
      data: [4 + Math.floor(Math.random() * 2)],
      label: "Remaining Patients",
      color: "#d0efff",
      id: "remaining-patients",
    };
    const seriesArray = [
      { ...seriesA, stack: "total" },
      { ...seriesB, stack: "total" },
      { ...seriesC, stack: "total" },
    ];
    let marginLeft = 5;
    let checkbox = undefined;
    if (title === "T") {
      marginLeft = 5;
    } else {
      checkbox = getList(title);
    }
    const categories = [title];
    const sizingProps = { width: 65, height: 150 };
    return (
      <React.Fragment>
        <BarChart
          rightAxis={{}}
          leftAxis={null}
          margin={{ top: 10, right: 28, bottom: 30, left: marginLeft }}
          // colors={blueberryTwilightPalette}
          slotProps={{ legend: { hidden: true } }}
          series={seriesArray}
          xAxis={[
            {
              labelStyle: { fontSize: 7 }, // id: "x-axis-id",
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
        {/*{checkbox && checkbox}*/}
      </React.Fragment>
    );
  };

  const chartColWidth = fullWidth ? 9 : 9;
  const totalUnknownColWidth = fullWidth ? 3 : 3;

  return (
    <React.Fragment>
      <Typography>{definition.fieldName}</Typography>
      <Grid container>
        {/*<Grid item md={2} sx={{ alignContent: "center" }}>*/}
        {/*  {getChartTitle(definition)}*/}
        {/*</Grid>*/}
        <Grid item className={"filter-item"}>
          <Box align={"bottom"} bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
            {props.chart && props.chart}
            {props.slider && props.slider}
            {filterObject && filterObject}
            {props.list && props.list}
          </Box>
        </Grid>
        <Grid item>
          <Box bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
            {getChart("U")}
          </Box>
        </Grid>
        <Grid item>
          <Box bgcolor={theme.palette.background.default} sx={{ marginBottom: 0 }}>
            {getChart("T")}
          </Box>
        </Grid>
        {/*<Grid item sm={1}>*/}
        {/*  <Box*/}
        {/*    align={"bottom"}*/}
        {/*    bgcolor={theme.palette.background.default}*/}
        {/*    sx={{ marginBottom: 0 }}*/}
        {/*  ></Box>*/}
        {/*</Grid>*/}
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
