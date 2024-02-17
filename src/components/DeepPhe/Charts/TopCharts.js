import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import CohortFilter from "./CohortFilter";
import { styled } from "@mui/material/styles";

const TopCharts = () => {
  const [patientsAndStagesInfo, setPatientsAndStagesInfo] = useState({});
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [isLoading, setIsLoading] = useState(true);
  const maxAge = useMemo(() => {
    if (Object.keys(patientsAndStagesInfo).length !== 0) {
      const ages = patientsAndStagesInfo.stagesInfo
        .map((el) => el.patients.map((el2) => el2.firstEncounterAge))
        .flat();
      return ages.toSorted().toReversed().at();
    } else {
      return 0;
    }
  }, [patientsAndStagesInfo]);
  const minAge = useMemo(() => {
    if (Object.keys(patientsAndStagesInfo).length !== 0) {
      const ages = patientsAndStagesInfo.stagesInfo
        .map((el) => el.patients.map((el2) => el2.firstEncounterAge))
        .flat();
      return ages.toSorted().at();
    } else {
      return 1000;
    }
  }, [patientsAndStagesInfo]);

  const Button = styled("button")({});

  useEffect(() => {
    reset();
  }, []);

  function reset() {
    const fetchData = async () => {
      return new Promise(function (resolve, reject) {
        fetch("http://localhost:3001/api/cohortData").then(function (response) {
          if (response) {
            resolve(response);
          } else {
            reject("User not logged in");
          }
        });
      });
    };
    fetchData().then(function (response) {
      response.json().then(function (json) {
        const newPatientsAndStagesInfo = { patients: json.patients, stagesInfo: json.stagesInfo };
        setPatientsAndStagesInfo(newPatientsAndStagesInfo);
        setIsLoading(false);
      });
    });
  }

  function clickMe() {
    reset();
  }

  if (isLoading) {
    return <div>Data is coming soon...</div>;
  } else {
    return (
      <Grid container direction="row" justifyContent="center" align="center" spacing={10}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <CohortFilter></CohortFilter>
        </Grid>
      </Grid>
    );
  }
};

export default TopCharts;
