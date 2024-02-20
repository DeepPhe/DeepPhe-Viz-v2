import React from "react";
import Slider from "rc-slider";
import { ChangeResult } from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";
import RangeSelector from "./RangeSelector";
import HSBar from "react-horizontal-stacked-bar-chart";
import { withDrag, withDrop } from "./withDragAndDropHook";

class NumericRangeSelector extends RangeSelector {
  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };

  handleRangeChange = (range: ChangeResult) => {
    const { definition } = this.props;
    //debugger;
    this.setState({
      ...(definition.patientsMeetingThisFilterOnly = range[1]),
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
      this.props.definition = this.state.definition;
      this.setState({ updated: true });
      this.broadcastUpdate(this.state.definition);
    }

    const { definition } = this.props;
    // console.log(definition.fieldName + ":")
    // console.log("    Range " + definition.selectedNumericRange.min + " - " + definition.selectedNumericRange.max)
    //
    // this.state.definition.switches.forEach(switchInfo => {
    //     console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
    // })
  }

  componentDidMount() {
    this.addCountsToCategory();
  }

  render() {
    const { definition } = this.props;
    //const globalPatientCountsForCategories = definition.globalPatientCountsForCategories
    const selectedNumericRange = definition.selectedNumericRange;
    const numericRangeSelectorDefinition = definition.numericRangeSelectorDefinition;
    let marks = {};
    const minSelectedInRange = selectedNumericRange.min;
    const maxSelectedInRange = selectedNumericRange.max;
    const markStep = (numericRangeSelectorDefinition.max - numericRangeSelectorDefinition.min) / 10;

    let markIndex = 0;
    while (markIndex < 11) {
      marks[markIndex * markStep] = "" + markIndex * markStep;
      markIndex++;
    }

    return (
      <React.Fragment>
        <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
          <div id={"numeric-range-selector-row"} className={"row filter_center_rows"}>
            <div className={"slider-container"}>
              <Slider
                range
                min={numericRangeSelectorDefinition.min}
                max={numericRangeSelectorDefinition.max + 1}
                defaultValue={[minSelectedInRange, maxSelectedInRange]}
                onChange={(e) => this.handleRangeChange(e)}
                draggableTrack={true}
                pushable={true}
                dots={false}
                included={true}
                marks={marks}
                step={numericRangeSelectorDefinition.step}
              />
            </div>
            <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />{" "}
            <HSBar
              id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-hs"}
              showTextIn
              height={47.3}
              data={definition.filterData}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default NumericRangeSelector;
