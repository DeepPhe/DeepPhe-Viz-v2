import DiscreteList from "./DiscreteList";
import CategoricalRangeSelector from "./CategoricalRangeSelector";
import NumericRangeSelector from "./NumericRangeSelector";
import BooleanList from "./BooleanList";
import { Draggable } from "react-beautiful-dnd";
import ListItem from "@mui/material/ListItem";

function FilterListItem({ key, index, filterDefinition, data, filterChangedState }) {
  const getFilter = () => {
    switch (filterDefinition.class) {
      case "discreteList":
        return <DiscreteList key={index} definition={filterDefinition} data={data} />;

      case "categoricalRangeSelector":
        return (
          <CategoricalRangeSelector
            key={index}
            definition={filterDefinition}
            broadcastUpdate={filterChangedState}
            data={data}
          />
        );

      case "numericRangeSelector":
        return (
          <NumericRangeSelector
            key={index}
            definition={filterDefinition}
            broadcastUpdate={filterChangedState}
            data={data}
          />
        );

      case "booleanList":
        return (
          <BooleanList
            key={index}
            definition={filterDefinition}
            broadcastUpdate={filterChangedState}
            data={data}
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
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {filterDefinition.fieldName}
          {getFilter()}
        </ListItem>
      )}
    </Draggable>
  );
}

export default FilterListItem;
