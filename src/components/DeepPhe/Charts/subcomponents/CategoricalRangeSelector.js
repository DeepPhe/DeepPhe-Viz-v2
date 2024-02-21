import React from "react";
import { ChangeResult } from "multi-range-slider-react";
import Slider from "rc-slider";
import SwitchControl from "./controls/SwitchControl";
import $ from "jquery";
import * as d3 from "d3v4";

class CategoricalRangeSelector extends React.Component {
  state = {
    definition: this.props.definition,
    updated: true,
  };

  constructor(props) {
    super(props);
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
    search.append("<svg id='" + cssId + "' height=29 width=20 />");
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
    this.addCountsToCategory();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.updated === false) {
      const { definition } = this.state;
      let countMeetingThisFilter = 0;
      let numOfPossiblePatientsForThisFilter = 0;
      definition.globalPatientCountsForCategories.forEach((item, index) => {
        let idx = definition.selectedCategoricalRange.indexOf(item.category);
        if (idx !== -1) {
          countMeetingThisFilter += item.count;
        }

        numOfPossiblePatientsForThisFilter += item.count;
      });

      ///might have to update the globl thing here
      definition.numberOfPossiblePatientsForThisFilter = numOfPossiblePatientsForThisFilter;
      console.log(
        definition.fieldName +
          " numberOfPossiblePatientsForThisFilter: " +
          numOfPossiblePatientsForThisFilter
      );
      definition.patientsMeetingThisFilterOnly = countMeetingThisFilter;
      //patientsMeetingEntireSetOfFilters

      // console
      //     .log(definition
      //
      //         .fieldName + ":")
      // console
      //     .log("    Range: " + definition.selectedCategoricalRange
      //         [0] + " - " + definition.selectedCategoricalRange
      //         [definition.selectedCategoricalRange.length - 1])
      this.setState({ definition: definition, updated: true }, () => {
        this.broadcastUpdate(this.state.definition);
      });
    }

    // this
    //     .state
    //     .definition
    //     .switches
    //     .forEach(switchInfo => {
    //         console
    //             .log("    Switch " + switchInfo.name + ": " + switchInfo.value)
    //     })
  }

  render() {
    const { definition } = this.props;
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

    return (
      <React.Fragment>
        <div className={"slider-container"}>
          <Slider
            range
            min={0}
            max={globalPatientCountsForCategories.length - 1}
            defaultValue={[minSelectedInRange, maxSelectedInRange]}
            onChange={(e) => this.handleRangeChange(e)}
            draggableTrack={true}
            pushable={true}
            marks={marks}
            dots={false}
            step={1}
          />
        </div>
        <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition} />
      </React.Fragment>
    );
  }

  // render() {
  //
  //
  //   return (
  //     <React.Fragment>
  //       <div
  //         className={"overlay-row-container"}
  //         id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}
  //       >
  //         <div id={"categorical-range-selector-row"} className={"filter-center-rows row"}>
  //           <Grid item md={2} className="filter-inner-container no_padding_grid">
  //             {this.getToggleSwitch(definition, this.state.index)}
  //           </Grid>
  //           <Grid item md={7} className="filter-inner-container no_padding_grid">
  //
  //           </Grid>
  //           <Grid item md={3} className="filter-inner-container no_padding_grid">
  //
  //           </Grid>
  //         </div>
  //       </div>
  //     </React.Fragment>
  //   );
  // }
}

export default CategoricalRangeSelector;
