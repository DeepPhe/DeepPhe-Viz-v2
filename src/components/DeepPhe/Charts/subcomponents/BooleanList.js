import Grid from "@mui/material/Grid";
import SwitchControl from "./controls/SwitchControl";
import React from "react";

class BooleanList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      definition: props.definition,
      updated: false,
    };
  }

  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };

  handleSwitchUpdate = (definition) => {
    this.setState({ definition: definition, updated: false });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.updated === false) {
      let countMeetingThisFilter = 0;
      const { definition } = this.state;
      definition.globalPatientCountsForCategories.forEach((item, index) => {
        let idx = definition.switches.findIndex((x) => x.name === item.category);
        if (idx !== -1 && definition.switches[idx].value === true) {
          countMeetingThisFilter += item.count;
        }
      });
      //definition.patientsMeetingThisFilterOnly = countMeetingThisFilter;
      this.setState({ updated: true, definition: definition });
      this.broadcastUpdate(this.state.definition);
    }
  }

  render() {
    return (
      <Grid item md={7} className="filter-inner-container no_padding_grid">
        <div className={"slider-container"}>
          <SwitchControl
            broadcastUpdate={this.handleSwitchUpdate}
            definition={this.state.definition}
          />{" "}
        </div>
      </Grid>
    );
  }
}

export default BooleanList;
