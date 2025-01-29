import React, { useEffect } from "react";
import "./CohortFilter.css";
import "rc-slider/assets/index.css";
import DpFilterList from "./subcomponents/DpFilterList";
import $ from "jquery";
import {
  fetchFilterDefinitions,
  initializeFilterDefinitions,
  updatePatientsMatchingAllFilters,
} from "../../../utils/Filter";
import { fetchPatientArrays } from "../../../utils/db/Patient";

const CohortFilter = (props) => {
  const db = props.db;
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterGuiInfo, setFilterGuiInfo] = React.useState({});
  const [filterDefinitionLoading, setFilterDefinitionLoading] = React.useState(true);
  const [patientArraysLoading, setPatientArraysLoading] = React.useState(true);
  const [filterDefinitions, setFilterDefinitions] = React.useState([]);
  const [patientArrays, setPatientArrays] = React.useState([]);
  const [patientsMatchingAllFiltersUpToDate, setPatientsMatchingAllFiltersUpToDate] =
    React.useState(false);
  const [patientsMatchingAllFilters, setPatientsMatchingAllFilters] = React.useState([]);

  useEffect(() => {
    fetchPatientArrays(db).then((patientArrays) => {
      setPatientArrays(patientArrays);
      setPatientArraysLoading(false);

      fetchFilterDefinitions().then((filterDefinitions) => {
        initializeFilterDefinitions(filterDefinitions, patientArrays).then((arr) => {
          setFilterDefinitionLoading(false);
          setFilterDefinitions(arr[0]); //filterDefinitions);
          setFilterGuiInfo(arr[1]); //filterGuiInfo);
        });
      });
    });
    filterChangedState();
  }, []);

  const filterChangedState = (definition) => {
    if (stillLoading()) {
    } else {
      //make each rect in each filter that isn't selected, gray
      const rects = $(".dp-filter-box-T_Stage svg g[clip-path]");
      const labels = rects.next("g");
      if (rects.length > 0) {
        console.log("There are {} bars.", rects[0].childNodes.length);
        console.log("There are {} labels.", labels[0].childNodes.length);
      }

      updatePatientsMatchingAllFilters(filterDefinitions, patientArrays).then(
        (patientsMatchingAllFilters) => {
          setPatientsMatchingAllFilters(patientsMatchingAllFilters);
        }
      );
    }
  };

  const sizingProps = { height: 200 };

  const stillLoading = () => {
    return filterDefinitionLoading || patientArraysLoading;
  };

  if (stillLoading()) return <div>Data is coming soon...</div>;
  else {
    return (
      <React.Fragment>
        <div id={"NewBasicControl"}></div>
        <div>{patientsMatchingAllFilters.length}</div>

        <div id="NewControl">
          {Object.keys(filterGuiInfo).map((guiInfo, index) => (
            <DpFilterList
              key={index}
              guiInfo={guiInfo}
              filterGuiInfo={filterGuiInfo}
              filterDefinitions={filterDefinitions}
              filterChangedState={filterChangedState}
            />
          ))}
        </div>
      </React.Fragment>
    );
  }
};
export default CohortFilter;
