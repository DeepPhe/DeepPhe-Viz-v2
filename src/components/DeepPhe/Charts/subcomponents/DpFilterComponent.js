import React, { useEffect, useState } from "react";
import ToggleSwitch from "../../Buttons/ToggleSwitch";
import Grid from "@mui/material/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Label } from "@mui/icons-material";
import Typography from "@mui/material/Typography";

function DpFilterComponent(props) {
  const [definition, setDefinition] = useState(props.definition);
  const [filterControl, setFilterControl] = useState(props.filterControl);
  const [enabled, setEnabled] = useState(true);
  const [toggleInfo, setToggleInfo] = useState({
    fieldName: props.definition.fieldName,
    enabled: true,
  });

  useEffect(() => {
    if (props) {
      setDefinition(props.definition);
      setToggleInfo(toggleInfo);
    }
  }, [props.definition]);

  const getToggleSwitch = (definition) => {
    return (
      <React.Fragment>
        <ToggleButton
          sx={{ width: "100%" }}
          value="filterOn"
          selected={toggleInfo.enabled}
          onChange={() => {
            toggleInfo.enabled = !toggleInfo.enabled;
            definition.toggleFilterEnabled(toggleInfo);
          }}
        >
          <Typography fontSize={12} width={"100%"}>
            {definition.fieldName}
          </Typography>
        </ToggleButton>

        {/*<ToggleSwitch*/}
        {/*  wantsdivs={1}*/}
        {/*  key={definition.fieldName}*/}
        {/*  label={definition.fieldName}*/}
        {/*  fieldName={definition.fieldName}*/}
        {/*  theme="graphite-small"*/}
        {/*  enabled={true}*/}
        {/*  onStateChanged={toggleFilterEnabled}*/}
        {/*/>*/}
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
    const patientsMeetingEntireSetOfFilters = definition.patientsMeetingEntireSetOfFilters;
    const patientsMeetingThisFilterOnly = definition.patientsMeetingThisFilterOnly;
    const remainder =
      definition.numberOfPossiblePatientsForThisFilter -
      definition.patientsMeetingEntireSetOfFilters -
      definition.patientsMeetingThisFilterOnly;
    console.log(
      definition.fieldName,
      patientsMeetingEntireSetOfFilters,
      patientsMeetingThisFilterOnly,
      definition.numberOfPossiblePatientsForThisFilter,
      remainder
    );
    const patientsMeetingEntireSetOfFiltersGreaterThanZero = patientsMeetingEntireSetOfFilters > 0;
    const patientsMeetingThisFilterOnlyGreaterThanZero = patientsMeetingThisFilterOnly > 0;
    const remainderGreaterThanZero = remainder > 0;
    let dataArr = [];
    if (patientsMeetingEntireSetOfFiltersGreaterThanZero) {
      dataArr.push({
        name: "Matching All",
        description: patientsMeetingEntireSetOfFilters,
        value: patientsMeetingEntireSetOfFilters,
        color: "blue",
      });
    }
    if (patientsMeetingThisFilterOnlyGreaterThanZero) {
      dataArr.push({
        name: "Matching Filter",
        description: patientsMeetingThisFilterOnly - patientsMeetingEntireSetOfFilters,
        value: patientsMeetingThisFilterOnly,
        color: "lightblue",
      });
    }
    if (remainderGreaterThanZero) {
      dataArr.push({
        name: "Matching None",
        description:
          definition.numberOfPossiblePatientsForThisFilter -
          definition.patientsMeetingEntireSetOfFilters -
          definition.patientsMeetingThisFilterOnly,
        value:
          definition.numberOfPossiblePatientsForThisFilter -
          definition.patientsMeetingEntireSetOfFilters -
          definition.patientsMeetingThisFilterOnly,
        color: "lightgrey",
      });
    }

    return (
      <span className={"filter-stack-bar"}>
        <HSBar
          id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
          class={"filter-stack-bar"}
          fontColor="black"
          showTextIn
          height={47.3}
          data={dataArr}
        />
      </span>
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

export default DpFilterComponent;
