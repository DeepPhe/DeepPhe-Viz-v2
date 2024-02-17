import React, { Component } from "react";
import ToggleSwitch from "../../../Buttons/ToggleSwitch";

class SwitchControl extends Component {
  state = {
    definition: this.props.definition,
  };

  constructor(props) {
    super(props);
  }

  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };
  handleToggleSwitch =
    (switchId, switchIndex) =>
    ({ enabled }) => {
      this.setState({
        ...(definition.switches[switchIndex].value = enabled),
        updated: false,
      });
    };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.updated === false) {
      this.setState({ updated: true });
      this.broadcastUpdate(this.state.definition);
    }

    // const {definition} = this.props
    // console.log(definition.fieldName + ":")
    // definition.switches.forEach(switchInfo => {
    //     console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
    // })
  }

  render() {
    return (
      <React.Fragment>
        {this.state.definition.switches.map((item, index) => {
          const fieldName = this.props.definition.fieldName;
          const switchName = item.name;
          const name = fieldName + "_" + switchName;
          const enabled = item.value; //true/false

          return (
            <ToggleSwitch
              key={index}
              wantsdivs={0}
              label={switchName}
              theme="graphite-small"
              enabled={enabled}
              onStateChanged={this.handleToggleSwitch(name, index)}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default SwitchControl;
