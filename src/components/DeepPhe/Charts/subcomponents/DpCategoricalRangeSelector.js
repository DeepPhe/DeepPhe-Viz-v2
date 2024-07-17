import React, { useState } from "react";
import DpFilterBox from "./DpFilterBox.js";

function DpCategoricalRangeSelector(props) {
  const [definition, setDefinition] = useState(props.definition);

  const broadcastUpdate = (definition) => {
    props.broadcastUpdate(definition);
  };

  const seriesA = {
    //24 random numbers
    data: [2, 3, 1, 4, 5, 8, 3, 9, 3, 7, 9, 3, 2, 5, 8, 3, 9, 3, 7, 9, 3, 2, 5, 8],
    label: "Patients Meeting All Filters",
    color: "#187bcd",
    id: "patients-meeting-all-filters",
  };
  const seriesB = {
    data: [3, 1, 4, 2, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5],
    label: "Patients Meeting This Filter",
    color: "#2a9df4",
    id: "patients-meeting-this-filter",
  };
  const seriesC = {
    data: [3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 5, 2, 4, 5, 5, 3, 2, 4, 5],
    label: "Remaining Patients",
    color: "#d0efff",
    id: "remaining-patients",
  };

  const seriesArray = [
    { ...seriesA, stack: "total" },
    { ...seriesB, stack: "total" },
    { ...seriesC, stack: "total" },
    ,
  ];

  return (
    <React.Fragment>
      <DpFilterBox
        seriesArray={seriesArray}
        definition={definition}
        type={"BarChartWithSlider"}
      ></DpFilterBox>
    </React.Fragment>
  );
}

export default DpCategoricalRangeSelector;
