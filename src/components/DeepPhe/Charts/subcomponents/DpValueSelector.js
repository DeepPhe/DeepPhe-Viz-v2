import React, { useState } from "react";
import { Box, FormControl } from "@mui/material";
import DpFilterBox from "./DpFilterBox";

const CheckboxRowRTL = (props) => {
  const { definition, broadcastUpdate } = props;
  const fontSize = "14px"; // Adjust label font size
  const checkboxSize = "18px"; // Adjust checkbox size
  const columnGap = "0px"; // Adjust spacing between checkboxes

  const [checkedItems, setCheckedItems] = useState(
    definition.categoricalRange.reduce((acc, item) => {
      acc[item] = true;
      return acc;
    }, {}) // Initialize accumulator as an empty object
  );

  const handleChange = (event) => {
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
    });
  };

  const selectedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = definition.categoricalRange.length;

  return (
    <React.Fragment>
      <span
        className={
          "dp-filter-box-" +
          definition.fieldName.replace(" ", "_") +
          " dp-filter-box col-md-" +
          props.expandedLevel
        }
      >
        <DpFilterBox
          chart={
            <FormControl
              component="fieldset"
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: 1,
              }}
            >
              <Box
                id={"boolean-list-row"}
                sx={{
                  overflowX: "auto", // Enables horizontal scrolling
                  whiteSpace: "nowrap", // Prevents wrapping
                  width: "auto", // Ensures it fits the parent
                  maxWidth: "800px", // Adjust as needed
                  border: "1px solid #ccc", // Optional: adds a subtle border for visibility
                  padding: "8px",
                  display: "flex",
                }}
              ></Box>
            </FormControl>
          }
          definition={definition}
          type={"BarChartWithSlider"}
          fullWidth={props.fullWidth}
          broadcastUpdate={broadcastUpdate}
        />
      </span>
    </React.Fragment>
  );
};

export default CheckboxRowRTL;
