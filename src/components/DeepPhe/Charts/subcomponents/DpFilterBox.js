import Grid from "@mui/material/Grid";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import DpBarChart from "./DpBarChart";

function DpFilterBox(props) {
  const filterInitialized = props.filterInitialized;
  const theme = useTheme();
  const { definition, broadcastUpdate, dataset, series } = props;
  const [isChecked, setIsChecked] = useState(definition.enabled);

  const handleCheckboxChange = (event, definition) => {
    console.log("Checkbox changed:", event.target.checked);
    setIsChecked(event.target.checked);
    definition.enabled = event.target.checked;
    broadcastUpdate(definition);
  };

  let filterObject = undefined;

  filterObject = (
    <DpBarChart
      definition={props.definition}
      dataset={dataset}
      series={series}
      broadcastUpdate={broadcastUpdate}
      filterInitialized={filterInitialized}
    ></DpBarChart>
  );

  return (
    <React.Fragment>
      <Grid size={12} sx={{ width: "100%" }}>
        <Box
          sx={{
            top: 0,
            right: 0,
            zIndex: 1,
            padding: "10px",
          }}
        >
          <label>{definition.fieldName}</label>
        </Box>
      </Grid>
      <Grid size={12} className={"filter-item"} sx={{ width: "100%" }}>
        <Box
          align={"bottom"}
          bgcolor={theme.palette.background.default}
          sx={{
            marginBottom: 0,
            width: "100%",
            zIndex: 0,
            overflow: "visible",
          }}
        >
          {props.chart && props.chart}
          {props.slider && props.slider}
          {filterObject && filterObject}
          {props.list && props.list}
        </Box>
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
