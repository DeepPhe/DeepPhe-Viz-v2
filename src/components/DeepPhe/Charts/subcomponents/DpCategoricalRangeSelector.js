import React, { useEffect, useState } from "react";
import DpFilterBox from "./DpFilterBox.js";
import { getDataset, getSeries } from "../../../../utils/Filter";

function DpCategoricalRangeSelector(props) {
  const filterInitialized = props.filterInitialized;
  const [series, setSeries] = useState(undefined);
  const [dataset, setDataset] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [newChartReady, setNewChartReady] = useState(false);
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

  if (initialLoad) {
  } else {
    return (
      <React.Fragment>
        <span
          className={
            "dp-filter-box-" +
            definition.fieldName.replace(" ", "_") +
            " dp-filter-box col-md-3 col-sm-4"
            // props.expandedLevel
          }
        >
          <DpFilterBox
            series={newChartReady ? series : props.oldSeries}
            dataset={newChartReady ? dataset : props.oldDataset}
            definition={definition}
            type={"BarChartWithSlider"}
            fullWidth={props.fullWidth}
            broadcastUpdate={broadcastUpdate}
            filterInitialized={filterInitialized}
          />
        </span>
      </React.Fragment>
    );
  }
}

export default DpCategoricalRangeSelector;
