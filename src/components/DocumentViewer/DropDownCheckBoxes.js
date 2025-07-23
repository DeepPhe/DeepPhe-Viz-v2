import React from "react";
import { Checkbox, FormControl, ListItemText, MenuItem, Select, Typography } from "@mui/material";

const DropdownWithCheckboxes = (props) => {
  const selectedOptions = props.selectedOptions;
  const onSelectionChange = props.onSelectionChange;
  const options = ["Document Mention Count", "Patient Mention Count", "Concept Confidence"];

  const handleChange = (event) => {
    onSelectionChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <Typography variant="subtitle1" gutterBottom>
        Select Options
      </Typography>
      <Select
        multiple
        value={selectedOptions}
        onChange={handleChange}
        renderValue={(selected) => selected.join(", ")}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedOptions.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DropdownWithCheckboxes;
