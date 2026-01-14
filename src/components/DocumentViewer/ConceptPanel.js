import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React, { useState } from "react";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";
import { ConfidencePanel } from "./ConfidencePanel";
import { ConceptListPanel } from "./ConceptListPanel";
import { ConfidenceDataViz } from "./ConfidenceDataViz";
import { Box, Tab, Tabs } from "@mui/material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const isActive = value === index;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className="custom-box" sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const blue = {
  50: "#F0F7FF",
  100: "#C2E0FF",
  200: "#80BFFF",
  300: "#66B2FF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0059B2",
  800: "#004C99",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    value: index,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export function ConceptPanel(props) {
  const concepts = props.concepts;
  const mentions = props.mentions;
  const doc = props.doc;
  const handleSemanticGroupChange = props.handleSemanticGroupChange;
  const handleConfidenceChange = props.handleConfidenceChange;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  const setFilteredConcepts = props.setFilteredConcepts;
  const confidence = props.confidence;
  const handleTermClick = props.handleTermClick;
  const clickedTerms = props.clickedTerms;
  const filterLabel = props.filterLabel;
  const setFilterLabel = props.setFilterLabel;
  const [confidencePercent, setConfidencePercent] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(40);

  const [selectedOptions, setSelectedOptions] = useState([
    "Document Mention Count",
    "Patient Mention Count",
    "Concept Confidence",
  ]);

  const handleSelectionChange = (newSelections) => {
    setSelectedOptions(newSelections);
  };

  const handleFilterChange = (newFilter) => {
    setFilterLabel(newFilter);
  };

  // State for managing active tab
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <React.Fragment>
      <Card
        style={{
          overflow: "hidden",
          marginTop: "20px",
          border: "none",
          boxShadow: "none",
        }}
      >
        {/* Tabs Navigation */}
        <Box className="custom-box">
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="concept panel tabs">
            {/*<TabsList>*/}
            <Tab label="Concepts" {...a11yProps(0)} />
            <Tab label="Group Filter" {...a11yProps(1)} />
            <Tab label="Confidence Filter" {...a11yProps(2)} />
            {/*</TabsList>*/}
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <CardBody style={{ border: "none", boxShadow: "none" }}>
              <ConceptListPanel
                selectedOptions={selectedOptions}
                doc={doc}
                concepts={concepts}
                mentions={mentions}
                semanticGroups={semanticGroups}
                confidence={confidence}
                setFilteredConcepts={setFilteredConcepts}
                filteredConcepts={filteredConcepts}
                handleTermClick={handleTermClick}
                clickedTerms={clickedTerms}
              />
            </CardBody>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CardBody style={{ border: "none", boxShadow: "none" }}>
              <SemanticGroupPanel
                semanticGroups={semanticGroups}
                handleSemanticGroupChange={handleSemanticGroupChange}
                confidence={confidence}
                concepts={concepts}
              />
            </CardBody>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <CardBody style={{ border: "none", boxShadow: "none" }}>
              <GridContainer>
                <ConfidenceDataViz
                  handleConfidenceChange={handleConfidenceChange}
                  concepts={concepts}
                  doc={doc}
                  mentions={mentions}
                  filterLabel={filterLabel}
                  setFilterLabel={setFilterLabel}
                  onFilterChange={handleFilterChange}
                  confidencePercent={confidencePercent}
                  setConfidencePercent={setConfidencePercent}
                  sliderPosition={sliderPosition}
                  setSliderPosition={setSliderPosition}
                />
              </GridContainer>
              <GridContainer>
                <ConfidencePanel />
              </GridContainer>
            </CardBody>
          </TabPanel>
        </Box>
      </Card>
    </React.Fragment>
  );
}
