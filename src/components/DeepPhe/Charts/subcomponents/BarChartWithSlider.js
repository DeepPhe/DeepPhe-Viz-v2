import React, { useEffect, useState } from "react";
import { ChangeResult } from "multi-range-slider-react";
import Slider from "rc-slider";
import { axisClasses, BarChart } from "@mui/x-charts";
import { useTheme } from "@mui/styles";
import CheckboxXAxisLabel from "./controls/CheckboxXAxisLabel";

function BarChartWithSlider(props) {
  const [barColors, setBarColors] = useState([]);
  const [sliderState, setSliderState] = useState(undefined);
  const seriesArray = props.seriesArray;
  const definition = props.definition;
  const theme = useTheme();
  // debugger;
  useEffect(() => {
    let barColorsTmp = [];
    if (definition.class === "categoricalRangeSelector") {
      definition.globalPatientCountsForCategories.forEach((category, idx) => {
        const sliderIdx = idx;
        const active =
          sliderState === undefined
            ? true
            : sliderIdx >= sliderState[0] && sliderIdx <= sliderState[1];
        barColorsTmp = [...barColorsTmp, active ? null : "#0000008c"];
      });
      setBarColors(barColorsTmp);
      props.broadcastUpdate(definition);
    }
  }, [sliderState]);
  const handleSliderRangeChange = (e: ChangeResult) => {
    let selectedCategoricalRange = [];
    for (let i = e[0]; i <= e[1]; i++) {
      selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category);
    }
    definition.selectedCategoricalRange = selectedCategoricalRange;
    setSliderState(e);
  };

  const getSlider = () => {
    const selectedCategoricalRange = props.definition.selectedCategoricalRange;
    const marks2 = {};
    let minSelectedInRange = 10000000000;
    let maxSelectedInRange = 0;
    props.definition.globalPatientCountsForCategories.map((item, index) => {
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
          max={props.definition.globalPatientCountsForCategories.length - 1}
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

  const getHorizontalChart = () => {
    // const sizingProps = { height: 500 };
    const barColorsMap = {
      //jdl jdl
    };

    let categories = props.definition.categoricalRange;
    //for each category, remove the prefix, which is the props.definition.fieldname
    categories = categories.map((category) => {
      return category.replace(props.definition.fieldName + ".", "");
    });
    const numCategories = categories.length;
    const width = numCategories * 50;

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
          series={seriesArray}
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

  const getChart = () => {
    // if (["t", "n", "m"].includes(definition.fieldName)) {
    //   //return getVerticalChart();
    // } else {
    return getHorizontalChart();
    // }
  };

  return (
    <React.Fragment>
      {getChart()}
      {getSlider()}
    </React.Fragment>
  );
}

export default BarChartWithSlider;
