import React from "react";
import Slider from "rc-slider";
import { ChangeResult } from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";
import { withDrag, withDrop } from "./withDragAndDropHook";
import $ from "jquery";
import * as d3 from "d3v4";

class NumericRangeSelector extends React.Component {
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
    //debugger;
    this.setState({
      //...(definition.patientsMeetingThisFilterOnly = range[1]),
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

    const { definition } = this.props;
    // console.log(definition.fieldName + ":")
    // console.log("    Range " + definition.selectedNumericRange.min + " - " + definition.selectedNumericRange.max)
    //
    // this.state.definition.switches.forEach(switchInfo => {
    //     console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
    // })
  }

  componentDidMount() {
    //this.addCountsToCategory();
  }

  addCountsToCategory = () => {
    let total = 0;
    let fieldName = this.state.definition.fieldName;
    this.state.definition.globalPatientCountsForCategories.forEach((item) => {
      total += item.count;
    });
    this.state.definition.globalPatientCountsForCategories.forEach((item) => {
      this.addCountToCategory(fieldName, item.category, item.count, total);
    });
  };
  addCountToCategory = (fieldName, category, catCount, totalCount) => {
    let search = $("#" + fieldName + "-overlay-row span")
      .filter(function () {
        const that = $(this);

        return (
          $(this).text().toLowerCase().indexOf(category.toLowerCase()) >= 0 &&
          that.text().length === category.length
        );
      })
      .first();

    const cssId =
      fieldName.replaceAll(" ", "-").toLowerCase() + category.replaceAll(" ", "-").toLowerCase();
    const cssIdWithHash = "#" + cssId;

    $(cssIdWithHash).remove();
    search.append("<svg id='" + cssId + '\' height="29" width="20" />');
    let svg = d3.select(cssIdWithHash);
    svg
      .style("position", "absolute")
      .style("top", "-8px")
      .style("left", "0px")
      .style("fill-opacity", "0.5");
    let catPercent = catCount / totalCount;

    let y = 29 - 29 * catPercent;

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", y)
      .attr("width", search.width())
      .attr("height", catPercent * 29)
      //.attr('stroke', 'black')
      .attr("fill", "blue");
  };

  render() {
    const definition = this.state.definition;
    //const globalPatientCountsForCategories = definition.globalPatientCountsForCategories
    const selectedNumericRange = definition.selectedNumericRange;
    const numericRangeSelectorDefinition = definition.numericRangeSelectorDefinition;
    let marks = {};
    const minSelectedInRange = selectedNumericRange.min;
    const maxSelectedInRange = selectedNumericRange.max;
    const markStep = (numericRangeSelectorDefinition.max - numericRangeSelectorDefinition.min) / 10;

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

          <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />
        </div>
      </React.Fragment>
    );
  }
}

// render() {
//
//
//   return (
//     <React.Fragment>
//       <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
//         <div id={"numeric-range-selector-row"} className={"row filter_center_rows"}>
//
//         </div>
//     </React.Fragment>
// );
// }
// }

export default NumericRangeSelector;
