import React from "react";
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
        spacing={2}
        direction="row"
        className={"discrete-list-container"}
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-around",
          flexDirection: "row",
          width: "100%",
          bgcolor: "white",
          fontSize: "8px !important",
        }}
      >
        {props.definition.globalPatientCountsForCategories.map((item, index) => {
          return (
            <ListItem
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                marginRight: "10px",
                marginLeft: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: "10px",
                paddingLeft: "10px",
                backgroundColor: "blue",
              }}
              key={index}
            >
              <ListItemText
                sx={{
                  fontSize: "12px !important",
                  color: "white !important",
                }}
                disableTypography={true}
                primary={item.category}
              />
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
