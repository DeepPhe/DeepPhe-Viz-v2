import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel, FormGroup } from "@mui/material";
import "./DpCheckboxList.css";
import { BarChart } from "@mui/x-charts";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { blueberryTwilightPalette } from "@mui/x-charts/colorPalettes";
import $ from "jquery";

function DpCheckboxList(props) {
  const [definition, setDefinition] = React.useState(props.definition);

  const [checkedSeries, setCheckedSeries] = useState({
    male: true,
    female: true,
  });

  const getCheckboxName = (checkbox) => {
    return definition.fieldName + "_" + checkbox.name + "_checkbox";
  };

  const getCheckboxTotalPatients = (checkbox, globalPatientCountsForCategories) => {
    // let idx = globalPatientCountsForCategories.findIndex((category) => {
    //   return category.category === checkbox.name;
    // });
    // return globalPatientCountsForCategories[idx].count;
    console.log(
      "rrrrrr",
      $("#myChart g.MuiChartsAxis-tickContainer:has(tspan:contains('Female'))")[0]
    );
    //     <foreignObject x="30%" y="31%" width="100%" height="100%" style="
    //     x: -57%;
    //     y: -6%;
    //     /* width: 100%; */
    //     position: absolute;
    // ">
    //       <input type="checkbox" checked="">
    //     </foreignObject>')
  };

  const getTotalPatients = (globalPatientCountsForCategories) => {
    let count = 0;
    globalPatientCountsForCategories.forEach((category) => {
      count = count + category.count;
    });
    return count;
  };

  const handleCheckboxChange = (event) => {
    console.log(event.target);
    setCheckedSeries({
      ...checkedSeries,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCheckUpdate = (event) => {
    const checkboxLabel = event.target.labels[0].innerText;
    const idx = definition.checkboxes.findIndex((x) => x.name === checkboxLabel);
    definition.checkboxes[idx].checked = event.target.checked;
    setDefinition({ ...definition });
  };

  useEffect(() => {
    props.broadcastUpdate(definition);
  }, [definition]);
  const dataset = [
    {
      value: 50,
      month: "Male",
    },
    {
      value: 50,
      month: "Female",
    },
  ];
  const newTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#3f51b5",
      },
      secondary: {
        main: "#5c283a",
      },
      background: {
        default: "rgba(0,0,0)",
        paper: "#56b0ff",
      },
      text: {
        primary: "rgba(255,255,255,0.87)",
      },
    },
  });
  const seriesA = {
    data: [2, 3, 1, 4, 5],
    label: "Patients Meeting All Filters",
    color: "#187bcd",
    id: "patients-meeting-all-filters",
  };
  const seriesB = {
    data: [3, 1, 4, 2, 1],
    label: "Patients Meeting This Filter",
    color: "#2a9df4",
    id: "patients-meeting-this-filter",
  };
  const seriesC = {
    data: [3, 2, 4, 5, 1],
    label: "Remaining Patients",
    color: "#d0efff",
    id: "remaining-patients",
  };

  const setAxisData = (d) => {
    console.log(d);
  };

  const sizingProps = { height: 200, width: 400 };
  const categories = ["Male", "Female"];
  const hue = checkedSeries["male"] ? "green" : "purple";

  const valueFormatter = (value: number | null) => `${value}mm`;
  console.log($.fn.jquery);
  return (
    <React.Fragment>
      <ThemeProvider theme={newTheme}>
        <Grid item md={7} className="filter-inner-container no_padding_grid">
          <Box bgcolor={newTheme.palette.background.default} sx={{ marginBottom: 10 }}>
            {/*<div className={"slider-container"}>*/}

            <Typography sx={{ color: newTheme.palette.text.primary }} variant="h4" component="h4">
              {definition.fieldName}
            </Typography>
            {/*<FormControlLabel*/}
            {/*  checked={true}*/}
            {/*  control={<Checkbox onChange={(event) => setIsResponsive(event.target.checked)} />}*/}
            {/*  label="Use responsive container"*/}
            {/*  labelPlacement="end"*/}
            {/*  sx={{ top: 200 }}*/}
            {/*/>*/}
            <FormGroup row>
              {Object.keys(checkedSeries).map((key) => (
                <FormControlLabel
                  sx={{ color: newTheme.palette.text.primary }}
                  key={key}
                  control={
                    <Checkbox
                      checked={checkedSeries[key]}
                      onChange={handleCheckboxChange}
                      name={key}
                    />
                  }
                  label={key.toUpperCase()}
                />
              ))}
            </FormGroup>

            <span id={"myChart"}>
              <BarChart
                onAxisClick={(event, d) => setAxisData(d)}
                // dataset={dataset}
                // yAxis={[{ scaleType: "band", dataKey: "month" }]}
                // series={[{ dataKey: "value", label: "Seoul rainfall", valueFormatter }]}
                colors={blueberryTwilightPalette}
                layout="horizontal"
                slotProps={{ legend: { hidden: true } }}
                barLabel={(value) => "Patients " + value + "Meeting All Filters"}
                yAxis={[
                  {
                    // id: "x-axis-id",
                    // label: this.state.definition.fieldName,
                    scaleType: "band",
                    valueFormatter: (value) => `${value}`,
                    data: categories,
                    colorMap: {
                      type: "ordinal",
                      values: ["Male", "Female"],
                      colors: ["blue", hue, "blue"],
                    },
                  },
                ]}
                series={[
                  { ...seriesA, stack: "total" },
                  { ...seriesB, stack: "total" },
                ]}
                {...sizingProps}
              />
            </span>
          </Box>
          {/*</div>*/}
        </Grid>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default DpCheckboxList;
