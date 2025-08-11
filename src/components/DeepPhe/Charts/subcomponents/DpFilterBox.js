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
      <Grid item>
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
      <Grid className={"filter-item"}>
        <Box
          align={"bottom"}
          bgcolor={theme.palette.background.default}
          sx={{
            marginBottom: 0,
            zIndex: 0,
            overflow: "visible",
          }}
        >
          {props.chart && props.chart}
          {filterObject && filterObject}
        </Box>
      </Grid>
    </React.Fragment>
  );
}

export default DpFilterBox;
