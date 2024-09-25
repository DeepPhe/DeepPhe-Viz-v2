// BarChartWithCheckboxes.js
import React, { useState } from "react";
import { Checkbox, Container, FormControlLabel, FormGroup } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { Tooltip } from "chart.js";

const data = [
  { name: "Category 1", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Category 2", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Category 3", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Category 4", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Category 5", uv: 1890, pv: 4800, amt: 2181 },
];

const BarChartWithCheckboxes = () => {
  const [checkedSeries, setCheckedSeries] = useState({
    uv: true,
    pv: true,
    amt: true,
  });

  const handleCheckboxChange = (event) => {
    setCheckedSeries({
      ...checkedSeries,
      [event.target.name]: event.target.checked,
    });
  };
  let sizingProps = { height: 150 };

  return (
    <Container>
      <FormGroup row>
        {Object.keys(checkedSeries).map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox checked={checkedSeries[key]} onChange={handleCheckboxChange} name={key} />
            }
            label={key.toUpperCase()}
          />
        ))}
      </FormGroup>
      <BarChart
        slots={{
          barLabel:
            "<Checkbox checked={checkedSeries[key]} onChange={handleCheckboxChange} name={key} />",
        }}
        data={data}
        layout="horizontal"
        margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
        series={[
          { dataKey: "uv", fill: "#8884d8" },
          { dataKey: "pv", fill: "#82ca9d" },
          { dataKey: "amt", fill: "#ffc658" },
        ]}
        {...sizingProps}
      >
        <Tooltip />
        {/*{checkedSeries.uv && <BarSeries dataKey="uv" fill="#8884d8" />}*/}
        {/*{checkedSeries.pv && <BarSeries dataKey="pv" fill="#82ca9d" />}*/}
        {/*{checkedSeries.amt && <BarSeries dataKey="amt" fill="#ffc658" />}*/}
      </BarChart>
    </Container>
  );
};

export default BarChartWithCheckboxes;
