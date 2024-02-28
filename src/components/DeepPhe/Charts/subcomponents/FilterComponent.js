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
    (filter) =>
    ({ enabled }) => {
      const selector =
        "#" + filter.props.definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row";
      if (enabled) {
        $(selector).removeClass("overlay-row");
      } else {
        $(selector).addClass("overlay-row");
      }
    };

  const getToggleSwitch = (filter) => {
    return (
      <React.Fragment>
        <ToggleSwitch
          wantsdivs={1}
          key={filter.props.definition.fieldName}
          label={filter.props.definition.fieldName}
          theme="graphite-small"
          enabled={true}
          onStateChanged={toggleFilterEnabled(filter)}
        />
      </React.Fragment>
    );
  };

  const getSwitch = () => {
    {
      return getToggleSwitch(props.filter);
    }
  };

  const getBar = () => {
    return (
      <HSBar
        id={props.filter.props.definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
        showTextIn
        height={47.3}
        data={[
          {
            name: "",
            value: props.filter.props.patientsMatchingThisFilter,
            color: "green",
          },
        ]}
      />
    );
  };

  if (!props) {
    return null;
  }

  $(document).ready(function () {
    $(".overlay-row-container").on("mousedown", function (e) {
      e.stopPropagation();
    });
  });

  return (
    <React.Fragment>
      <div
        onMouseDown={(e) => {
          console.log(e);
        }}
        className={"overlay-row-container"}
        id={
          props.filter.props.definition.fieldName.replaceAll(" ", "-").toLowerCase() +
          "-overlay-row"
        }
      >
        <div id={"boolean-list-row"} className={"row filter-center-rows"}>
          <Grid item md={2} className="filter-inner-container no_padding_grid">
            {getSwitch()}
          </Grid>
          <Grid item md={7} className="filter-inner-container no_padding_grid filter-control">
            {props.filterControl}
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
