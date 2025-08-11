import DpFilterComponent from "./DpFilterComponent";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";

function DpFilterListItem(props) {
  const { definition, filterStates } = props;
  const EXPANSION_LEVEL_6 = 6;
  const [expandedLevel, setExpandedLevel] = useState(3);

  const getFilter = () => {
    let lvl = expandedLevel;
    if (definition.fieldName && definition.fieldName.toLowerCase() === "location") {
      lvl = 8;
    }

    const filterChangedState = props.filterChangedState;
    return (
      <DpCategoricalRangeSelector
        expandedLevel={lvl}
        fullWidth={true}
        key={props.index}
        definition={definition}
        broadcastUpdate={filterChangedState}
        filterStates={filterStates}
      />
    );
  };
  let lvl = expandedLevel;
  if (definition.fieldName && definition.fieldName.toLowerCase() === "location") {
    lvl = 12;
  }
  return (
    <Grid item xs={lvl} sx={{ flexGrow: 0 }} className={"outer-filter-container"}>
      <DpFilterComponent fullWidth={false} definition={definition} filterControl={getFilter()} />
    </Grid>
  );
}

export default DpFilterListItem;
