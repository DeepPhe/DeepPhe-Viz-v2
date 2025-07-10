import React, { useEffect, useMemo, useState } from "react";
import "./CohortFilter.css";
import "rc-slider/assets/index.css";
import DpFilterList from "./subcomponents/DpFilterList";
import { fetchFilterDefinitions, initializeFilterDefinitions } from "../../../utils/Filter";
import { fetchPatientArrays } from "../../../utils/db/Patient";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import filterPatients from "../../../utils/FilterPatients";

// Outside your component:
const MemoizedDpFilterList = React.memo(DpFilterList);

// Then in your render:

const CohortFilter = (props) => {
  const db = props.db;
  const [loadingStates, setLoadingStates] = useState({
    filterDefinition: true,
    patientArrays: true,
    filterStates: true,
  });

  // Update only the specific loading state

  const [oldFilterDefinitions, setOldFilterDefinitions] = useState(undefined);

  const [filterGuiInfo, setFilterGuiInfo] = useState({});
  const [filterDefinitions, setFilterDefinitions] = useState(undefined);
  const [patientArrays, setPatientArrays] = useState(undefined);
  const [filterStates, setFilterStates] = useState(undefined);
  const [numFilters, setNumFilters] = useState(-1);
  const [filtersLoaded, setFiltersLoaded] = useState(new Set());

  const [uniquePatientIds, setUniquePatientIds] = useState([]);
  const [patientsMatchingAllFiltersUpToDate, setPatientsMatchingAllFiltersUpToDate] =
    useState(false);
  const [patientsMatchingAllFilters, setPatientsMatchingAllFilters] = useState([]);
  const [filterListKey, setFilterListKey] = useState(0);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const stillLoading = () => {
    return (
      loadingStates.filterDefinition || loadingStates.patientArrays || loadingStates.filterStates
    );
  };

  const copyFilterDefinitions = (definitions) => {
    const newDefinitions = definitions.map((definition) => {
      return { ...definition };
    });
    return newDefinitions;
  };

  const compareFilterDefinitions = (oldDefinitions, newDefinitions) => {
    if (oldDefinitions === undefined) return false;
    const oldDefStr = JSON.stringify(oldDefinitions);
    const newDefStr = JSON.stringify(newDefinitions);
    return oldDefStr === newDefStr;
  };

  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    console.log("useEffect db");
    fetchPatientArrays(db).then((patientArraysObj) => {
      setPatientArrays(patientArraysObj.patientArrays);
      setUniquePatientIds(patientArraysObj.uniquePatientIds);
      updateLoadingState("patientArrays", false);
    });
  }, [db]);

  useEffect(() => {
    if (patientArrays) {
      console.log("useEffect patientArrays");
      fetchFilterDefinitions().then((filterDefinitions) => {
        initializeFilterDefinitions(filterDefinitions, patientArrays).then((arr) => {
          setFilterDefinitions(arr[0]);
          setNumFilters(arr[0].length);
          setFilterGuiInfo(arr[1]);
          updateLoadingState("filterDefinition", false);
        });
      });
    }
  }, [patientArrays]);

  useEffect(() => {
    if (filterDefinitions && patientArrays) {
      console.log("useEffect filterDefinitions & patientArrays");
      if (!compareFilterDefinitions(oldFilterDefinitions, filterDefinitions)) {
        runFilters().then((newFilterState) => {
          setFilterStates(newFilterState);
          updateLoadingState("filterStates", false);
        });
      }
      setOldFilterDefinitions(copyFilterDefinitions(filterDefinitions));
    }
  }, [filterDefinitions]);

  useEffect(() => {
    if (numFilters === filtersLoaded.size) {
      setLoadingFilters(false);
      console.log("useEffect filtersLoaded");
    }
  }, [filtersLoaded, numFilters]);

  const runFilters = () => {
    return new Promise((resolve, reject) => {
      filterPatients(patientArrays, uniquePatientIds, filterDefinitions, false).then(
        (filterResults) => {
          setPatientsMatchingAllFilters(filterResults.patientsMatchingAllFilters);
          resolve(filterResults.filterData);
        }
      );
    });
  };

  const filterChangedState = (definition) => {
    if (!stillLoading()) {
      console.log("filter changed state");
      updateLoadingState("filterDefinition", true);
      runFilters().then((newFilterState) => {
        setFilterStates(newFilterState);
        updateLoadingState("filterDefinition", false);
      });
    }
  };

  const filterInitialized = (definition) => {};

  const getMemoizedFilterList = useMemo(() => {
    if (!stillLoading()) {
      return Object.keys(filterGuiInfo).map((guiInfo, index) => (
        <MemoizedDpFilterList
          key={`${filterListKey}-${index}`} // Use unique key to force re-render
          guiInfo={guiInfo}
          filterGuiInfo={filterGuiInfo}
          filterDefinitions={filterDefinitions}
          filterChangedState={filterChangedState}
          filterStates={filterStates}
          filterInitialized={filterInitialized}
        />
      ));
    } else {
      return "";
    }
  }, [
    filterDefinitions,
    filterStates,
    filterGuiInfo,
    filterListKey,
    filterChangedState,
    filterInitialized,
    loadingStates,
  ]);

  if (stillLoading()) return <div>Data is coming soon...</div>;
  else {
    console.log("loading again");
    return (
      <React.Fragment>
        <div id={"NewBasicControl"}></div>
        <div>Selected Patients: {patientsMatchingAllFilters.length}</div>

        <div id="NewControl">{getMemoizedFilterList}</div>

        <Box id="patientsMatchingAllFilters" sx={{ mt: "1px" }}>
          {patientsMatchingAllFilters.size > 0 ? (
            <Box
              sx={{
                display: "grid",
                fontSize: "14px",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "10px",
                marginTop: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "4px",
              }}
            >
              {Array.from(patientsMatchingAllFilters).map((patientId, index) => (
                <Typography
                  key={index}
                  component="div"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {patientId}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ gridColumn: "span 10" }}>No matching patients</Typography>
          )}
        </Box>
        <Box sx={{ mt: "100px" }}>
          <Box>
            <Typography sx={{ fontSize: "24px", color: "red" }} variant="div">
              Debugging Information
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "19px" }} variant="div">
            Patients Matching Filters: {patientsMatchingAllFilters.size}
          </Typography>
          <Box
            sx={{
              display: "grid",
              fontSize: "14px",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: "10px",
              marginTop: "10px",
            }}
          ></Box>
        </Box>
      </React.Fragment>
    );
  }
};

export default CohortFilter;
