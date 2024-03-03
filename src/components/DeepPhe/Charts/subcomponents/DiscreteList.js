import React from "react";
import { withDrag, withDrop } from "./withDragAndDropHook.js";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

function DiscreteList(props) {
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

// render() {
//   const {definition} = this.props;
//   return (
//     <React.Fragment>
//       <div
//         className={"overlay-row-container"}
//         id={+"-overlay-row"}
//       >
//         <div id={"diagnosis-row"} className={"row no-gutter"}>
//           <Grid item md={2} className="filter-inner-container no_padding_grid">
//             {this.getToggleSwitch(definition, this.props.index)}
//           </Grid>
//           <Grid item md={7}>
//
//           </Grid>
//         </div>
//       </div>
//     </React.Fragment>
//   );
// }

export default DiscreteList;
