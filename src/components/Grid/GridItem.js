import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// MUI v5 components
import Grid from "@mui/material/Grid";

export default function GridItem(props) {
  const { children, ...rest } = props;
  return (
    <Grid
      item
      {...rest}
      sx={{
        padding: "0 15px !important",
      }}
    >
      {children}
    </Grid>
  );
}

GridItem.propTypes = {
  children: PropTypes.node,
};
