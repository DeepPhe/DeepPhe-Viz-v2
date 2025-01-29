import Slider from "rc-slider";
import { BarPlot, ResponsiveChartContainer } from "@mui/x-charts";
import React from "react";

function BarChartWithSlider(props) {
  const getAgeSlider = () => {
    return (
      <div className={"slider-container"}>
        <Slider
          style={{ width: "91%", margin: "auto" }}
          className={"bar-chart-filter-slider"}
          range
          min={0}
          max={100}
          defaultValue={[0, 100]}
          onChange={(e) => handleSliderRangeChange(e)}
          draggableTrack={true}
          included={true}
          dots={false}
          step={1}
        />
      </div>
    );
  };
  const getAgeChart = () => {
    const seriesA = {
      data: Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)),
      label: "Patients Meeting All Filters",
      color: "#187bcd",
      id: "patients-meeting-all-filters",
    };
    const seriesB = {
      data: Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)),
      label: "Patients Meeting This Filter",
      color: "#2a9df4",
      id: "patients-meeting-this-filter",
    };
    const seriesC = {
      data: Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)),
      label: "Remaining Patients",
      color: "#d0efff",
      id: "remaining-patients",
    };
    seriesA["data"][10] = 2;
    seriesB["data"][10] = 3;
    seriesC["data"][10] = 1;
    const ageseriesArray = [
      { ...seriesA, stack: "total" },
      { ...seriesB, stack: "total" },
      { ...seriesC, stack: "total" },
    ];
    const categories = [
      "0-9",
      "10s",
      "20s",
      "30s",
      "40s",
      "50s",
      "60s",
      "70s",
      "80s",
      "90s",
      "100+",
    ];
    const sizingProps = { height: 150 };
    return (
      <ResponsiveChartContainer
        label="Patients Meeting All Filters"
        // colors={blueberryTwilightPalette}
        slotProps={{ legend: { hidden: true } }}
        series={ageseriesArray}
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
        {" "}
        <BarPlot />
        {/*<ChartsXAxis*/}
        {/*  label={this.state.definition.fieldName}*/}
        {/*  position="bottom"*/}
        {/*  axisId="x-axis-id"*/}
        {/*/>*/}
      </ResponsiveChartContainer>
    );
  };

  return (
    <React.Fragment>
      {getAgeChart()}
      {getAgeSlider()}
    </React.Fragment>
  );
}
