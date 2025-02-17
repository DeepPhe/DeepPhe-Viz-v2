import React, { useEffect, useState } from "react";
import DpFilterListItem from "./DpFilterListItem.js";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

function DpFilterList(props) {
  const [filterDefinitions, setFilterDefinitions] = useState(props.filterDefinitions);
  const [filterStates, setFilterStates] = useState(props.filterStates);
  const [newItemsReady, setNewItemsReady] = useState(false);

  useEffect(() => {
    if (props.filterDefinitions) {
      setFilterDefinitions(props.filterDefinitions);
      setNewItemsReady(true);
    }
  }, [props.filterDefinitions]);

  useEffect(() => {
    if (props.filterStates) {
      setFilterStates(props.filterStates);
      setNewItemsReady(true);
    }
  }, [props.filterStates]);

  const getFilters = () => {
    if (!filterDefinitions || !props.filterGuiInfo[props.guiInfo]) {
      return [];
    }
    return props.filterGuiInfo[props.guiInfo].map((filterInfo, index) => ({
      definitionIdx: filterDefinitions.findIndex((a) => a.fieldName === filterInfo.definitionName),
      index: index,
    }));
  };

  return (
    <React.Fragment key={`${props.guiInfo}-${props.filterStates}`}>
      <Box className={props.guiInfo + "guiinfo"} sx={{ width: "100%", p: 2 }}>
        <Grid container rowSpacing={0} className={"filter-list-container"}>
          {getFilters().map((filter, index) => {
            const definition = newItemsReady
              ? filterDefinitions[filter.definitionIdx]
              : props.oldFilterDefinitions?.[filter.definitionIdx];
            if (!definition) {
              return null;
            }
            return (
              <DpFilterListItem
                key={definition.fieldName || index}
                definition={definition}
                index={index}
                moveListItem={props.moveListItem}
                filterChangedState={props.filterChangedState}
                filterStates={newItemsReady ? filterStates : props.oldFilterStates}
              />
            );
          })}
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default DpFilterList;
