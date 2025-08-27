import React, { useEffect, useState } from "react";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import CohortFilter from "./CohortFilter";
import { fetchPatientDatabase } from "../../../utils/db/DeepPheDb";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const TopCharts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  // const Button = styled("button")({});

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
      <React.Fragment>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, mb: 4 }}>
          <AppBar position="static" elevation={4} sx={{ backgroundColor: "#264653" }}>
            <Toolbar>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontWeight: 400,
                  letterSpacing: 0.5,
                  py: 1.5,
                  color: "white",
                }}
              >
                DeepPhe Visualizer v2.1
              </Typography>

              {/*<Nav className="justify-content-end" style={{ width: "100%" }}>*/}
              <Button
                // className={"navItem"}
                variant={"outlined"}
                color={"white"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://deepphe.github.io/"
                sx={{ marginLeft: "10px" }}
              >
                About
              </Button>
              <Button
                // className={"navItem"}
                variant={"outlined"}
                color={"white"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/DeepPhe/"
              >
                GitHub
              </Button>
              {/*</Nav>*/}
            </Toolbar>
          </AppBar>
        </Box>
        <Grid
          container
          direction="row"
          justifyContent="center"
          wrap="wrap"
          align="center"
          spacing={5}
          marginTop={2}
          sx={{ width: "100%" }}
        >
          <CohortFilter db={db}></CohortFilter>
        </Grid>
      </React.Fragment>
    );
  }
};

export default TopCharts;
