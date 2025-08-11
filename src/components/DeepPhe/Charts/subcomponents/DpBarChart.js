import React, { useEffect, useState } from "react";
import { axisClasses, BarChart } from "@mui/x-charts";
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
  const { wantLogs, series, dataset, definition, broadcastUpdate } = props;
  const { fieldName, categoricalRange } = definition;
  const [checkedItems, setCheckedItems] = useState(undefined);
  const [oldDefinition, setOldDefinition] = useState(JSON.parse(JSON.stringify(definition)));

  const setItemData = (d) => {
    //console.log(d);
    //console.log(dataset[d.dataIndex].category);
    if (checkedItems.includes(d.dataIndex)) {
      setCheckedItems((prev) => prev.filter((item) => item !== d.dataIndex));
    } else {
      setCheckedItems((prev) => [...prev, d.dataIndex]);
    }
  };

  const definitionIsEqual = (def1, def2) => {
    if (wantLogs) {
      const str1 = JSON.stringify(def1);
      const str2 = JSON.stringify(def2);

      for (let i = 0; i < Math.max(str1.length, str2.length); i++) {
        if (str1[i] !== str2[i]) {
          //console.log(`Difference at index ${i}:`);
          //console.log(`str1[${i}]:`, str1.toString().substring(i - 40, i + 40));
          //console.log(`str2[${i}]:`, str2.toString().substring(i - 40, i + 40));
          break;
        }
      }
    }
    return isEqual(def1, def2);
  };

  useEffect(() => {
    if (checkedItems === undefined && dataset !== undefined) {
      setCheckedItems(
        dataset.map((item, idx) => {
          if (definition.selectedCategoricalRange !== undefined) {
            if (
              definition.selectedCategoricalRange.includes(item.category)
              // ||
              // definition.selectedCategoricalRange.includes(
              //   item.category.replace(fieldName + ".", "")
              // )
            ) {
              return idx;
            }
            return -1; // Exclude this index if not in selectedCategoricalRange
          }
          return idx;
        })
      );
    }
  }, []);

  useEffect(() => {
    if (checkedItems !== undefined && checkedItems.length > 0) {
      getSelectedCategoricalRange().then((selectedCategoricalRange) => {
        definition.selectedCategoricalRange = selectedCategoricalRange;
        if (wantLogs) {
          //console.log(definition.fieldName + ":getSelectedCategoricalRange");
          //console.log("oldDefinition", oldDefinition);
          //console.log("definition", definition);
        }
        if (!definitionIsEqual(oldDefinition, definition)) {
          broadcastUpdate(definition);
          setOldDefinition(JSON.parse(JSON.stringify(definition)));
        }
      });
    }
  }, [checkedItems]);

  const getSelectedCategoricalRange = () => {
    return new Promise((resolve) => {
      let selectedCategoricalRange = [];

      if (checkedItems !== undefined) {
        checkedItems.forEach((value) => {
          if (
            !definition ||
            !definition.patientCountsByCategory ||
            !definition.patientCountsByCategory[value] ||
            !definition.patientCountsByCategory[value].category
          ) {
            console.warn(
              `Category at index ${value} is undefined in patientCountsByCategory for field ${fieldName}.`
            );
            return;
          }
          selectedCategoricalRange.push(definition.patientCountsByCategory[value].category);
        });
      }
      resolve(selectedCategoricalRange);
    });
  };

  const getChart = () => {
    const valueFormatter = (code, context) => {
      if (context.location === "tooltip") {
        const idx = definition.abbrevCategories.indexOf(code);
        if (idx !== -1) {
          return definition.categoricalRange[idx];
        }
        return code;
      }
      const idx = definition.categoricalRange.indexOf(code);
      if (idx !== -1) {
        return definition.abbrevCategories[idx];
      }

      if (code.includes("Stage")) {
        // Handle specific case for "Stage" codes
        if (code.includes("Stage.Stage")) {
          return code.replace("Stage.Stage ", "");
        }
        // Handle other cases where "Stage" is part of the code
        return code.replace("Stage.", "");
      }
      if (typeof code === "string" && code.includes(".")) {
        return code.substring(code.lastIndexOf(".") + 1, code.length);
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
                tickPlacement: "middle",
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
            height={100}
            tooltip={{ content: <CustomTooltip />, trigger: "axis" }}
            onItemClick={(event, d) => setItemData(d)}
          ></BarChart>
        </span>
      </React.Fragment>
    );
  };

  return <React.Fragment>{getChart()}</React.Fragment>;
}

export default DpBarChart;
