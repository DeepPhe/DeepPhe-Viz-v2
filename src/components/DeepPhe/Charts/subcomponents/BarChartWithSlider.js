import React, { useEffect, useState } from "react";
import { ChangeResult } from "multi-range-slider-react";
import Slider from "rc-slider";
import { axisClasses, BarChart, BarPlot, ResponsiveChartContainer } from "@mui/x-charts";
import { useTheme } from "@mui/styles";
import CheckboxXAxisLabel from "./controls/CheckboxXAxisLabel";

function BarChartWithSlider(props) {
  const [barColors, setBarColors] = useState([]);
  const [sliderState, setSliderState] = useState(undefined);
  const seriesArray = props.seriesArray;
  const definition = props.definition;
  const globalPatientCountsForCategories = props.definition.globalPatientCountsForCategories;
  const theme = useTheme();
  // debugger;
  useEffect(() => {
    let barColorsTmp = [];
    if (definition.class === "categoricalRangeSelector") {
      globalPatientCountsForCategories.forEach((category, idx) => {
        const sliderIdx = idx;
        const active =
          sliderState === undefined
            ? true
            : sliderIdx >= sliderState[0] && sliderIdx <= sliderState[1];
        barColorsTmp = [...barColorsTmp, active ? null : "#0000008c"];
      });
      setBarColors(barColorsTmp);
      //console.log(barColorsTmp);
    }
  }, [sliderState]);
  const handleSliderRangeChange = (e: ChangeResult) => {
    let selectedCategoricalRange = [];
    //for (let i = e[0]; i <= e[1]; i++) console.log(e);
    setSliderState(e);
    //selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category);
    // this.props.definition.selectedCategoricalRange = selectedCategoricalRange
    // this.setState({
    //   ...(definition.selectedCategoricalRange = selectedCategoricalRange),
    //   updated: false,
    // });
  };

  const getSlider = () => {
    const selectedCategoricalRange = props.definition.selectedCategoricalRange;
    const marks2 = {};
    let minSelectedInRange = 10000000000;
    let maxSelectedInRange = 0;
    globalPatientCountsForCategories.map((item, index) => {
      marks2[index] = {
        label: item.category,
        style: { color: theme.palette.text.primary },
      };
      if (selectedCategoricalRange.indexOf(item.category) !== -1) {
        minSelectedInRange = Math.min(minSelectedInRange, index);
        maxSelectedInRange = Math.max(maxSelectedInRange, index);
      }
      return true;
    });
    const numItems = Object.keys(marks2).length;
    let percent = 100;
    if (numItems === 12) {
      percent = 83.5;
    }
    if (numItems === 7) {
      percent = 79;
    }
    if (numItems === 6) {
      percent = 76;
    }
    if (numItems === 5) {
      percent = 72;
    }
    if (numItems === 4) {
      percent = 68.7;
    }
    if (numItems === 3) {
      percent = 61;
    }
    const label = percent + "%";
    //console.log(label);
    return (
      <div className={"slider-container"}>
        <Slider
          style={{ width: label, margin: "auto" }}
          className={"bar-chart-filter-slider"}
          range
          min={0}
          max={globalPatientCountsForCategories.length - 1}
          defaultValue={[minSelectedInRange, maxSelectedInRange]}
          onChange={(e) => handleSliderRangeChange(e)}
          draggableTrack={true}
          included={true}
          dots={true}
          step={1}
        />
      </div>
    );
  };

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

  const getHorizontalChart = () => {
    // const sizingProps = { height: 500 };
    const barColorsMap = {
      //jdl jdl
    };

    const categories = props.definition.categoricalRange;
    const numCategories = categories.length;
    const width = numCategories * 50;
    let adjustedSeriesArray = [...seriesArray];

    for (let i = 0; i < seriesArray.length; i++) {
      adjustedSeriesArray[i].data = seriesArray[i].data.slice(
        seriesArray[i].data.length - categories.length
      );
    }

    let sizingProps = { height: 150 };

    const getCheckbox = (value) => {
      return <CheckboxXAxisLabel value={value} checked={true} onCheck={() => {}} />;
    };

    return (
      <React.Fragment>
        <BarChart
          sx={{
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
              fontSize: "9px !important",
            },
          }}
          // label="Patients Meeting All Filters"
          margin={{ top: 5, right: 0, bottom: 30, left: 30 }}
          // colors={blueberryTwilightPalette}
          slotProps={{ legend: { direction: "row", hidden: true } }}
          series={adjustedSeriesArray}
          xAxis={[
            {
              tickLabelInterval: () => true,
              valueFormatter: (
                code,
                context //context.location === "tick" ? getCheckbox(code) : code,
              ) => (context.location === "tick" ? code : code),
              scaleType: "band",
              data: categories,
              // colorMap: {
              //   type: "ordinal",
              //   colors: barColorsMap,
              // },
            },
          ]}
          {...sizingProps}
        ></BarChart>
      </React.Fragment>
    );
  };

  // const getVerticalChart = () => {
  //   const sizingProps = { height: 200 };
  //   const categories = props.definition.categoricalRange;
  //   return (
  //     <BarChart
  //       label="Patients Meeting All Filters2"
  //       layout={"horizontal"}
  //       // colors={blueberryTwilightPalette}
  //       slotProps={{ legend: { hidden: true } }}
  //       series={seriesArray}
  //       yAxis={[
  //         {
  //           scaleType: "band",
  //           data: categories,
  //           colorMap: {
  //             type: "ordinal",
  //             colors: barColors,
  //           },
  //         },
  //       ]}
  //       {...sizingProps}
  //     >
  //       {/*<ChartsXAxis*/}
  //       {/*  label={this.state.definition.fieldName}*/}
  //       {/*  position="bottom"*/}
  //       {/*  axisId="x-axis-id"*/}
  //       {/*/>*/}
  //     </BarChart>
  //   );
  // };

  const getChart = () => {
    // if (["t", "n", "m"].includes(definition.fieldName)) {
    //   //return getVerticalChart();
    // } else {
    return getHorizontalChart();
    // }
  };

  return (
    <React.Fragment>
      {definition.class === "categoricalRangeSelector" ? getChart() : getAgeChart()}
      {definition.class === "categoricalRangeSelector" ? getSlider() : getAgeSlider()}
    </React.Fragment>
  );
}

export default BarChartWithSlider;
