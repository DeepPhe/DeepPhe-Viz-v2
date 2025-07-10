import React, { useEffect, useState } from "react";
import DpFilterBox from "./DpFilterBox.js";
import { FormGroup } from "@mui/material";
import { getDataset, getSeries } from "../../../../utils/Filter";

function DpCategoricalRangeSelector(props) {
  const filterInitialized = props.filterInitialized;
  const [series, setSeries] = useState(undefined);
  const [dataset, setDataset] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [newChartReady, setNewChartReady] = useState(false);
  const [wantSlider, setWantSlider] = useState(false);
  const filterStates = props.filterStates;
  const broadcastUpdate = props.broadcastUpdate;
  const { definition } = props;
  const thisFilter = filterStates.find((a) => a.filter === props.definition.fieldName);

  useEffect(() => {
    const newDataset = getDataset(
      thisFilter,
      definition.categoricalRange,
      definition.selectedCategoricalRange
    );
    setDataset(newDataset);
    const newSeries = getSeries();
    setSeries(newSeries);
  }, [definition, filterStates]);

  useEffect(() => {
    if (dataset && series) {
      setIsLoading(false);
      setInitialLoad(false);
      setNewChartReady(true);
    }
  }, [dataset, series]);

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

    return (
      <FormGroup
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

  if (initialLoad) {
  } else {
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
            series={newChartReady ? series : props.oldSeries}
            dataset={newChartReady ? dataset : props.oldDataset}
            definition={definition}
            wantSlider={wantSlider}
            type={"BarChartWithSlider"}
            fullWidth={props.fullWidth}
            list={getList()}
            broadcastUpdate={broadcastUpdate}
            filterInitialized={filterInitialized}
          />
        </span>
      </React.Fragment>
    );
  }
}

export default DpCategoricalRangeSelector;
