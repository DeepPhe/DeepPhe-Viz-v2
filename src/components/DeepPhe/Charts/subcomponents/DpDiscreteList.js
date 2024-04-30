import React from "react";
import { ToggleButton } from "@mui/material";

function DpDiscreteList(props) {
  if (!props) {
    return null;
  }
  const { definition } = props;
  const items = definition.globalPatientCountsForCategories.map((item, index) => {
    return { category: item.category, selected: false };
  });
  const [state, setState] = React.useState({
    items,
  });

  function setSelected(idx, selected) {
    setState({
      ...items,
      items: state.items.map((item, index) => {
        if (index === parseInt(idx)) {
          return { ...item, selected };
        }
        return item;
      }),
    });
  }

  const that = this;
  return (
    <div className={"filter-inner-container"}>
      {props.definition.globalPatientCountsForCategories.map((item, index) => {
        return (
          <ToggleButton
            sx={{ color: "blue", fontSize: "12px" }}
            key={item.category}
            value={index}
            selected={
              state.items[state.items.findIndex((i) => i.category === item.category)].selected
            }
            onChange={(e) => {
              setSelected(
                e.target.value,
                !state.items[state.items.findIndex((i) => i.category === item.category)].selected
              );
            }}
          >
            {item.category}
          </ToggleButton>
        );
      })}
    </div>
  );
}

export default DpDiscreteList;
