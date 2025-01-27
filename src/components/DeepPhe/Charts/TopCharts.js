import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import CohortFilter from "./CohortFilter";
import DataGridDemo from "./subcomponents/DemoDataGrid";
import { initDb } from "../../../utils/db/DeepPheDb";

const TopCharts = () => {
  const [patientsAndStagesInfo, setPatientsAndStagesInfo] = useState({});
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);
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
    initDb().then((db) => {
      setDb(db);
      setIsLoading(false);
    });
  }

  function clickMe() {
    reset();
  }

  const theme = createTheme({
    palette: {
      type: "light",
      primary: {
        main: "#187bcd",
      },
      secondary: {
        main: "#f50057",
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
            <CohortFilter db={db}></CohortFilter>
            <DataGridDemo></DataGridDemo>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
};

export default TopCharts;
