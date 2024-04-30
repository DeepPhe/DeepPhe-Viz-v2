import DpDiscreteList from "./DpDiscreteList";
import { Draggable } from "react-beautiful-dnd";
import ListItem from "@mui/material/ListItem";
import DpFilterComponent from "./DpFilterComponent";
import DpBooleanList from "./DpBooleanList";
import List from "@mui/material/List";
import DpCategoricalRangeSelector from "./DpCategoricalRangeSelector";
import React from "react";
import DpNumericRangeSelector from "./DpNumericRangeSelector";
import DpCheckboxList from "./DpCheckboxList";

function DpFilterListItem(props) {
  const [definition, setDefinition] = React.useState(props.definition);

  React.useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

  const getFilter = () => {
    const filterChangedState = props.filterChangedState;
    switch (definition.class) {
      case "DpDiscreteList":
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
      case "DpNumericRangeSelector":
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
        return <div>Unknown filter type</div>;
    }
  };

  return (
    <Draggable key={props.key} draggableId={definition.fieldName} index={props.index}>
      {(provided) => (
        <List>
          <ListItem sx={{ width: "100%" }} ref={provided.innerRef} {...provided.draggableProps}>
            <DpFilterComponent
              provided={provided}
              definition={definition}
              filterControl={getFilter()}
            />
          </ListItem>
        </List>
      )}
    </Draggable>
  );
}

export default DpFilterListItem;
