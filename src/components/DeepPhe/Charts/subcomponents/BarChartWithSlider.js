import React, { useEffect, useState } from "react";
import { ChangeResult } from "multi-range-slider-react";
import Slider from "rc-slider";
import { BarChart } from "@mui/x-charts";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";
import { useTheme } from "@mui/styles";

function BarChartWithSlider(props) {
  const [barColors, setBarColors] = useState([]);
  const [sliderState, setSliderState] = useState(undefined);
  const seriesArray = props.seriesArray;
  const definition = props.definition;
  const globalPatientCountsForCategories = props.definition.globalPatientCountsForCategories;
  const theme = useTheme();

  useEffect(() => {
    let barColorsTmp = [];
    globalPatientCountsForCategories.forEach((category, idx) => {
      const sliderIdx = idx;
      const active =
        sliderState === undefined
          ? true
          : sliderIdx >= sliderState[0] && sliderIdx <= sliderState[1];
      barColorsTmp = [...barColorsTmp, active ? null : "#0000008c"];
    });
    setBarColors(barColorsTmp);
    console.log(barColorsTmp);
  }, [sliderState]);
  const handleSliderRangeChange = (e: ChangeResult) => {
    let selectedCategoricalRange = [];
    for (let i = e[0]; i <= e[1]; i++) console.log(e);
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
      marks2[index] = { label: item.category, style: { color: theme.palette.text.primary } };
      if (selectedCategoricalRange.indexOf(item.category) !== -1) {
        minSelectedInRange = Math.min(minSelectedInRange, index);
        maxSelectedInRange = Math.max(maxSelectedInRange, index);
      }
      return true;
    });
    return (
      <div className={"slider-container"}>
        <Slider
          className={"bar-chart-filter-slider"}
          range
          min={0}
          max={globalPatientCountsForCategories.length - 1}
          defaultValue={[minSelectedInRange, maxSelectedInRange]}
          onChange={(e) => handleSliderRangeChange(e)}
          draggableTrack={true}
          included={true}
          marks={marks2}
          dots={true}
          step={1}
        />
      </div>
    );
  };

  const getChart = () => {
    const categories = props.definition.categoricalRange;
    const sizingProps = { height: 200 };
    return (
      <BarChart
        label="Patients Meeting All Filters"
        // colors={blueberryTwilightPalette}
        slotProps={{ legend: { hidden: true } }}
        series={seriesArray}
        xAxis={[
          {
            // id: "x-axis-id",
            // label: this.state.definition.fieldName,
            scaleType: "band",
            data: categories,
            colorMap: {
              type: "ordinal",
              colors: barColors,
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

  return (
    <React.Fragment>
      {getChart()}
      {getSlider()}
    </React.Fragment>
  );
}

export default BarChartWithSlider;
