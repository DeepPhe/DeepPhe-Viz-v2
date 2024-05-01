import React from "react";
import { ChangeResult } from "multi-range-slider-react";
import Slider from "rc-slider";
import SwitchControl from "./controls/SwitchControl";
import RangeSlider from "../../../RangeSlider/RangeSlider";

class DpCategoricalRangeSelector extends React.Component {
  state = {
    definition: this.props.definition,
    updated: true,
  };

  constructor(props) {
    super(props);
  }

  broadcastUpdate = (definition) => {
    this.props.broadcastUpdate(definition);
  };

  handleRangeChange = (e: ChangeResult) => {
    const { definition } = this.state;
    let selectedCategoricalRange = [];
    for (let i = e[0]; i <= e[1]; i++)
      selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category);
    // this.props.definition.selectedCategoricalRange = selectedCategoricalRange
    this.setState({
      ...(definition.selectedCategoricalRange = selectedCategoricalRange),
      updated: false,
    });
  };

  handleSwitchUpdate = (definition) => {
    this.setState({ definition: definition, updated: false });
  };

  componentDidMount() {
    this.update();
  }

  update() {
    const { definition } = this.state;

    this.setState({ definition: definition, updated: true }, () => {
      this.broadcastUpdate(this.state.definition);
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.updated === false) {
      this.update();
    }
  }

  render() {
    const definition = this.props.definition;
    const globalPatientCountsForCategories = definition.globalPatientCountsForCategories;
    const selectedCategoricalRange = definition.selectedCategoricalRange;
    const marks = {};
    let minSelectedInRange = 10000000000;
    let maxSelectedInRange = 0;
    globalPatientCountsForCategories.map((item, index) => {
      marks[index] = item.category;
      if (selectedCategoricalRange.indexOf(item.category) !== -1) {
        minSelectedInRange = Math.min(minSelectedInRange, index);
        maxSelectedInRange = Math.max(maxSelectedInRange, index);
      }
      return true;
    });

    const prices = [1, 1, 3, 5, 6, 7];

    return (
      <React.Fragment>
        <div className={"slider-container"}>
          <RangeSlider data={prices} />

          {/*<Slider*/}
          {/*  range*/}
          {/*  min={0}*/}
          {/*  max={globalPatientCountsForCategories.length - 1}*/}
          {/*  defaultValue={[minSelectedInRange, maxSelectedInRange]}*/}
          {/*  onChange={(e) => this.handleRangeChange(e)}*/}
          {/*  draggableTrack={true}*/}
          {/*  pushable={true}*/}
          {/*  marks={marks}*/}
          {/*  dots={true}*/}
          {/*  step={1}*/}
          {/*/>*/}
        </div>
        <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />
      </React.Fragment>
    );
  }
}

export default DpCategoricalRangeSelector;
