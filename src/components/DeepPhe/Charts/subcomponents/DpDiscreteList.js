import React from "react";
import { ToggleButton } from "@mui/material";
import DpFilterBox from "./DpFilterBox";

function DpDiscreteList(props) {
  if (!props) {
    return null;
  }
  const { definition } = props;
  const items = definition.patientCountsByCategory.map((item, index) => {
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

  const getList = () => {
    return (
      <div className={"filter-inner-container"}>
        {props.definition.patientCountsByCategory.map((item, index) => {
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
  };

  const that = this;
  return (
    <React.Fragment>
      <DpFilterBox definition={definition} fullWidth={props.fullWidth} list={getList()} />
    </React.Fragment>
  );
}

export default DpDiscreteList;
