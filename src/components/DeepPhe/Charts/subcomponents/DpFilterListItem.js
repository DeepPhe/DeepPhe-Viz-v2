import DpDiscreteList from "./DpDiscreteList";
import DpFilterComponent from "./DpFilterComponent";
import DpBooleanList from "./DpBooleanList";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React, { useEffect, useState } from "react";
import DpNumericRangeSelector from "./DpNumericRangeSelector";
import DpCheckboxList from "./DpCheckboxList";
import Grid from "@mui/material/Grid";

function DpFilterListItem(props) {
  const [definition, setDefinition] = useState(props.definition);
  const [filterStates, setFilterStates] = useState(props.filterStates);
  const filterInitialized = props.filterInitialized;
  const fullWidth = definition.fieldName.toLowerCase() === "clockface";
  const EXPANSION_LEVEL_NONE = 0;
  const EXPANSION_LEVEL_3 = 3;
  const EXPANSION_LEVEL_6 = 6;
  const EXPANSION_LEVEL_9 = 9;
  const EXPANSION_LEVEL_12 = 12;
  const [expandedLevel, setExpandedLevel] = useState(4);

  useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

  useEffect(() => {
    setFilterStates(props.filterStates);
  }, [props.filterStates]);

  const handleExpandContract = (e) => {
    const id = e.currentTarget.getAttribute("aria-label");
    if (id === "zoomIn") {
      if (expandedLevel === EXPANSION_LEVEL_NONE) {
        setExpandedLevel(EXPANSION_LEVEL_3);
      } else if (expandedLevel === EXPANSION_LEVEL_3) {
        setExpandedLevel(EXPANSION_LEVEL_6);
      } else if (expandedLevel === EXPANSION_LEVEL_6) {
        setExpandedLevel(EXPANSION_LEVEL_9);
      } else if (expandedLevel === EXPANSION_LEVEL_9) {
        setExpandedLevel(EXPANSION_LEVEL_12);
      }
    } else if (id === "zoomOut") {
      if (expandedLevel === EXPANSION_LEVEL_12) {
        setExpandedLevel(EXPANSION_LEVEL_9);
      } else if (expandedLevel === EXPANSION_LEVEL_9) {
        setExpandedLevel(EXPANSION_LEVEL_6);
      } else if (expandedLevel === EXPANSION_LEVEL_6) {
        setExpandedLevel(EXPANSION_LEVEL_3);
      } else if (expandedLevel === EXPANSION_LEVEL_3) {
        setExpandedLevel(EXPANSION_LEVEL_NONE);
      }
    }
  };

  const getFilter = () => {
    const filterChangedState = props.filterChangedState;
    switch (definition.class) {
      case "discreteList":
        return (
          <DpDiscreteList
            fullWidth={fullWidth}
            index={props.index}
            key={props.index}
            definition={definition}
          />
        );

      case "categoricalRangeSelector":
      case "valueSelector":
        return (
          <DpCategoricalRangeSelector
            expandedLevel={expandedLevel}
            fullWidth={fullWidth}
            key={props.index}
            definition={definition}
            broadcastUpdate={filterChangedState}
            filterStates={filterStates}
            filterInitialized={filterInitialized}
          />
        );

      case "numericRangeSelector":
        return (
          <DpNumericRangeSelector
            fullWidth={fullWidth}
            key={props.index}
            definition={definition}
            broadcastUpdate={props.filterChangedState}
          />
        );

      // case "valueSelector":
      //   return (
      //     <DpValueSelector
      //       fullWidth={fullWidth}
      //       key={props.index}
      //       definition={definition}
      //       broadcastUpdate={props.filterChangedState}
      //     />
      //   );

      case "checkboxList":
        return (
          <DpCheckboxList
            fullWidth={fullWidth}
            key={props.index}
            definition={definition}
            broadcastUpdate={props.filterChangedState}
          />
        );

      case "booleanList":
        return (
          <DpBooleanList
            fullWidth={fullWidth}
            key={props.index}
            definition={definition}
            broadcastUpdate={props.filterChangedState}
          />
        );

      default:
        return <div>Unknown filter type {definition.class}</div>;
    }
  };

  return (
    <Grid item md={expandedLevel} className={"outer-filter-container"}>
      <DpFilterComponent fullWidth={false} definition={definition} filterControl={getFilter()} />
    </Grid>
  );
}

export default DpFilterListItem;
