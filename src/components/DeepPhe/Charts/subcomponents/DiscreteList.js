import React from "react";
import HSBar from "react-horizontal-stacked-bar-chart";
import FilterComponent from "./FilterComponent";
import { withDrag, withDrop } from "./withDragAndDropHook.js";

class DiscreteList extends FilterComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { definition } = this.props;
    return (
      <React.Fragment>
        <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
          <div id={"diagnosis-row"} className={"row no-gutter"}>
            {definition.globalPatientCountsForCategories.map((item, index) => {
              return (
                <span key={index} className={"box-for-word-filter blue-border-for-word-filter"}>
                  {item.category}
                </span>
              );
            })}{" "}
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

export default DiscreteList;
