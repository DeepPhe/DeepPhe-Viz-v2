import { Box, Checkbox, FormGroup, FormLabel } from "@mui/material";
import React, { useEffect, useState } from "react";

const DpCheckboxesForChart = ({
  fieldName,
  categoricalRange,
  abbrevCategories,
  handleCheckboxClick,
  paddingRight,
  minWidth,
  width,
}) => {
  const fontSize = "9px"; // Adjust label font size
  const checkboxSize = "18px"; // Adjust checkbox size
  const columnGap = "0px"; // Adjust spacing between checkboxes

  const [checkedItems, setCheckedItems] = useState(
    categoricalRange.reduce((acc, item) => {
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

  useEffect(() => {
    handleCheckboxClick(checkedItems);
  }, [checkedItems]);

  if (!(paddingRight && minWidth)) {
    return false;
  } else
    return (
      <FormGroup
        row
        sx={{
          display: "flex",
          flexDirection: "row", // Align checkboxes from right to left
          gap: columnGap, // Use variable for adjustable spacing
          width: width,
          alignItems: "baseline",
          flexWrap: "nowrap",
          marginTop: "-30px",
          paddingRight: paddingRight,
          overflow: "visible", // Ensures checkboxes are in a scrollable row
        }}
      >
        {abbrevCategories.map((name, i) => {
          return (
            <Box
              id={"checkbox-row" + i}
              key={name}
              sx={{
                display: "flex",
                flexDirection: "column",
                width: minWidth,
                alignItems: "normal",
              }}
            >
              <Checkbox
                checked={checkedItems[name]}
                onChange={handleChange}
                name={name}
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: checkboxSize, // Set checkbox size dynamically
                  },
                }}
              />
              <FormLabel
                sx={{
                  // transform: "translate(-15px, 5px) rotate(25deg)", // Ensure readable text
                  mb: 0.5, // Reduce spacing between label and checkbox
                  fontSize: fontSize,
                  whiteSpace: "nowrap",
                  // wordWrap: "break-word",
                  lineHeight: "1",
                }}
              >
                {name.replace(fieldName + ".", "")}
              </FormLabel>
            </Box>
          );
        })}
      </FormGroup>
    );
};
export default DpCheckboxesForChart;
