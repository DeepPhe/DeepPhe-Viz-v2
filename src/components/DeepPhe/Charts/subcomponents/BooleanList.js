import React, { Component } from "react";
import SwitchControl from "./controls/SwitchControl";
import HSBar from "react-horizontal-stacked-bar-chart";
import FilterComponent from "./FilterComponent";

class BooleanList extends FilterComponent {
  //why does this update twice?  Not a huge deal...but it's annoying
  state = {
    definition: this.props.definition,
    updated: false,
  };

  constructor(props) {
    super(props);
  }

  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };

  handleSwitchUpdate = (definition) => {
    this.setState({ definition: definition, updated: false });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.updated === false) {
      this.setState({ updated: true });
      this.broadcastUpdate(this.state.definition);
    }

    // console.log(this.state.definition.fieldName + ":")
    //  this.state.definition.switches.forEach(switchInfo => {
    //    console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
    //  })
  }

  render() {
    const { definition } = this.props;
    return (
      <React.Fragment>
        <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
          <div id={"boolean-list-row"} className={"row filter_center_rows"}>
            <div className={"slider-container"}>
              <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />{" "}
              <HSBar
                id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
                showTextIn
                height={47.3}
                data={definition.filterData}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default BooleanList;
