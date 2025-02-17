import React, { useEffect, useState } from "react";
import { axisClasses, BarChart } from "@mui/x-charts";
import { useTheme } from "@mui/styles";
import DpCheckboxesForChart from "./DpCheckboxesForChart";
import $ from "jquery";

function DpBarChart(props) {
  const { wantSlider, wantCheckboxes } = props;
  const [sliderState, setSliderState] = useState(undefined);
  const [checkedItems, setCheckedItems] = useState(undefined);
  const { series, dataset, definition } = props;
  const theme = useTheme();
  const fieldName = definition.fieldName;
  const filterBoxSvgSelector =
    ".dp-filter-box-" + fieldName.replace(" ", "_") + " svg g[clip-path]";
  const [paddingRight, setPaddingRight] = useState(undefined);
  const [minWidth, setMinWidth] = useState(undefined);
  const [width, setWidth] = useState(undefined);
  const [coordinates, setCoordinates] = useState([]);

  const [rects, setRects] = useState([]);

  useEffect(() => {
    if (coordinates && coordinates.length && width) {
      setPaddingRight(coordinates[1] / 2 - 10 + "px");
      setMinWidth(coordinates[1]);
      setWidth(width);
    }
  }, [coordinates, width]);

  useEffect(() => {
    const observer = new MutationObserver((mutations, obs) => {
      if (findRects()) {
        obs.disconnect();
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [fieldName]);

  const handleCheckboxClick = (checkboxData) => {
    setCheckedItems(checkboxData);
  };

  const handleSliderChange = (sliderData) => {
    setSliderState(sliderData);
  };

  const findRects = () => {
    const elems = $(filterBoxSvgSelector);
    if (elems.length) {
      setRects(elems[0].childNodes);
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (rects && rects.length) {
      const rectMap = Array.from(rects);
      const distances = rectMap.map((rect, i) => {
        if (i === 0) {
          return 0;
        }
        const prevRect = rectMap[i - 1];
        return rect.getBoundingClientRect().left - prevRect.getBoundingClientRect().left;
      });

      const widthOfXAxis = rects[0].parentNode.nextSibling.getBoundingClientRect().width;
      setWidth(widthOfXAxis);
      setCoordinates(distances);
    }
  }, [rects]);

  useEffect(() => {
    if (
      (wantSlider && sliderState !== undefined) ||
      (wantCheckboxes && checkedItems !== undefined)
    ) {
      getSelectedCategoricalRange().then((selectedCategoricalRange) => {
        definition.selectedCategoricalRange = selectedCategoricalRange;
        props.broadcastUpdate(definition);
      });
    }
  }, [sliderState, checkedItems]);

  const getSelectedCategoricalRange = () => {
    return new Promise((resolve) => {
      let selectedCategoricalRange = [];
      if (wantSlider && sliderState !== undefined) {
        for (let i = sliderState[0]; i <= sliderState[1] - 1; i++) {
          selectedCategoricalRange.push(definition.patientCountsByCategory[i].category);
        }
      }

      if (wantCheckboxes && checkedItems !== undefined) {
        for (const [key, value] of Object.entries(checkedItems)) {
          if (value) {
            selectedCategoricalRange.push(key);
          }
        }
      }
      resolve(selectedCategoricalRange);
    });
  };

  const getChart = () => {
    let categories = props.definition.categoricalRange;
    categories = categories.map((category) => {
      return category.replace(props.definition.fieldName + ".", "");
    });

    const valueFormatter = (code, context) => {
      if (context.location === "tick") {
        return wantCheckboxes ? "" : code;
      }
      return code;
    };

    return (
      <React.Fragment>
        <span className={"dp-bar-chart"} style={{ overflow: "visible" }}>
          <BarChart
            sx={{
              [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
                fontSize: "9px !important",
                overflow: "visible !important",
                // transform: "translate(-10px, -10px) rotate(45deg)",
                textAnchor: "start",
                zIndex: 1000,
              },
            }}
            dataset={dataset}
            series={series}
            margin={{ top: -10, right: 0, bottom: 30, left: 30 }}
            slotProps={{ legend: { direction: "row", hidden: true } }}
            xAxis={[
              {
                tickLabelInterval: () => true,
                valueFormatter: valueFormatter,
                scaleType: "band",
                dataKey: "category",
                height: 5,
              },
            ]}
            skipAnimation={true}
            height={150}
          ></BarChart>
        </span>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {getChart()}
      {wantCheckboxes && (
        <DpCheckboxesForChart
          fieldName={definition.fieldName}
          categoricalRange={definition.categoricalRange}
          abbrevCategories={definition.abbrevCategories}
          handleCheckboxClick={handleCheckboxClick}
          paddingRight={paddingRight}
          minWidth={minWidth}
          width={width}
        ></DpCheckboxesForChart>
      )}
    </React.Fragment>
  );
}

export default DpBarChart;
