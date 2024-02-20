import DiscreteList from "./DiscreteList";
import { Draggable } from "react-beautiful-dnd";
import ListItem from "@mui/material/ListItem";
import FilterComponent from "./FilterComponent";
import BooleanList from "./BooleanList";

function FilterListItem({ key, index, filterDefinition, filterChangedState }) {
  const getFilter = () => {
    switch (filterDefinition.class) {
      case "discreteList":
        return <DiscreteList index={index} key={index} definition={filterDefinition} />;

      // case "categoricalRangeSelector":
      //   return (
      //     <CategoricalRangeSelector
      //       key={index}
      //       definition={filterDefinition}
      //       broadcastUpdate={filterChangedState}
      //     />
      //   );
      //
      // case "numericRangeSelector":
      //   return (
      //     <NumericRangeSelector
      //       key={index}
      //       definition={filterDefinition}
      //       broadcastUpdate={filterChangedState}
      //     />
      //   );
      //
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
        <ListItem
          sx={{ width: "100%" }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <FilterComponent filterDefinition={filterDefinition} filter={getFilter()} />
        </ListItem>
      )}
    </Draggable>
  );
}

export default FilterListItem;
