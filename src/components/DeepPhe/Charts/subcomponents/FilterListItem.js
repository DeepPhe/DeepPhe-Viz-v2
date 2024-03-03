import DiscreteList from "./DiscreteList";
import { Draggable } from "react-beautiful-dnd";
import ListItem from "@mui/material/ListItem";
import FilterComponent from "./FilterComponent";
import BooleanList from "./BooleanList";
import List from "@mui/material/List";
import CategoricalRangeSelector from "./CategoricalRangeSelector";
import React from "react";
import NumericRangeSelector from "./NumericRangeSelector";
import DpCheckboxList from "./DpCheckboxList";

function FilterListItem(props) {
  const [definition, setDefinition] = React.useState(props.definition);

  React.useEffect(() => {
    setDefinition(props.definition);
  }, [props.definition]);

  const getFilter = () => {
    const filterChangedState = props.filterChangedState;
    switch (definition.class) {
      case "discreteList":
        return <DiscreteList index={props.index} key={props.index} definition={definition} />;

      case "categoricalRangeSelector":
        return (
          <React.Fragment key={props.index}>
            <CategoricalRangeSelector
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
            <NumericRangeSelector
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
          <BooleanList
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
            <FilterComponent
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

export default FilterListItem;
