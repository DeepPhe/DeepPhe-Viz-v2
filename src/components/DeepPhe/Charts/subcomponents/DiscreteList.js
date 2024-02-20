import React from "react";
import HSBar from "react-horizontal-stacked-bar-chart";
import FilterComponent from "./FilterComponent";
import { withDrag, withDrop } from "./withDragAndDropHook.js";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";

class DiscreteList extends FilterComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { definition } = this.props;
    return (
      <React.Fragment>
        <div
          className={"overlay-row-container"}
          id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}
        >
          <div id={"diagnosis-row"} className={"row no-gutter"}>
            <Grid item md={2} className="filter-inner-container no_padding_grid">
              {this.getToggleSwitch(definition, this.props.index)}
            </Grid>
            <Grid item md={8}>
              <div className={"filter-inner-container"}>
                <List
                  className={"discrete-list-container"}
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  {definition.globalPatientCountsForCategories.map((item, index) => {
                    return (
                      <ListItem key={index}>
                        <ListItemText primary={item.category} />
                      </ListItem>
                    );
                  })}
                </List>

                <HSBar
                  id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs-bar"}
                  showTextIn
                  height={47.3}
                  data={definition.filterData}
                  className={"hs-bar"}
                />
              </div>
            </Grid>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DiscreteList;
