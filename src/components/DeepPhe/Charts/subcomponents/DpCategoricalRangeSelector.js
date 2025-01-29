import React, { useState } from "react";
import DpFilterBox from "./DpFilterBox.js";
import { useTheme } from "@mui/styles";
import { FormGroup } from "@mui/material";

function DpCategoricalRangeSelector(props) {
  const [definition, setDefinition] = useState(props.definition);
  const broadcastUpdate = props.broadcastUpdate;
  const maximumPatients = definition.globalPatientCountsForCategories.map((item) => item.count);

  const seriesA = {
    //24 random numbers
    data: maximumPatients,
    label: "Patients Meeting All Filters", // color: "#187bcd",
    // id: "patients-meeting-all-filters",
    color: "#187bcd",
    stack: "total",
    stackOffset: "none",
  };
  // const seriesB = {
  //   data: [3, 1, 4, 2, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5],
  //   label: "Patients Meeting This Filter", // color: "#2a9df4",
  //   // id: "patients-meeting-this-filter",
  //   color: "#2a9df4",
  //   stack: "total",
  // };
  // const seriesC = {
  //   data: [3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 3, 2, 4, 5, 1, 5, 2, 4, 5, 5, 3, 2, 4, 5],
  //   label: "Remaining Patients", // color: "#d0efff",
  //   // id: "remaining-patients",
  //   color: "#d0efff",
  //   stack: "total",
  // };

  const seriesArray = [{ ...seriesA }];

  const getList = () => {
    let width = "100%";
    let mt = 0;
    let mr = 0;
    let marginLeftCb = "0px";
    const numCheckboxes = definition.categoricalRange.length;
    if (numCheckboxes === 2) {
      width = "52%";
    }
    if (numCheckboxes === 3) {
      width = "68%";
      mt = "-42px";
      mr = "-52px";
    }
    if (numCheckboxes === 4) {
      width = "75%";
      mt = "-42px";
      mr = "-46px";
    }
    if (numCheckboxes === 6) {
      width = "82%";
      mt = "-41px";
      mr = "-47px";
    }
    if (numCheckboxes === 7) {
      width = "85%";
      mt = "-42px";
      mr = "-58px";
      marginLeftCb = "1px";
    }
    if (numCheckboxes === 8) {
      width = "100%";
      mt = "-41px";
      mr = "-51px";
    }
    if (numCheckboxes === 12) {
      width = "90.7%";
      mt = "-42px";
      mr = "-41px";
    }
    const theme = useTheme();
    return (
      <FormGroup
        alignItems="center"
        row
        sx={{
          flexWrap: "nowrap",
          width: width,
          marginTop: mt,
          marginLeft: mr,
          justifyContent: "space-between",
          fontSize: "12px",
        }}
      >
        {/*{definition.categoricalRange.map((key) => (*/}
        {/*  <FormControlLabel*/}
        {/*    sx={{*/}
        {/*      "& .MuiFormControlLabel-label": { fontSize: "14px" },*/}
        {/*      color: theme.palette.text.primary,*/}
        {/*      marginLeft: marginLeftCb,*/}
        {/*      marginRight: marginLeftCb,*/}
        {/*    }}*/}
        {/*    key={key}*/}
        {/*    labelPlacement={"bottom"}*/}
        {/*    control={*/}
        {/*      <Checkbox*/}
        {/*        sx={{*/}
        {/*          "& .MuiSvgIcon-root": {*/}
        {/*            fontSize: 14,*/}
        {/*          },*/}
        {/*        }}*/}
        {/*        color={"primary"}*/}
        {/*        size={"small"}*/}
        {/*        checked={true}*/}
        {/*        // onChange={handleCheckboxChange}*/}
        {/*        name={key}*/}
        {/*      />*/}
        {/*    }*/}
        {/*    label={""}*/}
        {/*  />*/}
        {/*))}*/}
      </FormGroup>
    );
  };

  return (
    <React.Fragment>
      <span
        className={
          "dp-filter-box-" +
          definition.fieldName.replace(" ", "_") +
          " dp-filter-box col-md-" +
          props.expandedLevel
        }
      >
        <DpFilterBox
          seriesArray={seriesArray}
          definition={definition}
          type={"BarChartWithSlider"}
          fullWidth={props.fullWidth}
          list={getList()}
          broadcastUpdate={broadcastUpdate}
        ></DpFilterBox>
      </span>
    </React.Fragment>
  );
}

export default DpCategoricalRangeSelector;
