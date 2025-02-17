import React, { useEffect, useState } from "react";
import "./CohortFilter.css";
import "rc-slider/assets/index.css";
import DpFilterList from "./subcomponents/DpFilterList";
import { fetchFilterDefinitions, initializeFilterDefinitions } from "../../../utils/Filter";
import { fetchPatientArrays } from "../../../utils/db/Patient";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FilterPatients from "../../../utils/FilterPatients";

const CohortFilter = (props) => {
  const db = props.db;
  const [isLoading, setIsLoading] = useState(true);
  const [filterGuiInfo, setFilterGuiInfo] = useState({});
  const [filterDefinitionLoading, setFilterDefinitionLoading] = useState(true);
  const [patientArraysLoading, setPatientArraysLoading] = useState(true);
  const [filterDefinitions, setFilterDefinitions] = useState(undefined);
  const [patientArrays, setPatientArrays] = useState(undefined);
  const [filterStates, setFilterStates] = useState(undefined);
  const [filterStatesLoading, setFilterStatesLoading] = useState(true);
  const [uniquePatientIds, setUniquePatientIds] = useState([]);
  const [patientsMatchingAllFiltersUpToDate, setPatientsMatchingAllFiltersUpToDate] =
    useState(false);
  const [patientsMatchingAllFilters, setPatientsMatchingAllFilters] = useState([]);
  const [filterListKey, setFilterListKey] = useState(0);
  const [newControlReady, setNewControlReady] = useState(false);

  useEffect(() => {
    fetchPatientArrays(db).then((patientArraysObj) => {
      setPatientArrays(patientArraysObj.patientArrays);
      setUniquePatientIds(patientArraysObj.uniquePatientIds);
      setPatientArraysLoading(false);
    });
  }, [db]);

  useEffect(() => {
    if (patientArrays) {
      fetchFilterDefinitions().then((filterDefinitions) => {
        initializeFilterDefinitions(filterDefinitions, patientArrays).then((arr) => {
          setFilterDefinitionLoading(false);
          setFilterDefinitions(arr[0]);
          setFilterGuiInfo(arr[1]);
        });
      });
    }
  }, [patientArrays]);

  useEffect(() => {
    if (!filterDefinitionLoading) setFilterStatesLoading(false);
    else setFilterStatesLoading(true);
  }, [filterStates]);

  useEffect(() => {
    if (filterDefinitions && patientArrays) {
      runFilters().then((newFilterState) => {
        updateFilterState(newFilterState);
        setNewControlReady(true);
      });
    }
  }, [filterDefinitions, patientArrays]);

  const updateFilterState = (newFilterState) => {
    setFilterStates(newFilterState);
  };

  const runFilters = () => {
    return new Promise((resolve, reject) => {
      FilterPatients(patientArrays, uniquePatientIds, filterDefinitions).then((filterResults) => {
        setPatientsMatchingAllFilters(filterResults.patientsMatchingAllFilters);
        resolve(filterResults.filterData);
      });
    });
  };

  const filterChangedState = (definition) => {
    if (!stillLoading()) {
      setFilterDefinitionLoading(true);
      runFilters().then((newFilterState) => {
        updateFilterState(newFilterState);
        setFilterDefinitionLoading(false);
      });
    }
  };

  const stillLoading = () => {
    return filterDefinitionLoading || patientArraysLoading || filterStatesLoading;
  };

  if (stillLoading()) return <div>Data is coming soon...</div>;
  else {
    return (
      <React.Fragment>
        <div id={"NewBasicControl"}></div>
        <div>Selected Patients: {patientsMatchingAllFilters.length}/50</div>

        <div id="NewControl">
          {Object.keys(filterGuiInfo).map((guiInfo, index) => (
            <DpFilterList
              key={`${filterListKey}-${index}`} // Use unique key to force re-render
              guiInfo={guiInfo}
              filterGuiInfo={filterGuiInfo}
              filterDefinitions={filterDefinitions}
              filterChangedState={filterChangedState}
              filterStates={filterStates}
            />
          ))}
        </div>

        <Box sx={{ mt: "100px" }}>
          <Box>
            <Typography sx={{ fontSize: "24px", color: "red" }} variant="div">
              Debugging Information
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "19px" }} variant="div">
            Patients Matching Filters: {patientsMatchingAllFilters.length}
          </Typography>
          <Box
            sx={{
              display: "grid",
              fontSize: "14px",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {patientsMatchingAllFilters.map((patientId, index) => (
              <div key={index}>{patientId}</div>
            ))}
          </Box>
        </Box>
      </React.Fragment>
    );
  }
};

export default CohortFilter;
