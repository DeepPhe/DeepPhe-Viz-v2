import GridContainer from "../Grid/GridContainer";
import {SemanticGroupPanel} from "./SemanticGroupPanel";
import React, {useState} from "react";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";

import {ConfidencePanel} from "./ConfidencePanel";
import {ConceptListPanel} from "./ConceptListPanel";
import {ConfidenceDataViz} from "./ConfidenceDataViz";
import {Box} from '@mui/material';
import DropdownWithCheckboxes from "./DropDownCheckBoxes";
import { styled } from '@mui/system';
import { Tab as BaseTab, tabClasses } from '@mui/base/Tab';
import { TabsList as BaseTabsList } from '@mui/base/TabsList';
import { Tabs } from '@mui/base/Tabs';
import { buttonClasses } from '@mui/base/Button';


function TabPanel(props) {
    const {children, value, index, ...other} = props;
    const isActive = value === index;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box className="custom-box" sx={{p: 3 }}>{children}</Box>}
        </div>
    );
}

const blue = {
    50: '#F0F7FF',
    100: '#C2E0FF',
    200: '#80BFFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0059B2',
    800: '#004C99',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

// const Tab = styled(BaseTab)`
//   font-family: 'IBM Plex Sans', sans-serif;
//   color: #fff;
//   cursor: pointer;
//   font-size: 0.875rem;
//   font-weight: 600;
//   background-color: transparent;
//   padding: 10px 0; // Set padding for vertical space
//   margin: 0; // Remove margin to ensure uniformity
//   border: 1px solid transparent; // Set a default transparent border
//   border-radius: 7px; // Rounded corners at the top
//   flex: 1; // Allow tabs to grow equally
//
//   &:hover {
//     background-color: ${blue[400]};
//   }
//
//   &.${tabClasses.selected} {
//     background-color: #fff;
//     color: ${blue[600]};
//     //border: 1px solid red; // Border when selected
//     //border-bottom: 1px solid transparent; // Ensure no bottom border when selected
//   }
//
//   &.${tabClasses.disabled} {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }
// `;

const Tab = styled(BaseTab)`
  font-family: 'IBM Plex Sans', sans-serif;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: transparent;
  //width: 100%;
  //padding: 10px 12px;
  padding: 10px;
  margin: 6px;
  border: none;
  border-radius: 7px;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${blue[400]};
  }

  &:focus {
    color: #fff;
    outline: 3px solid ${blue[200]};
  }

  &.${tabClasses.selected} {
    background-color: #fff;
    color: ${blue[600]};
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabsList = styled(BaseTabsList)(
    ({ theme }) => `
  min-width: 400px;
  background-color: ${blue[500]};
  border-radius: 7px;
  display: flex;
  margin: 20px;
  margin-bottom: 0px;
  align-items: stretch;
  justify-content: center;
  align-content: space-between;
  box-shadow: 0px 4px 30px ${theme.palette.mode === 'dark' ? grey[900] : grey[200]};
  `,
);


function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
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

    const [selectedOptions, setSelectedOptions] = useState(["Document Mention Count",
        "Patient Mention Count",
        "Concept Confidence"]);

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
                    <Tabs defaultValue={0} value={tabValue}
                          onChange={handleTabChange}
                          aria-label="concept panel tabs">

                        <TabsList>
                            <Tab {...a11yProps(0)}> Concepts</Tab>
                            <Tab {...a11yProps(1)}> Group Filter</Tab>
                            <Tab {...a11yProps(2)}> Confidence Filter </Tab>
                        </TabsList>


                        <TabPanel value={tabValue} index={0}>
                            <CardBody style={{border: "none", boxShadow: "none"}}>
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
                            <CardBody style={{border: "none", boxShadow: "none"}}>
                                <SemanticGroupPanel
                                    semanticGroups={semanticGroups}
                                    handleSemanticGroupChange={handleSemanticGroupChange}
                                    confidence={confidence}
                                    concepts={concepts}
                                />
                            </CardBody>
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <CardBody style={{border: "none", boxShadow: "none"}}>
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
                                        sliderPostion={sliderPosition}
                                        setSliderPostion={setSliderPosition}
                                    />
                                </GridContainer>
                                <GridContainer>
                                    <ConfidencePanel/>
                                </GridContainer>
                            </CardBody>
                        </TabPanel>


                    </Tabs>
                </Box>
            </Card>

        </React.Fragment>
    );
}
