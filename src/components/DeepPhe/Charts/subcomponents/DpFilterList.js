import React from "react";
import DpFilterListItem from "./DpFilterListItem.js";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

function DpFilterList(props) {
  const { filterDefinitions, filterStates } = props;

  const getFilterStateChange = (definition) => {
    return props.filterChangedState(definition);
  };

  const getFilters = () => {
    if (!filterDefinitions || !props.filterGuiInfo[props.guiInfo]) {
      return [];
    }
    return props.filterGuiInfo[props.guiInfo].map((filterInfo, index) => ({
      definitionIdx: filterDefinitions.findIndex((a) => a.fieldName === filterInfo.definitionName),
      index: index,
    }));
  };
  const filters = getFilters();
  return (
    <React.Fragment key={`${props.guiInfo}-${props.filterStates}`}>
      <Grid item md={12} paddingRight={0} paddingTop={0}>
        <Grid
          container
          justifyContent={"right"}
          sx={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Grid
            item
            sx={{
              display: "flex",
              justifyContent: "right",
            }}
            xs={12}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "10px",
                textAlign: "right",
              }}
            >
              {props.guiInfo}
            </Typography>
          </Grid>
          {filters.map((filter, index) => {
            const definition = filterDefinitions[filter.definitionIdx];
            return (
              <DpFilterListItem
                numFiltersInSection={filters.length}
                key={definition.fieldName || index}
                definition={definition}
                index={index}
                moveListItem={props.moveListItem}
                filterChangedState={getFilterStateChange}
                filterStates={filterStates}
              />
            );
          })}
        </Grid>
      </Grid>
      {/*</Box>*/}
    </React.Fragment>
  );
}

export default DpFilterList;
