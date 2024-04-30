import React from "react";
import Slider from "rc-slider";
import { ChangeResult } from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";

class DpNumericRangeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      definition: this.props.definition,
      updated: true,
    };
  }

  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };

  handleRangeChange = (range: ChangeResult) => {
    const { definition } = this.state;
    this.setState({
      ...(definition.selectedNumericRange.min = range[0]),
      ...(definition.selectedNumericRange.max = range[1]),
    });
    this.setState({ updated: false });
  };

  handleSwitchUpdate = (definition) => {
    this.setState({ definition: definition, updated: false });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      !(JSON.stringify(prevState) === JSON.stringify(this.state)) &&
      this.state.updated === false
    ) {
      this.setState({ updated: true });
      this.broadcastUpdate(this.state.definition);
    }
  }

  componentDidMount() {}

  render() {
    const definition = this.state.definition;
    const selectedNumericRange = definition.selectedNumericRange;
    const DpNumericRangeSelectorDefinition = definition.DpNumericRangeSelectorDefinition;
    let marks = {};
    const minSelectedInRange = selectedNumericRange.min;
    const maxSelectedInRange = selectedNumericRange.max;
    const markStep =
      (DpNumericRangeSelectorDefinition.max - DpNumericRangeSelectorDefinition.min) / 10;

    marks = {
      40: "40",
      45: "45",
      50: "50",
      55: "55",
      60: "60",
      65: "65",
      70: "70",
    };

    return (
      <React.Fragment>
        <div
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={"slider-container"}
        >
          <Slider
            range
            min={DpNumericRangeSelectorDefinition.min}
            max={DpNumericRangeSelectorDefinition.max + 1}
            defaultValue={[minSelectedInRange, maxSelectedInRange]}
            onChange={(e) => this.handleRangeChange(e)}
            draggableTrack={true}
            pushable={true}
            dots={false}
            included={true}
            marks={marks}
            step={DpNumericRangeSelectorDefinition.step}
          />

          <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />
        </div>
      </React.Fragment>
    );
  }
}

export default DpNumericRangeSelector;
