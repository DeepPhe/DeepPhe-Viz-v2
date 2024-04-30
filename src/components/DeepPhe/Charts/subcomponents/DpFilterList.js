import { DragDropContext, Droppable } from "react-beautiful-dnd";
import List from "@mui/material/List";
import React from "react";
import DpFilterListItem from "./DpFilterListItem.js";

function DpFilterList(props) {
  const [guiInfo, setGuiInfo] = React.useState(props.guiInfo);
  const [filterGuiInfo, setFilterGuiInfo] = React.useState(props.filterGuiInfo);
  const [filterGuiInfoKeys, setFilterGuiInfoKeys] = React.useState(props.filterGuiInfoKeys);
  const [filterDefinitions, setFilterDefinitions] = React.useState(props.filterDefinitions);

  React.useEffect(() => {
    setFilterDefinitions(props.filterDefinitions);
  }, [props.filterDefinitions]);
  const getFilters = () => {
    let filters = [];
    filterGuiInfo[guiInfo].forEach((filterInfo, index) => {
      filters.push({
        definitionIdx: filterDefinitions.findIndex(
          (a) => a.fieldName === filterInfo.definitionName
        ),
        index: index,
      });
    });
    return filters;
  };

  return (
    <React.Fragment key={guiInfo}>
      <div>
        {guiInfo}
        <>
          <DragDropContext>
            <Droppable droppableId="droppable">
              {(provided) => (
                <List
                  justifyContent={"center"}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {getFilters().map((filter, index) => (
                    <DpFilterListItem
                      key={filterDefinitions[filter.definitionIdx].fieldName}
                      definition={filterDefinitions[filter.definitionIdx]}
                      index={index}
                      moveListItem={props.moveListItem}
                      filterChangedState={props.filterChangedState}
                    />
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </>
      </div>
    </React.Fragment>
  );
}

export default DpFilterList;
