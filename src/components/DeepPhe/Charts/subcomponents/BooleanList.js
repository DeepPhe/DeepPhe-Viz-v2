import Grid from "@mui/material/Grid";
import SwitchControl from "./controls/SwitchControl";
import React from "react";

function BooleanList(props) {
  //props.broadcastUpdate = props.broadcastUpdate.bind(this);
  // const broadcastUpdate = (definition) => {
  //   props.broadcastUpdate(definition);
  // };

  /*const handleSwitchUpdate = (definition) => {
    this.setState({ definition: definition, updated: false });
  };*/

  // componentDidUpdate(prevProps, prevState, snapshot);
  // {
  //   if (this.state.updated === false) {
  //     this.setState({ updated: true });
  //     this.broadcastUpdate(this.state.definition);
  //   }
  // }
  if (!props) {
    return null;
  }
  return (
    <Grid item md={7} className="filter-inner-container no_padding_grid">
      <div className={"slider-container"}>
        <SwitchControl
          broadcastUpdate={props.broadcastUpdate}
          definition={props.filter.props.definition}
        />{" "}
      </div>
    </Grid>
  );
}

export default BooleanList;
