import DpFilterComponent from "./DpFilterComponent";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React, { useEffect, useState } from "react";
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
  const [expandedLevel, setExpandedLevel] = useState(2);

  useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

  useEffect(() => {
    setFilterStates(props.filterStates);
  }, [props.filterStates]);

  const getFilter = () => {
    const filterChangedState = props.filterChangedState;
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
  };

  return (
    <Grid item md={expandedLevel} className={"outer-filter-container"}>
      <DpFilterComponent fullWidth={false} definition={definition} filterControl={getFilter()} />
    </Grid>
  );
}

export default DpFilterListItem;
