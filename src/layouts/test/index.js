import React, { useState } from "react";
import { Box, Checkbox, FormControl, FormGroup, FormLabel } from "@mui/material";

const CheckboxRowRTL = () => {
  const numCheckboxes = 50; // Total number of checkboxes
  const fontSize = "14px"; // Adjust label font size
  const checkboxSize = "18px"; // Adjust checkbox size
  const columnGap = "8px"; // Adjust spacing between checkboxes

  const [checkedItems, setCheckedItems] = useState(
    Object.fromEntries(Array.from({ length: numCheckboxes }, (_, i) => [`option${i + 1}`, false]))
  );

  const handleChange = (event) => {
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <FormControl component="fieldset">
      <Box
        sx={{
          overflowX: "auto", // Enables horizontal scrolling
          whiteSpace: "nowrap", // Prevents wrapping
          width: "100%", // Ensures it fits the parent
          maxWidth: "800px", // Adjust as needed
          border: "1px solid #ccc", // Optional: adds a subtle border for visibility
          padding: "8px",
          display: "flex",
        }}
      >
        <FormGroup
          row
          sx={{
            display: "flex",
            flexDirection: "row-reverse", // Align checkboxes from right to left
            gap: columnGap, // Use variable for adjustable spacing
            minWidth: "max-content", // Ensures checkboxes are in a scrollable row
          }}
        >
          {Array.from({ length: numCheckboxes }, (_, i) => {
            const name = `option${i + 1}`;
            return (
              <Box
                key={name}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "40px", // Reduce column width to make them closer
                }}
              >
                <FormLabel
                  sx={{
                    writingMode: "vertical-rl", // Vertical text
                    transform: "rotate(180deg)", // Ensure readable text
                    textAlign: "center",
                    mb: 0.5, // Reduce spacing between label and checkbox
                    fontSize: fontSize, // Control font size dynamically
                  }}
                >
                  {`Option ${i + 1}`}
                </FormLabel>
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
              </Box>
            );
          })}
        </FormGroup>
      </Box>
    </FormControl>
  );
};

export default CheckboxRowRTL;
