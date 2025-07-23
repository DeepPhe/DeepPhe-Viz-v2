import React from "react";
import PropTypes from "prop-types";
// Update imports to MUI v5
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

// Create styled component instead of using makeStyles
const CardRoot = styled(Box)(({ theme, plain, profile, chart }) => ({
  // Original styles from cardStyle.js
  border: "0",
  marginBottom: "30px",
  marginTop: "30px",
  borderRadius: "6px",
  color: "rgba(0, 0, 0, 0.87)",
  background: "#fff",
  width: "100%",
  boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.14)",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  minWidth: "0",
  wordWrap: "break-word",
  fontSize: ".875rem",
  // Apply conditional styles
  ...(plain && {
    background: "transparent",
    boxShadow: "none",
  }),
  ...(profile && {
    marginTop: "30px",
    textAlign: "center",
  }),
  ...(chart && {
    paddingTop: "0",
    paddingRight: "0",
    paddingBottom: "0",
    paddingLeft: "0",
  }),
}));

export default function Card(props) {
  const { className, children, plain, profile, chart, ...rest } = props;

  return (
    <CardRoot plain={plain} profile={profile} chart={chart} className={className} {...rest}>
      {children}
    </CardRoot>
  );
}

Card.propTypes = {
  className: PropTypes.string,
  plain: PropTypes.bool,
  profile: PropTypes.bool,
  chart: PropTypes.bool,
  children: PropTypes.node,
};
