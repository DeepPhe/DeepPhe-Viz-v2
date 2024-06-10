import React, { useState } from "react";
import { ChangeResult } from "multi-range-slider-react";
import { BarChart } from "@mui/x-charts";
import Slider from "rc-slider";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";
import { ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import getChartTitle from "./FilterBuilder";
import { useTheme } from "@mui/styles";
import DpFilterBox from "./DpFilterBox.js";

function DpCategoricalRangeSelector(props) {
  const [definition, setDefinition] = useState(props.definition);
  const [stageView, setStageView] = useState(null);
  const [updated, setUpdated] = useState(true);

  const broadcastUpdate = (definition) => {
    props.broadcastUpdate(definition);
  };

  const handleRangeChange = (e: ChangeResult) => {
    // const { definition } = this.state;
    // let selectedCategoricalRange = [];
    // for (let i = e[0]; i <= e[1]; i++)
    //   selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category);
    // // this.props.definition.selectedCategoricalRange = selectedCategoricalRange
    // this.setState({
    //   ...(definition.selectedCategoricalRange = selectedCategoricalRange),
    //   updated: false,
    // });
  };

  const handleSwitchUpdate = (definition) => {
    setDefinition(definition);
    setUpdated(false);
  };

  const update = () => {
    const { definition } = this.state;
    this.setState({ definition: definition, updated: true }, () => {
      this.broadcastUpdate(this.state.definition);
    });
  };

  const handleChange = (event, newValue, activeThumb) => {};

  const marks = ["", "", "", ""];

  const valuetext = (value) => {
    return `${value}°C`;
  };

  if (false) return "coming soon";
  else {
    const definition = props.definition;
    const globalPatientCountsForCategories = definition.globalPatientCountsForCategories;
    const selectedCategoricalRange = definition.selectedCategoricalRange;
    const marks2 = {};
    let minSelectedInRange = 10000000000;
    let maxSelectedInRange = 0;
    globalPatientCountsForCategories.map((item, index) => {
      marks2[index] = item.category;
      if (selectedCategoricalRange.indexOf(item.category) !== -1) {
        minSelectedInRange = Math.min(minSelectedInRange, index);
        maxSelectedInRange = Math.max(maxSelectedInRange, index);
      }
      return true;
    });
    // const categories = {
    //   blueberryTwilight: blueberryTwilightPalette,
    //   mangoFusion: mangoFusionPalette,
    //   cheerfulFiesta: cheerfulFiestaPalette,
    // };

    const seriesA = {
      data: [2, 3, 1, 4, 5],
      label: "Patients Meeting All Filters",
      color: "#187bcd",
      id: "patients-meeting-all-filters",
    };
    const seriesB = {
      data: [3, 1, 4, 2, 1],
      label: "Patients Meeting This Filter",
      color: "#2a9df4",
      id: "patients-meeting-this-filter",
    };
    const seriesC = {
      data: [3, 2, 4, 5, 1],
      label: "Remaining Patients",
      color: "#d0efff",
      id: "remaining-patients",
    };

    const getSlider = () => {
      return (
        <div className={"slider-container"}>
          <Slider
            className={"newslider"}
            range
            min={0}
            max={globalPatientCountsForCategories.length}
            defaultValue={[minSelectedInRange, maxSelectedInRange + 1]}
            onChange={(e) => handleRangeChange(e)}
            draggableTrack={true}
            pushable={true}
            marks={marks}
            dots={true}
            step={1}
          />
        </div>
      );
    };

    const getChart = () => {
      return (
        <BarChart
          label="Patients Meeting All Filters"
          colors={blueberryTwilightPalette}
          slotProps={{ legend: { hidden: true } }}
          series={[
            { ...seriesA, stack: "total" },
            { ...seriesB, stack: "total" },
            { ...seriesC, stack: "total" },
          ]}
          xAxis={[
            {
              // id: "x-axis-id",
              // label: this.state.definition.fieldName,
              scaleType: "band",
              data: categories,
              colorMap: {
                type: "ordinal",
                values: ["Series A", "Series B", "Series C"],
                colors: ["blue", "red", "blue"],
              },
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

    const prices = [1, 3, 6, 8, 2, 9, 1, 1, 1, 1];
    const sizingProps = { height: 200 };
    const categories = definition.categoricalRange;
    const view = stageView;
    const theme = useTheme();
    return (
      <React.Fragment>
        <DpFilterBox definition={definition} chart={getChart()} slider={getSlider()}></DpFilterBox>
      </React.Fragment>
    );
  }
}

export default DpCategoricalRangeSelector;
