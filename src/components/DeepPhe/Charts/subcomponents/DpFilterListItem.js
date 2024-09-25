import DpDiscreteList from "./DpDiscreteList";
import DpFilterComponent from "./DpFilterComponent";
import DpBooleanList from "./DpBooleanList";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React from "react";
import DpNumericRangeSelector from "./DpNumericRangeSelector";
import DpCheckboxList from "./DpCheckboxList";
import Grid from "@mui/material/Grid";

function DpFilterListItem(props) {
  const [definition, setDefinition] = React.useState(props.definition);
  const fullWidth = definition.fieldName.toLowerCase() === "clockface";

  React.useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

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
  let lg = 4;
  if (fullWidth) {
    lg = 4;
  }
  return (
    // <Draggable key={props.key} draggableId={definition.fieldName} index={props.index}>
    //   {(provided) => (
    //     <List>
    //       <ListItem sx={{ width: "100%" }} ref={provided.innerRef} {...provided.draggableProps}>
    //<DpFilterComponent provided={provided} definition={definition} filterControl={getFilter()} />

    <Grid className={"outer-filter-container"} item md={lg} lg={lg}>
      <DpFilterComponent fullWidth={false} definition={definition} filterControl={getFilter()} />
    </Grid>

    //       </ListItem>
    //     </List>
    //   )}
    // </Draggable>
  );
}

export default DpFilterListItem;
