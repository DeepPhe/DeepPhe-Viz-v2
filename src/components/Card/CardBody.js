import React from "react";
import PropTypes from "prop-types";
// Update imports to MUI v5
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

// Create styled component instead of using makeStyles
const CardBodyRoot = styled(Box)({
  padding: "0.9375rem 20px",
  flex: "1 1 auto",
  WebkitFlex: "1",
  position: "relative",
});

export default function CardBody(props) {
  const { className, children, ...rest } = props;

  return (
    <CardBodyRoot className={className} {...rest}>
      {children}
    </CardBodyRoot>
  );
}

CardBody.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
