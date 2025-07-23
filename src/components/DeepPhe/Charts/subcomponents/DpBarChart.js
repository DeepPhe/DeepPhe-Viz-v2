import React, { useEffect, useState } from "react";
import { axisClasses, BarChart } from "@mui/x-charts";
import { useTheme } from "@mui/styles";
import DpCheckboxesForChart from "./DpCheckboxesForChart";
import $ from "jquery";
import DpSlider from "./DpSlider";
import isEqual from "lodash/isEqual";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Category: ${label}`}</p>
        <p className="intro">{`Value: ${payload[0].value}`}</p>
        <p className="desc">{`Custom Row: ${payload[0].payload.customData}`}</p>
      </div>
    );
  }
  return null;
}

function DpBarChart(props) {
  const { wantLogs, wantSlider, wantCheckboxes, series, dataset, definition, broadcastUpdate } =
    props;
  const { fieldName, abbrevCategories, categoricalRange } = definition;
  const [sliderState, setSliderState] = useState(undefined);
  const [checkedItems, setCheckedItems] = useState(undefined);
  const [paddingRight, setPaddingRight] = useState(undefined);
  const [minWidth, setMinWidth] = useState(undefined);
  const [width, setWidth] = useState(undefined);
  const theme = useTheme();
  const filterBoxSvgSelector =
    ".dp-filter-box-" + fieldName.replace(" ", "_") + " svg g[clip-path]";
  const [coordinates, setCoordinates] = useState([]);
  const [oldDefinition, setOldDefinition] = useState(JSON.parse(JSON.stringify(definition)));
  const [rects, setRects] = useState([]);

  useEffect(() => {
    if (coordinates.length && width) {
      if (coordinates[1] === 0) {
        setPaddingRight("0px");
        setMinWidth(width);
      } else {
        setPaddingRight(coordinates[1] / 2 - 10 + "px");
        setMinWidth(coordinates[1]);
      }

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

  const definitionIsEqual = (def1, def2) => {
    if (wantLogs) {
      const str1 = JSON.stringify(def1);
      const str2 = JSON.stringify(def2);

      for (let i = 0; i < Math.max(str1.length, str2.length); i++) {
        if (str1[i] !== str2[i]) {
          console.log(`Difference at index ${i}:`);
          console.log(`str1[${i}]:`, str1.toString().substring(i - 40, i + 40));
          console.log(`str2[${i}]:`, str2.toString().substring(i - 40, i + 40));
          break;
        }
      }
    }
    return isEqual(def1, def2);
  };

  useEffect(() => {
    if (
      (wantSlider && sliderState !== undefined) ||
      (wantCheckboxes && checkedItems !== undefined && checkedItems.length > 0)
    ) {
      getSelectedCategoricalRange().then((selectedCategoricalRange) => {
        definition.selectedCategoricalRange = selectedCategoricalRange;
        if (wantLogs) {
          console.log(definition.fieldName + ":getSelectedCategoricalRange");
          console.log("oldDefinition", oldDefinition);
          console.log("definition", definition);
        }
        if (!definitionIsEqual(oldDefinition, definition)) {
          broadcastUpdate(definition);
          setOldDefinition(JSON.parse(JSON.stringify(definition)));
        }
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
        checkedItems.forEach((value, idx) => {
          if (value) {
            if (
              !definition ||
              !definition.patientCountsByCategory ||
              !definition.patientCountsByCategory[idx] ||
              !definition.patientCountsByCategory[idx].category
            ) {
              console.warn(
                `Category at index ${idx} is undefined in patientCountsByCategory for field ${fieldName}.`
              );
              return;
            }
            selectedCategoricalRange.push(definition.patientCountsByCategory[idx].category);
          }
        });
      }
      resolve(selectedCategoricalRange);
    });
  };

  const getChart = () => {
    let categories = categoricalRange;
    categories = categories.map((category) => {
      return category.replace(fieldName + ".", "");
    });

    const valueFormatter = (code, context) => {
      if (context.location === "tick") {
        if (wantCheckboxes) {
          return "";
        } else if (wantSlider) {
          return abbrevCategories[categoricalRange.indexOf(fieldName + "." + code)];
        } else {
          return code;
        }
      } else {
        return code;
      }
    };
    return (
      <React.Fragment>
        <span className={"dp-bar-chart"} style={{ overflow: "visible" }}>
          <BarChart
            sx={{
              [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
                fontSize: "9px !important",
                overflow: "visible !important", // transform: "translate(-10px, -10px) rotate(45deg)",
                // textAnchor: "start",
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
            yAxis={[
              {
                domain: [0, 100], // Adjust the range of the Y-axis as needed
                ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // Explicitly define tick values
                interval: 0, // Ensure all ticks are displayed
              },
            ]}
            skipAnimation={true}
            height={150}
            tooltip={{ content: <CustomTooltip />, trigger: "axis" }}
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
      {wantSlider && (
        <DpSlider
          fieldName={definition.fieldName}
          categoricalRange={definition.categoricalRange}
          abbrevCategories={definition.abbrevCategories}
          handleSliderChangeExternal={handleSliderChange}
          patientCountsByCategory={definition.patientCountsByCategory}
          selectedCategoricalRange={definition.selectedCategoricalRange}
          paddingRight={paddingRight}
          minWidth={minWidth}
          width={width}
        ></DpSlider>
      )}
    </React.Fragment>
  );
}

/**
 * Returns an array of objects with the left and right pixel positions of each bar rect in the chart.
 * @param {NodeList|Array} rectNodes - The rect DOM nodes (SVGRectElement) for the bars.
 * @returns {Array<{left: number, right: number}>}
 */
function getBarLeftRightArray(rectNodes) {
  if (!rectNodes || !rectNodes.length) return [];
  return Array.from(rectNodes).map((rect) => {
    const { left, right } = rect.getBoundingClientRect();
    return { left, right };
  });
}

export { getBarLeftRightArray };
export default DpBarChart;
