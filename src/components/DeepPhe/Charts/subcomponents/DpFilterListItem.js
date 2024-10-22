import DpDiscreteList from "./DpDiscreteList";
import DpFilterComponent from "./DpFilterComponent";
import DpBooleanList from "./DpBooleanList";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React from "react";
import DpNumericRangeSelector from "./DpNumericRangeSelector";
import DpCheckboxList from "./DpCheckboxList";
import Grid from "@mui/material/Grid";
import { Fab } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

function DpFilterListItem(props) {
  const [definition, setDefinition] = React.useState(props.definition);
  const fullWidth = definition.fieldName.toLowerCase() === "clockface";
  const EXPANSION_LEVEL_NONE = 0;
  const EXPANSION_LEVEL_3 = 3;
  const EXPANSION_LEVEL_6 = 6;
  const EXPANSION_LEVEL_9 = 9;
  const EXPANSION_LEVEL_12 = 12;
  const [expandedLevel, setExpandedLevel] = React.useState(EXPANSION_LEVEL_3);

  const getExpandContractButtons = () => {
    return (
      <React.Fragment>
        <Fab size="small" color="secondary" aria-label="zoomIn" onClick={handleExpandContract}>
          <ZoomInIcon />
        </Fab>
        <Fab size="small" color="secondary" aria-label="zoomOut" onClick={handleExpandContract}>
          <ZoomOutIcon />
        </Fab>
      </React.Fragment>
    );
  };

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

  React.useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition, expandedLevel]);

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
        return (
          <React.Fragment key={props.index}>
            <DpCategoricalRangeSelector
              expandedLevel={expandedLevel}
              fullWidth={fullWidth}
              key={props.index}
              definition={definition}
              broadcastUpdate={filterChangedState}
            />
          </React.Fragment>
        );
      //
      case "numericRangeSelector":
        return (
          <React.Fragment key={props.index}>
            <DpNumericRangeSelector
              fullWidth={fullWidth}
              key={props.index}
              definition={definition}
              broadcastUpdate={props.filterChangedState}
            />
          </React.Fragment>
        );

      case "checkboxList":
        return (
          <React.Fragment key={props.index}>
            <DpCheckboxList
              fullWidth={fullWidth}
              key={props.index}
              definition={definition}
              broadcastUpdate={props.filterChangedState}
            />
          </React.Fragment>
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

  let size = 4;
  // if (["t", "n", "m"].includes(definition.fieldName)) {
  //   size = 4;
  // }
  let lg = 2;
  if (fullWidth) {
    lg = 2;
  }
  return (
    // <Draggable key={props.key} draggableId={definition.fieldName} index={props.index}>
    //   {(provided) => (
    //     <List>
    //       <ListItem sx={{ width: "100%" }} ref={provided.innerRef} {...provided.draggableProps}>
    //<DpFilterComponent provided={provided} definition={definition} filterControl={getFilter()} />

    //jdljdl

    <Grid item md={expandedLevel} className={"outer-filter-container"}>
      {getExpandContractButtons()}
      <DpFilterComponent fullWidth={false} definition={definition} filterControl={getFilter()} />
    </Grid>

    //       </ListItem>
    //     </List>
    //   )}
    // </Draggable>
  );
}

export default DpFilterListItem;
