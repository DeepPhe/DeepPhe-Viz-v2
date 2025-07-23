import React from "react";
import PropTypes from "prop-types";
// MUI v5 components
import Grid from "@mui/material/Grid";

export default function GridContainer(props) {
  const { children, ...rest } = props;
  return (
    <Grid
      container
      {...rest}
      sx={{
        margin: "0 -15px !important",
        width: "unset",
      }}
    >
      {children}
    </Grid>
  );
}

GridContainer.propTypes = {
  children: PropTypes.node,
};
