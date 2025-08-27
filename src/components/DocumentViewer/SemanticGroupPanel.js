import GridItem from "../Grid/GridItem";
import React, { useState } from "react";
import GridContainer from "../Grid/GridContainer";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { hexToRgba } from "./ColorUtils";

export function SemanticGroupPanel(props) {
  const semanticGroups = props.semanticGroups;
  const handleSemanticGroupChange = props.handleSemanticGroupChange;
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheckboxChange = (e) => {
    handleSemanticGroupChange(e.target.dataset.semanticGroup, e.target.checked);
  };

  const handleAllCheckboxChange = (checked) => {
    Object.keys(semanticGroups).map((group, index) => {
      handleSemanticGroupChange(group, checked);
    });
  };

  const getHeader = () => {
    return (
      <GridContainer className="no-padding">
        {/*<GridItem xs={12} className="no-padding">*/}
        <Box
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "flex-start", // Aligns buttons to the left
            // float: 'left', // Optional: to make the box float left
          }}
          className={`${isVisible ? "visible" : "hidden"}`}
        >
          <Button
            sx={{
              fontSize: "17px",
              fontFamily: "Monaco, monospace",
              fontWeight: "bold",
              mr: 1,
              marginLeft: "10px",
              color: "white !important",
            }}
            id={"check-all-btn"}
            variant="contained"
            size="small"
            // startIcon={iconToggled ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon />}
            onClick={checkAll}
          >
            Check All
          </Button>
          <Button
            sx={{
              fontSize: "17px",
              fontFamily: "Monaco, monospace",
              fontWeight: "bold",
              color: "white !important",
            }}
            id={"uncheck-all-btn"}
            variant="contained"
            size="small"
            onClick={unCheckAll}
          >
            Uncheck All
          </Button>
        </Box>
        {/*</GridItem>*/}
      </GridContainer>
    );
  };

  const getSemanticGroupBox = (group, index, values) => {
    // console.log(values);
    const id = "checkbox" + index;
    const backgroundColor = hexToRgba(values.backgroundColor, 0.65); // Adjust the alpha value as needed
    return (
      <div
        style={{
          margin: "0 5px 5px 0",
          cursor: "pointer",
          fontFamily: "Monaco, monospace",
          borderRadius: "5px",
          float: "left",
          backgroundColor: backgroundColor,
        }}
      >
        <input
          name={"semanticGroups"}
          className={"semantic-checkbox"}
          key={id}
          type="checkbox"
          id={id}
          checked={values.checked}
          onChange={handleCheckboxChange}
          data-semantic-group={group}
        />
        <label className="semantic_label" htmlFor={id}>
          {group}
        </label>
      </div>
    );
  };

  const getSemanticGroups = () => {
    return (
      // adding isVisible to hide semantic-semantic groups when prompted
      <div className={`semantic-groups ${isVisible ? "visible" : "hidden"}`}>
        {Object.keys(semanticGroups).map((group, index) => {
          return getSemanticGroupBox(group, index, semanticGroups[group]);
        })}
      </div>
    );
  };

  function checkAll() {
    handleAllCheckboxChange(true);
  }

  function unCheckAll() {
    handleAllCheckboxChange(false);
  }

  return (
    <GridItem xs={12} className="no-padding">
      {getHeader()}
      {getSemanticGroups()}
    </GridItem>
  );
}
