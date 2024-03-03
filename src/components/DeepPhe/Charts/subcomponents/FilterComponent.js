import React, { useEffect, useState } from "react";
import ToggleSwitch from "../../Buttons/ToggleSwitch";
import $ from "jquery";
import Grid from "@mui/material/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function FilterComponent(props) {
  const [definition, setDefinition] = useState(props.definition);
  const [filterControl, setFilterControl] = useState(props.filterControl);
  const [toggleFilterEnabled, setToggleFilterEnabled] = useState(props.toggleFilterEnabled);

  useEffect(() => {
    if (props) {
      setDefinition(props.definition);
    }
  }, [props.definition]);

  const getToggleSwitch = (definition) => {
    return (
      <React.Fragment>
        <ToggleSwitch
          wantsdivs={1}
          key={definition.fieldName}
          label={definition.fieldName}
          fieldName={definition.fieldName}
          theme="graphite-small"
          enabled={true}
          onStateChanged={toggleFilterEnabled}
        />
      </React.Fragment>
    );
  };

  const getSwitch = (definition) => {
    {
      return getToggleSwitch(definition);
    }
  };

  const getBar = (definition) => {
    console.log(definition.fieldName, definition.patientsMeetingThisFilterOnly);
    if (!definition.patientsMeetingThisFilterOnly) {
      return null;
    }
    return (
      <HSBar
        id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
        showTextIn
        height={47.3}
        data={[
          {
            name: "",
            value: definition.patientsMeetingThisFilterOnly,
            color: "green",
          },
        ]}
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
        id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}
      >
        <div id={"boolean-list-row"} className={"row filter-center-rows"}>
          <Grid
            item
            md={1}
            className="filter-inner-container no_padding_grid"
            {...props.provided.dragHandleProps}
          >
            {getSwitch(definition)}
          </Grid>
          <Grid item md={8} className="filter-inner-container no_padding_grid filter-control">
            {filterControl}
          </Grid>
          <Grid item md={3} className="filter-inner-container no_padding_grid">
            {getBar(definition)}
          </Grid>
        </div>
      </div>
    </React.Fragment>
  );
}

export default FilterComponent;
