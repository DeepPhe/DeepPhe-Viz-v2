import DiscreteList from "./DiscreteList";
import { Draggable } from "react-beautiful-dnd";
import ListItem from "@mui/material/ListItem";
import FilterComponent from "./FilterComponent";
import BooleanList from "./BooleanList";
import List from "@mui/material/List";
import CategoricalRangeSelector from "./CategoricalRangeSelector";
import React from "react";
import NumericRangeSelector from "./NumericRangeSelector";

function FilterListItem({ key, index, filterDefinition, filterChangedState }) {
  const getFilter = () => {
    switch (filterDefinition.class) {
      case "discreteList":
        return <DiscreteList index={index} key={index} definition={filterDefinition} />;

      case "categoricalRangeSelector":
        return (
          <React.Fragment key={index}>
            <CategoricalRangeSelector
              key={index}
              definition={filterDefinition}
              broadcastUpdate={filterChangedState}
            />
          </React.Fragment>
        );
      //
      case "numericRangeSelector":
        return (
          <React.Fragment key={index}>
            <NumericRangeSelector
              key={index}
              definition={filterDefinition}
              broadcastUpdate={filterChangedState}
            />
          </React.Fragment>
        );

      case "booleanList":
        return (
          <BooleanList
            key={index}
            filterDefinition={filterDefinition}
            //broadcastUpdate={filterChangedState}
          />
        );
      default:
        return <div>Unknown filter type</div>;
    }
  };

  return (
    <Draggable key={index} draggableId={filterDefinition.fieldName} index={index}>
      {(provided) => (
        <List>
          <ListItem
            sx={{ width: "100%" }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <FilterComponent filterDefinition={filterDefinition} filter={getFilter()} />
          </ListItem>
        </List>
      )}
    </Draggable>
  );
}

export default FilterListItem;
