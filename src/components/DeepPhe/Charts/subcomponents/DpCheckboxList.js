import React, { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel, FormGroup } from "@mui/material";
import "./DpCheckboxList.css";
import { BarChart } from "@mui/x-charts";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";
import { useTheme } from "@mui/styles";
import DpFilterBox from "./DpFilterBox";

function DpCheckboxList(props) {
  const definition = props.definition;

  const getInitialCheckboxes = (checkboxes) => {
    let initialCheckboxes = {};
    checkboxes.forEach((checkbox) => {
      const name = checkbox.name;
      initialCheckboxes[name] = checkbox.checked;
    });
    console.log(initialCheckboxes);
    return initialCheckboxes;
  };

  const [checkedSeries, setCheckedSeries] = useState(getInitialCheckboxes(definition.checkboxes));

  const getCheckboxName = (checkbox) => {
    return definition.fieldName + "_" + checkbox.name + "_checkbox";
  };

  const handleCheckboxChange = (event) => {
    setCheckedSeries({
      ...checkedSeries,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    props.broadcastUpdate(definition);
  }, [definition]);
  const dataset = [
    {
      value: 50,
      month: "m",
    },
    {
      value: 10,
      month: "f",
    },
    {
      value: 40,
      month: "u",
    },
  ];

  const setAxisData = (d) => {
    console.log(d);
  };

  const sizingProps = { height: 150 };
  const categories = props.definition.checkboxes.map((checkbox) => checkbox.name);
  const hue = checkedSeries["male"] ? "green" : "purple";

  const seriesA = {
    data: [2, 3, 1, 3, 8, 6],
    label: "Patients Meeting All Filters",
    color: "#187bcd",
    id: "patients-meeting-all-filters",
  };
  const seriesB = {
    data: [3, 1, 4, 2, 4, 2],
    label: "Patients Meeting This Filter",
    color: "#2a9df4",
    id: "patients-meeting-this-filter",
  };
  const seriesC = {
    data: [3, 2, 4, 3, 2, 3],
    label: "Remaining Patients",
    color: "#d0efff",
    id: "remaining-patients",
  };
  const seriesArray = [
    { ...seriesA, stack: "total" },
    { ...seriesB, stack: "total" },
    { ...seriesC, stack: "total" },
  ];
  let adjustedSeriesArray = [...seriesArray];
  for (let i = 0; i < seriesArray.length; i++) {
    adjustedSeriesArray[i].data = seriesArray[i].data.slice(
      seriesArray[i].data.length - categories.length
    );
  }

  const getList = () => {
    let width = "100%";
    let mt = 0;
    let mr = 0;
    let marginLeftCb = "0px";
    const numCheckboxes = definition.checkboxes.length;
    if (numCheckboxes === 2) {
      width = "59%";
      mt = "-36px";
      mr = "-48px";
      marginLeftCb = "1px";
    }
    if (numCheckboxes === 3) {
      width = "67.25%";
    }
    if (numCheckboxes === 4) {
      width = "80%";
      mt = "-36px";
      mr = "-64px";
    }
    const theme = useTheme();
    return (
      <FormGroup
        alignItems="center"
        row
        sx={{
          width: width,
          marginTop: mt,
          marginLeft: mr,
          justifyContent: "space-between",
          fontSize: "12px",
          marginTop: "-36px",
        }}
      >
        {Object.keys(checkedSeries).map((key) => (
          <FormControlLabel
            sx={{
              "& .MuiFormControlLabel-label": { fontSize: "14px" },
              color: theme.palette.text.primary,
            }}
            key={key}
            labelPlacement={"bottom"}
            control={
              <Checkbox
                sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
                size={"small"}
                checked={checkedSeries[key]}
                onChange={handleCheckboxChange}
                name={key}
              />
            }
            label={""}
          />
        ))}
      </FormGroup>
    );
  };

  const getChart = () => {
    return (
      <span id={"myChart"}>
        <BarChart
          onAxisClick={(event, d) => setAxisData(d)}
          colors={blueberryTwilightPalette}
          slotProps={{ legend: { hidden: true } }}
          margin={{ top: 10, right: 30, bottom: 30, left: 30 }}
          xAxis={[
            {
              scaleType: "band",
              valueFormatter: (value) => `${value}`,
              data: categories, // colorMap: {
              //   type: "ordinal",
              //   values: ["m", "f", "u"],
              //   colors: ["blue", hue, "blue"],
              // },
            },
          ]}
          series={adjustedSeriesArray}
          {...sizingProps}
        />
      </span>
    );
  };
  return (
    <React.Fragment>
      <DpFilterBox
        fullWidth={props.fullWidth}
        definition={definition}
        chart={getChart()}
        list={getList()}
        seriesArray={adjustedSeriesArray}
      />
    </React.Fragment>
  );
}

export default DpCheckboxList;
