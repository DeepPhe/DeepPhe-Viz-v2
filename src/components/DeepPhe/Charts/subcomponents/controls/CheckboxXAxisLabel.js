import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

const CheckboxXAxisLabel = ({ value, checked, onCheck }) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onCheck} />}
      label={value}
      labelPlacement="top"
    />
  );
};

export default CheckboxXAxisLabel;
