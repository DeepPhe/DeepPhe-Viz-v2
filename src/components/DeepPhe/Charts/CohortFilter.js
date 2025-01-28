import React, { useEffect } from "react";
import "./CohortFilter.css";
import "rc-slider/assets/index.css";
import DpFilterList from "./subcomponents/DpFilterList";
import { fetchFilterDefinitions, initializeFilterDefinitions } from "../../../utils/Filter";
import { fetchPatientArrays } from "../../../utils/db/Patient";

const CohortFilter = (props) => {
  const db = props.db;
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterGuiInfo, setFilterGuiInfo] = React.useState({});
  const [filterDefinitionLoading, setFilterDefinitionLoading] = React.useState(true);
  const [patientArraysLoading, setPatientArraysLoading] = React.useState(true);
  const [filterDefinitions, setFilterDefinitions] = React.useState([]);
  const [patientArrays, setPatientArrays] = React.useState([]);

  useEffect(() => {
    fetchPatientArrays.then((patientArrays) => {
      setPatientArrays(patientArrays);
      setPatientArraysLoading(false);
    });

    fetchFilterDefinitions().then((filterDefinitions) => {
      initializeFilterDefinitions(filterDefinitions).then((arr) => {
        setFilterDefinitionLoading(false);
        setFilterDefinitions(arr[0]); //filterDefinitions);
        setFilterGuiInfo(arr[1]); //filterGuiInfo);
      });
    });
  }, []);

  const filterChangedState = (definition) => {
    if (!this.state.isLoading) {
      this.setState(
        {
          filterDefinitions: this.state.filterDefinitions.map((def) => {
            if (def.fieldName === definition.fieldName) {
              debugger;
              return definition;
            } else {
              return def;
            }
          }),
          patientsMeetingAllFiltersUpToDate: false,
        },
        () => {
          this.updatePatientsMatchingAllFilters().then(() => {});
        }
      );
    }
  };

  const filterStateChaned = (definition) => {};

  const sizingProps = { height: 200 };

  const stillLoading = () => {
    return isLoading || filterDefinitionLoading || patientArraysLoading;
  };

  if (stillLoading()) return <div>Data is coming soon...</div>;
  else {
    return (
      <React.Fragment>
        <div id={"NewBasicControl"}></div>

        <div id="NewControl">
          {Object.keys(filterGuiInfo).map((guiInfo, index) => (
            <DpFilterList
              key={index}
              guiInfo={guiInfo}
              filterGuiInfo={filterGuiInfo}
              filterDefinitions={filterDefinitions}
              filterChangedState={filterStateChanged}
            />
          ))}
        </div>
      </React.Fragment>
    );
  }
};
