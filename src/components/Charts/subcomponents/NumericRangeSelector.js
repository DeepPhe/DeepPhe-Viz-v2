import React, {Component} from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";
import $ from "jquery";

class NumericRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition,
            selected: props.selected,
            onSelect: props.onSelect
        }
    }

    handleRangeChange = (e: ChangeResult) => {
        this.setState({selectedRanges: e})
        // this.buildQuery()
    };

    toggleActivityEnabled = activity => ({enabled}) => {

        // const selector = "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"
        // if (enabled) {
        //     $(selector).removeClass("overlay-row")
        // } else {
        //     $(selector).addClass("overlay-row")
        // }


        // let {only} = this.state;
        //
        // if (enabled && !only.includes(activity)) {
        //     only.push(activity);
        //     return this.setState({only});
        // }
        //
        // if (!enabled && only.includes(activity)) {
        //     only = only.filter(item => item !== activity);
        //     return this.setState({only});
        // }
    }


    render() {

        const globalPatientCountsForCategories = this.state.definition.globalPatientCountsForCategories
        const selectedNumericRange = this.state.definition.selectedNumericRange
        const numericRangeSelectorDefinition = this.state.definition.numericRangeSelectorDefinition
        let marks = {}
        const minSelectedInRange = selectedNumericRange.min;
        const maxSelectedInRange = selectedNumericRange.max;
        const markStep = (numericRangeSelectorDefinition.max - numericRangeSelectorDefinition.min) / 10;

       let markIndex = 0;
       while (markIndex < 11) {
            marks[markIndex * markStep] = "" + markIndex * markStep
            markIndex++
        }


        return (
            <React.Fragment>
                <div id={"age-at-dx-overlay-row"}>
                    <div id={"age-at-dx-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <Slider range min={numericRangeSelectorDefinition.min}
                                    max={numericRangeSelectorDefinition.max+10}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange("selectedAges", e)}
                                    draggableTrack={true} pushable={true} dots={false} included={true} marks={marks}
                                    step={numericRangeSelectorDefinition.step}/>
                        </div>

                        <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small"
                                      enabled={true}
                                      onStateChanged={this.toggleActivityEnabled("Unknown")}/>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default NumericRangeSelector;