import React, {Component} from "react";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";

class BooleanList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition,
            selected: props.selected,
            onSelect: props.onSelect
        };
    }

    toggleActivityEnabled = activity => ({enabled}) => {

    }
    handleToggleSwitch = (switchId) => ({enabled}) => {
        console.log("Switch id: " + switchId + " enabled: " + enabled)
        this.setState({[switchId]: enabled})
    };
    render() {
        return (
            <React.Fragment>
                <div id={"metastasis-overlay-row"}>
                <div id={"metastasis-row"} className={"row filter_center_rows"}>
                    <div className={"slider-container"}>
                        {this.state.definition.globalPatientCountsForCategories.map((item, index) => {

                            return <ToggleSwitch wantsDivs={false} label={item.category} theme="graphite-small"
                                             enabled={true}
                                        onStateChanged={this.handleToggleSwitch("metastasis present")}/>
                        })}
                    </div>
                </div>
                </div>
            </React.Fragment>
        );
    }

    handleChange(index, event) {
        let value = this.state.value;
        value[index] = event.target.checked;
        this.setState({ value: value });
        this.props.onChange(value);
    }
}

export default BooleanList;