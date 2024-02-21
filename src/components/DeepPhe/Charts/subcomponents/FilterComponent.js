import React, { useState } from "react";
import ToggleSwitch from "../../Buttons/ToggleSwitch";
import $ from "jquery";
import Grid from "@mui/material/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function FilterComponent(props) {
  const [open, setOpen] = useState(true);
  const toggleFilterEnabled =
    (filterDefinition) =>
    ({ enabled }) => {
      const selector =
        "#" + filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row";
      if (enabled) {
        $(selector).removeClass("overlay-row");
      } else {
        $(selector).addClass("overlay-row");
      }
    };

  const getToggleSwitch = (filterDefinition) => {
    return (
      <React.Fragment>
        <ToggleSwitch
          wantsdivs={1}
          key={filterDefinition.fieldName}
          label={filterDefinition.fieldName}
          theme="graphite-small"
          enabled={true}
          onStateChanged={toggleFilterEnabled(filterDefinition)}
        />
      </React.Fragment>
    );
  };

  const getSwitch = () => {
    {
      return getToggleSwitch(props.filterDefinition);
    }
  };

  const getBar = () => {
    return (
      <HSBar
        id={props.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
        showTextIn
        height={47.3}
        data={props.filterDefinition.filterData}
      />
    );
  };

  if (!props) {
    return null;
  }
  return (
    <React.Fragment>
      <div
        className={"overlay-row-container"}
        id={props.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}
      >
        <div id={"boolean-list-row"} className={"row filter-center-rows"}>
          <Grid item md={2} className="filter-inner-container no_padding_grid">
            {getSwitch()}
          </Grid>
          <Grid item md={7} className="filter-inner-container no_padding_grid">
            {props.filter}
          </Grid>
          <Grid item md={3} className="filter-inner-container no_padding_grid">
            {getBar()}
            <IconButton onClick={() => setOpen(!open)} aria-label="expand" size="small">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Grid>
        </div>
      </div>
    </React.Fragment>
  );
}

export default FilterComponent;
