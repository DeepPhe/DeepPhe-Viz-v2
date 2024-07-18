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

  React.useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

  const getFilter = () => {
    const filterChangedState = props.filterChangedState;
    switch (definition.class) {
      case "discreteList":
        return <DpDiscreteList index={props.index} key={props.index} definition={definition} />;

      case "categoricalRangeSelector":
        return (
          <React.Fragment key={props.index}>
            <DpCategoricalRangeSelector
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
              key={props.index}
              definition={definition}
              broadcastUpdate={props.filterChangedState}
            />
          </React.Fragment>
        );
      case "booleanList":
        return (
          <DpBooleanList
            key={props.index}
            definition={definition}
            broadcastUpdate={props.filterChangedState}
          />
        );
      default:
        return <div>Unknown filter type {definition.class}</div>;
    }
  };

  let size = 6;
  if (["t", "n", "m"].includes(definition.fieldName)) {
    size = 4;
  }

  return (
    // <Draggable key={props.key} draggableId={definition.fieldName} index={props.index}>
    //   {(provided) => (
    //     <List>
    //       <ListItem sx={{ width: "100%" }} ref={provided.innerRef} {...provided.draggableProps}>
    //<DpFilterComponent provided={provided} definition={definition} filterControl={getFilter()} />

    <Grid item xs={size}>
      <DpFilterComponent definition={definition} filterControl={getFilter()} />
    </Grid>

    //       </ListItem>
    //     </List>
    //   )}
    // </Draggable>
  );
}

export default DpFilterListItem;
