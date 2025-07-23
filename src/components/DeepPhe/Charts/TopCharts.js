import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import CohortFilter from "./CohortFilter";
import { fetchPatientDatabase } from "../../../utils/db/DeepPheDb";

const TopCharts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  const Button = styled("button")({});

  useEffect(() => {
    fetchPatientDatabase().then((db) => {
      setDb(db);
      setIsLoading(false);
    });
  }, []);

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
        <Typography align={"center"} variant={"h6"}>
          Cohort Filter
        </Typography>
        <Grid container direction="row" justifyContent="center" align="center" spacing={10}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <CohortFilter db={db}></CohortFilter>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
};

export default TopCharts;
