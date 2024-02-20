import React from "react";
import HSBar from "react-horizontal-stacked-bar-chart";
import { withDrag, withDrop } from "./withDragAndDropHook.js";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";

function DiscreteList(props) {
  if (!props) {
    return null;
  }
  return (
    <div className={"filter-inner-container"}>
      <List
        className={"discrete-list-container"}
        sx={{
          width: "100%",
          bgcolor: "background.paper",
        }}
      >
        {props.definition.globalPatientCountsForCategories.map((item, index) => {
          return (
            <ListItem key={index}>
              <ListItemText primary={item.category} />
            </ListItem>
          );
        })}
      </List>
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
