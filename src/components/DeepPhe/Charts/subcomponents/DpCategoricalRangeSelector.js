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

  const broadcastUpdate = (definition) => {
    props.broadcastUpdate(definition);
  };

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
  const seriesArray = [
    { ...seriesA, stack: "total" },
    { ...seriesB, stack: "total" },
    { ...seriesC, stack: "total" },
  ];

  return (
    <React.Fragment>
      <DpFilterBox
        seriesArray={seriesArray}
        definition={definition}
        type={"BarChartWithSlider"}
      ></DpFilterBox>
    </React.Fragment>
  );
}

export default DpCategoricalRangeSelector;
