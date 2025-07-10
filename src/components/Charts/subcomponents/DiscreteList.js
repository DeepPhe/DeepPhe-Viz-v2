import React, {Component} from "react";

class DiscreteList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition,
            selected: props.selected,
            onSelect: props.onSelect
        }
    }

    render() {

        return (
            <React.Fragment>
                <div id={"diagnosis-overlay-row"}>
                    <div id={"diagnosis-row"} className={"row no-gutter"}>
                        {this.state.definition.globalPatientCountsForCategories.map((item, index) => {
                           return <span className={"box-for-word-filter blue-border-for-word-filter"}>{item.category}</span>
                        })}
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default DiscreteList;