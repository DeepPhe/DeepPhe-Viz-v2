import React, { useCallback, useEffect, useState, useTransition } from "react";
import "./CohortFilter.css";
import "rc-slider/assets/index.css";
import DpFilterList from "./subcomponents/DpFilterList";
import { fetchFilterDefinitions, initializeFilterDefinitions } from "../../../utils/Filter";
import { fetchPatientArrays } from "../../../utils/db/Patient";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import filterPatients from "../../../utils/FilterPatients";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";

const CohortFilter = (props) => {
  const db = props.db;

  const [loadingStates, setLoadingStates] = useState({
    filterDefinition: true,
    patientArrays: true,
    filterStates: true,
  });

  const [oldFilterDefinitions, setOldFilterDefinitions] = useState(undefined);
  const [filterGuiInfo, setFilterGuiInfo] = useState({});
  const [filterDefinitions, setFilterDefinitions] = useState(undefined);
  const [patientArrays, setPatientArrays] = useState(undefined);
  const [filterStates, setFilterStates] = useState(undefined);
  const [uniquePatientIds, setUniquePatientIds] = useState([]);
  const [patientsMatchingAllFilters, setPatientsMatchingAllFilters] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (
      !loadingStates.filterDefinition &&
      !loadingStates.patientArrays &&
      !loadingStates.filterStates
    ) {
      setInitialLoading(false);
    }
  }, [loadingStates]);

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
    if (patientArrays && uniquePatientIds) {
      console.log("useEffect patientArrays");
      fetchFilterDefinitions().then((filterDefinitions) => {
        initializeFilterDefinitions(filterDefinitions, patientArrays, uniquePatientIds).then(
          (arr) => {
            setFilterDefinitions(arr[0]);
            setFilterGuiInfo(arr[1]);
            updateLoadingState("filterDefinition", false);
          }
        );
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

  const runFilters = useCallback(() => {
    return new Promise((resolve, reject) => {
      filterPatients(patientArrays, uniquePatientIds, filterDefinitions, false).then(
        (filterResults) => {
          setPatientsMatchingAllFilters(filterResults.patientsMatchingAllFilters);
          resolve(filterResults.filterData);
        }
      );
    });
  }, [patientArrays, uniquePatientIds, filterDefinitions]);

  const [isPending, startTransition] = useTransition();
  const filterChangedState = useCallback(
    (definition) => {
      if (!initialLoading) {
        console.log("filter changed state");
        updateLoadingState("filterStates", true);
        runFilters().then((newFilterState) => {
          setFilterStates(newFilterState);
          setFilterDefinitions(filterDefinitions);
          updateLoadingState("filterStates", false);
        });
      }
    },
    [initialLoading, runFilters]
  );

  useEffect(() => {
    console.log("useEffect filterStates", filterStates);
  }, [filterStates]);

  if (initialLoading) return <div>Data is coming soon...</div>;
  else {
    // Build a patientId-to-gender, patientId-to-age, and patientId-to-cancer map
    const patientIdToGender = {};
    const patientIdToAge = {};
    const patientIdToCancer = {};
    const patientIdToStage = {};
    if (patientArrays) {
      Object.keys(patientArrays).forEach((key) => {
        if (key.startsWith("GENDER.")) {
          const gender = key.split("GENDER.")[1];
          patientArrays[key].forEach((pid) => {
            patientIdToGender[pid] = gender;
          });
        }
        if (key.startsWith("AGE_AT_DX.")) {
          const age = key.split("AGE_AT_DX.")[1];
          patientArrays[key].forEach((pid) => {
            patientIdToAge[pid] = age;
          });
        }
        if (key.startsWith("CANCER.")) {
          const cancer = key.split("CANCER.")[1];
          patientArrays[key].forEach((pid) => {
            // If a patient has multiple cancers, concatenate them with a comma
            if (patientIdToCancer[pid]) {
              patientIdToCancer[pid] += `, ${cancer}`;
            } else {
              patientIdToCancer[pid] = cancer;
            }
          });
        }
        if (key.startsWith("STAGE.")) {
          const stage = key.split("STAGE.")[1];
          patientArrays[key].forEach((pid) => {
            if (patientIdToStage[pid]) {
              patientIdToStage[pid] += `, ${stage}`;
            } else {
              patientIdToStage[pid] = stage;
            }
          });
        }
      });
    }
    console.log("loading again");
    return (
      <React.Fragment>
        {isPending && <div className="overlay-spinner" />}
        <Grid item md={8}>
          {Object.keys(filterGuiInfo).map((guiInfo, index) => (
            <DpFilterList
              key={`${index}`}
              guiInfo={guiInfo}
              filterGuiInfo={filterGuiInfo}
              filterDefinitions={filterDefinitions}
              filterChangedState={filterChangedState}
              filterStates={filterStates}
              isLoading={loadingStates.filterStates}
            />
          ))}
        </Grid>
        <Grid item md={4}>
          <Typography sx={{ fontWeight: "bold", fontSize: "19px" }} variant="div">
            Patients Matching Filters: {patientsMatchingAllFilters.size}
          </Typography>
          <Box id="patientsMatchingAllFilters" sx={{ mt: "1px" }}>
            {patientsMatchingAllFilters.size > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  fontSize: "14px",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  marginTop: "10px",
                  padding: "10px",
                  border: "1px solid #eee",
                  borderRadius: "4px",
                }}
              >
                {Array.from(patientsMatchingAllFilters).map((patientId, index) => (
                  <Link
                    key={index}
                    to={{
                      pathname: `/patient/${patientId}`,
                      state: { db: db },
                    }}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      component="div"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {patientId}
                      {patientIdToGender[patientId] ||
                      patientIdToAge[patientId] ||
                      patientIdToCancer[patientId] ||
                      patientIdToStage[patientId]
                        ? ` (${patientIdToGender[patientId] || "?"}, Age at Dx: ${
                            patientIdToAge[patientId] || "?"
                          }, Cancer: ${patientIdToCancer[patientId] || "?"})`
                        : ""}
                    </Typography>
                  </Link>
                ))}
              </Box>
            ) : (
              <Typography sx={{ gridColumn: "span 10" }}>No matching patients</Typography>
            )}
          </Box>
          {/*<UpsetFilter uniquePatientIds={uniquePatientIds} patientArrays={patientArrays} />*/}
          <Box sx={{ mt: "100px" }}>
            <Box></Box>
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
        </Grid>
      </React.Fragment>
    );
  }
};

export default CohortFilter;
