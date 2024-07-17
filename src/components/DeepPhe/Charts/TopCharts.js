import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import CohortFilter from "./CohortFilter";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import DataGridDemo from "./subcomponents/DemoDataGrid.js";

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

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#3f51b5",
      },
      secondary: {
        main: "#5c283a",
      },
      background: {
        default: "rgba(0,0,0)",
        paper: "#000000",
      },
      text: {
        primary: "rgba(255,255,255,0.87)",
        secondary: "rgba(255,255,255,0.90)",
      },
    },
  });

  if (isLoading) {
    return <div>Data is coming soon...</div>;
  } else {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Typography align={"center"} variant={"h3"}>
          DeepPhe Cohort Filter
        </Typography>
        <Grid container direction="row" justifyContent="center" align="center" spacing={10}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <CohortFilter></CohortFilter>
            <DataGridDemo></DataGridDemo>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
};

export default TopCharts;
