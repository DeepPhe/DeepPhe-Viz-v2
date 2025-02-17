import Grid from "@mui/material/Grid";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import DpBarChart from "./DpBarChart";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";

function DpFilterBox(props) {
  const theme = useTheme();
  const { definition, broadcastUpdate, dataset, series } = props;
  const [isChecked, setIsChecked] = useState(definition.enabled);

  const handleCheckboxChange = (event, definition) => {
    setIsChecked(event.target.checked);
    definition.enabled = event.target.checked;
    broadcastUpdate(definition);
  };

  let filterObject = undefined;
  if (
    definition.class === "categoricalRangeSelector" ||
    definition.class === "numericRangeSelector"
  ) {
    filterObject = (
      <DpBarChart
        wantSlider={true}
        wantCheckboxes={false}
        definition={props.definition}
        dataset={dataset}
        series={series}
        broadcastUpdate={broadcastUpdate}
      ></DpBarChart>
    );
  } else if (definition.class === "valueSelector") {
    filterObject = (
      <DpBarChart
        wantSlider={false}
        wantCheckboxes={true}
        definition={props.definition}
        dataset={dataset}
        series={series}
        broadcastUpdate={broadcastUpdate}
      ></DpBarChart>
    );
  }

  return (
    <React.Fragment>
      <Grid item md={2}>
        <Box
          align={"bottom"}
          bgcolor={theme.palette.background.default}
          sx={{ textAlign: "end", marginBottom: 0, marginRight: 0, width: "100%" }}
        >
          <Typography sx={{ textAlign: "left", fontSize: "18px" }}>
            {definition.fieldName}
          </Typography>
          <Typography
            sx={{
              "& .MuiSvgIcon-root": { fontSize: 14 },
              marginTop: "10px",
              marginLeft: "5px",
              textAlign: "left",
              fontSize: "12px",
            }}
          >
            Enabled:
          </Typography>
          <Checkbox
            sx={{
              "& .MuiSvgIcon-root": { fontSize: 14 },
              marginTop: "-20px",
              marginLeft: "0px",
              textAlign: "left",
            }}
            size={"small"}
            checked={isChecked}
            onChange={(event) => handleCheckboxChange(event, definition)}
            name={"exampleCheckbox"}
          />
        </Box>
      </Grid>
      <Grid item md={10} className={"filter-item"} sx={{ position: "relative" }}>
        <Box
          align={"bottom"}
          bgcolor={theme.palette.background.default}
          sx={{
            marginBottom: 0,
            width: "100%",
            position: "relative",
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
