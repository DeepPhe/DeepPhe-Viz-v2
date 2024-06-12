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

  const setAxisData = (d) => {
    console.log(d);
  };

  const sizingProps = { height: 200, width: 400 };
  const categories = props.definition.checkboxes.map((checkbox) => checkbox.name);
  const hue = checkedSeries["male"] ? "green" : "purple";

  const getList = () => {
    const theme = useTheme();
    return (
      <FormGroup row sx={{ fontSize: "12px" }}>
        {Object.keys(checkedSeries).map((key) => (
          <FormControlLabel
            sx={{
              "& .MuiFormControlLabel-label": { fontSize: "14px" },
              color: theme.palette.text.primary,
            }}
            key={key}
            control={
              <Checkbox
                sx={{ "& .MuiSvgIcon-root": { fontSize: 14 } }}
                size={"small"}
                checked={checkedSeries[key]}
                onChange={handleCheckboxChange}
                name={key}
              />
            }
            label={key}
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
          layout="horizontal"
          slotProps={{ legend: { hidden: true } }}
          yAxis={[
            {
              scaleType: "band",
              valueFormatter: (value) => `${value}`,
              data: categories,
              colorMap: {
                type: "ordinal",
                values: ["m", "f", "u"],
                colors: ["blue", hue, "blue"],
              },
            },
          ]}
          series={[
            { ...seriesA, stack: "total" },
            { ...seriesB, stack: "total" },
            { ...seriesC, stack: "total" },
          ]}
          {...sizingProps}
        />
      </span>
    );
  };
  return (
    <React.Fragment>
      <DpFilterBox definition={definition} chart={getChart()} list={getList()} />
    </React.Fragment>
  );
}

export default DpCheckboxList;
