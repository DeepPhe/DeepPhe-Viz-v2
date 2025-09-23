import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

// Create styled component instead of using makeStyles
const CardHeaderRoot = styled(Box)(({ theme, color }) => ({
  padding: "0.75rem 1.25rem",
  marginBottom: "0",
  borderBottom: "none",
  background: "transparent",
  zIndex: 3,
  "&:first-of-type": {
    borderRadius: "calc(.25rem - 1px) calc(.25rem - 1px) 0 0",
  },
  ...(color &&
    color !== "plain" && {
      background: {
        warning: theme.palette.warning.main,
        success: theme.palette.success.main,
        danger: theme.palette.error.main,
        info: theme.palette.info.main,
        primary: theme.palette.primary.main,
        secondary: theme.palette.secondary.main,
        dark: theme.palette.grey[800],
      }[color],
      boxShadow: `0 12px 20px -10px rgba(${
        color === "warning"
          ? "255,152,0"
          : color === "success"
          ? "76,175,80"
          : color === "danger"
          ? "244,67,54"
          : color === "info"
          ? "0,188,212"
          : color === "primary"
          ? "156,39,176"
          : color === "secondary"
          ? "156,39,176"
          : "33,33,33"
      },.28)`,
      color: "#FFFFFF",
    }),
  ...(color === "plain" && {
    marginLeft: "0px",
    marginRight: "0px",
  }),
}));

export default function CardHeader(props) {
  const { className, children, color = "plain", plain, stats, icon, ...rest } = props;

  const cardHeaderClasses = classNames({
    "card-header": true,
    "card-header-icon": icon,
    "card-header-plain": plain,
    "card-header-stats": stats,
    [className || ""]: className !== undefined,
  });

  return (
    <CardHeaderRoot className={cardHeaderClasses} color={color} {...rest}>
      {children}
    </CardHeaderRoot>
  );
}

CardHeader.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf([
    "warning",
    "success",
    "danger",
    "info",
    "primary",
    "secondary",
    "dark",
    "plain",
  ]),
  plain: PropTypes.bool,
  stats: PropTypes.bool,
  icon: PropTypes.bool,
  children: PropTypes.node,
};
