import GridContainer from "../Grid/GridContainer";
import GridItem from "../Grid/GridItem";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import React, { useEffect, useState } from "react";
import { ConceptPanel } from "./ConceptPanel";
import { DocumentPanel } from "./DocumentPanel";
import $ from "jquery";
import SplitPane from "react-split-pane";
import "./DocumentViewer.css";

export function DocumentViewer(props) {
  const [checkboxGridVisible, setCheckboxGridVisible] = useState(true);
  const patientDocument = props.patientDocument;
  const factBasedReports = props.factBasedReports;
  const reportId = props.reportId;
  const factId = props.factId;
  const mentions = props.mentions;
  const concepts = props.concepts;
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [semanticGroups, setSemanticGroups] = useState({});
  const [fontSize, setFontSize] = useState(15);
  const [confidence, setConfidence] = useState(0);
  const setClickedTerms = props.setClickedTerms;
  const clickedTerms = props.clickedTerms; // Initial state set to empty array
  const [filterLabel, setFilterLabel] = useState("Concepts");

  useEffect(() => {
    if (isEmpty(semanticGroups)) {
      getSemanticGroups();
    }
  }, [semanticGroups, filteredConcepts, setFilteredConcepts]);

  const handleConfidenceChange = (e) => {
    setConfidence(e / 100);
  };

  function isEmpty(obj) {
    for (const i in obj) return false;
    return true;
  }

  class TreeNode {
    constructor(concept, color = null) {
      this.concept = concept; // Concept or topic name
      this.color = color; // Associated color (optional)
      this.subtopics = []; // Array to hold subtopics (children nodes)
    }

    // Method to add a subtopic with an optional color
    addSubtopic(subtopicNode) {
      this.subtopics.push(subtopicNode);
    }

    // Method to print the tree structure with concept, subtopics, and associated colors
    print(indent = 0) {
      const colorText = this.color ? ` (Color: ${this.color})` : ""; // Show color if available
      console.log(" ".repeat(indent) + this.concept + colorText); // Print concept and color
      this.subtopics.forEach((subtopic) => subtopic.print(indent + 2)); // Recursively print subtopics
    }
  }

  // we want to look at node color
  function searchTreeForColor(node, targetName) {
    // Check if the current node matches the target name
    if (node.concept === targetName && node.subtopics.length === 0) {
      return node.color;
    }

    // If the current node has children, search recursively in each child
    if (node.subtopics && node.subtopics.length > 0) {
      for (let topic of node.subtopics) {
        let result = searchTreeForColor(topic, targetName);
        if (result) return result; // If found in a child, return the result
      }
    }

    // If the node isn't found in this branch, return null
    return null;
  }

  // we want to look at parent node
  function searchTreeForClumpParent(node, targetName, parent = null) {
    // Check if the current node matches the target name
    if (node.concept === targetName && node.subtopics.length === 0) {
      return parent.concept;
    }

    // If the current node has children, search recursively in each child
    if (node.subtopics && node.subtopics.length > 0) {
      for (let topic of node.subtopics) {
        let result = searchTreeForClumpParent(topic, targetName, node);
        if (result) return result; // If found in a child, return the result
      }
    }

    // If the node isn't found in this branch, return null
    return null;
  }

  const semanticRoot = new TreeNode("SemanticRoot");

  const anatomyRoot = new TreeNode("Anatomy");
  const deviceRoot = new TreeNode("Device");
  const findingRoot = new TreeNode("Finding");
  const disorderRoot = new TreeNode("Disorder");
  const severityRoot = new TreeNode("Severity");
  const attrRoot = new TreeNode("Attribute");
  const interventionRoot = new TreeNode("Intervention");
  const unkownRoot = new TreeNode("Unknown");

  // Anatomy
  anatomyRoot.addSubtopic(new TreeNode("Body Part", "#99E6E6"));
  anatomyRoot.addSubtopic(new TreeNode("Lymph Node", "#bfefff"));
  anatomyRoot.addSubtopic(new TreeNode("Tissue", "#b2dfee"));
  anatomyRoot.addSubtopic(new TreeNode("Body Fluid or Substance", "#add8e6"));
  anatomyRoot.addSubtopic(new TreeNode("Side", "#93ccea"));
  anatomyRoot.addSubtopic(new TreeNode("Spatial Qualifier", "#9ac0cd"));

  // Device
  deviceRoot.addSubtopic(new TreeNode("Imaging Device", "#785ef0"));

  // Finding
  findingRoot.addSubtopic(new TreeNode("Finding", "#ffbcdd"));
  findingRoot.addSubtopic(new TreeNode("Clinical Test Result", "#ffadc1"));
  findingRoot.addSubtopic(new TreeNode("Gene Product", "#ff9ea4"));
  findingRoot.addSubtopic(new TreeNode("Gene", "#ff9ea4"));
  findingRoot.addSubtopic(new TreeNode("Position", "#CC9999"));

  // Disorder
  disorderRoot.addSubtopic(new TreeNode("Quantitative Concept", "#33991A"));
  disorderRoot.addSubtopic(new TreeNode("Disease or Disorder", "#7fce94"));
  disorderRoot.addSubtopic(new TreeNode("Neoplasm", "#96e7ac"));
  disorderRoot.addSubtopic(new TreeNode("Mass", "#a8ffc0"));

  // Severity
  severityRoot.addSubtopic(new TreeNode("Disease Stage Qualifier", "#ef7c0c"));
  severityRoot.addSubtopic(new TreeNode("Disease Grade Qualifier", "#ffa247"));
  severityRoot.addSubtopic(new TreeNode("Generic TNM Finding", "#ff9731"));
  severityRoot.addSubtopic(new TreeNode("Pathologic TNM Finding", "#ff8e20"));
  severityRoot.addSubtopic(new TreeNode("Behavior", "#ff8712"));
  severityRoot.addSubtopic(new TreeNode("Severity", "#ff7e00"));

  // Attribute
  attrRoot.addSubtopic(new TreeNode("Clinical Course of Disease", "#e5d815"));
  attrRoot.addSubtopic(new TreeNode("Pathologic Process", "#ffef00"));
  attrRoot.addSubtopic(new TreeNode("Disease Qualifier", "#ffdb00"));
  attrRoot.addSubtopic(new TreeNode("Property or Attribute", "#ffc700"));
  attrRoot.addSubtopic(new TreeNode("General Qualifier", "#ffbf00"));
  attrRoot.addSubtopic(new TreeNode("Temporal Qualifier", "#ffab00"));

  // Intervention
  interventionRoot.addSubtopic(new TreeNode("Pharmacologic Substance", "#b36cef"));
  interventionRoot.addSubtopic(new TreeNode("Chemo/immuno/hormone Therapy Regimen", "#da9cf5"));
  interventionRoot.addSubtopic(new TreeNode("Intervention or Procedure", "#ca99f4"));

  // Other
  unkownRoot.addSubtopic(new TreeNode("Unknown", "#808080"));

  semanticRoot.addSubtopic(anatomyRoot);
  semanticRoot.addSubtopic(deviceRoot);
  semanticRoot.addSubtopic(findingRoot);
  semanticRoot.addSubtopic(disorderRoot);
  semanticRoot.addSubtopic(severityRoot);
  semanticRoot.addSubtopic(attrRoot);
  semanticRoot.addSubtopic(interventionRoot);
  semanticRoot.addSubtopic(unkownRoot);

  const getSemanticGroups = () => {
    let groups = {};
    const uniqueConcepts = Array.from(new Set(concepts.map((c) => c.dpheGroup)));
    const mappedGroups = uniqueConcepts.map((group) => {
      const conceptClump = searchTreeForClumpParent(semanticRoot, group);
      if (conceptClump === null) {
        console.warn(`❗️conceptClump is null for group: ${group}`);
      }
      return { group, conceptClump };
    });

    // Split known and unknown groups
    const knownGroups = mappedGroups.filter(({ conceptClump }) => conceptClump !== null);
    const unknownGroups = mappedGroups.filter(({ conceptClump }) => conceptClump === null);

    // Sort known groups by conceptClump
    knownGroups.sort((a, b) => a.conceptClump.localeCompare(b.conceptClump));

    // Optional: give unknown groups a default conceptClump for sorting or grouping
    const defaultUnknownClump = "Unknown";

    // Combine known and unknown (unknown appended at the end)
    const allGroups = [
      ...knownGroups,
      ...unknownGroups.map((g) => ({
        group: g.group,
        conceptClump: defaultUnknownClump,
      })),
    ];

    // Build groups object
    allGroups.forEach(({ group, conceptClump }) => {
      groups[group] = {
        checked: true,
        conceptClump: conceptClump,
        backgroundColor:
          conceptClump === defaultUnknownClump
            ? "#e0e0e0" // grey for unknown
            : searchTreeForColor(semanticRoot, group),
        id: concepts.find((c) => c.dpheGroup === group)?.id || group,
      };
    });
    setSemanticGroups(groups);
  };

  const handleSemanticGroupChange = (group, checked) => {
    let groups = { ...semanticGroups };
    groups[group].checked = checked;
    setSemanticGroups(groups);
  };

  const handleDropdownClick = () => {
    setCheckboxGridVisible((prevState) => {
      return !prevState;
    });
  };
  const getCheckboxGridVisible = () => {
    return checkboxGridVisible;
  };

  const handleTermClick = (e) => {
    const clickedElement = e.currentTarget;
    const clickedId = clickedElement.dataset.id;
    if (clickedTerms.includes(clickedId)) {
      setClickedTerms((prev) => prev.filter((id) => id !== clickedId)); // Remove from state
    } else {
      setClickedTerms((prev) => [...prev, clickedId]); // Add to state
    }
  };

  const handleMentionClick = (conceptId) => {
    console.log("Mention clicked, conceptId:", conceptId);

    // Toggle the clicked term (same logic as handleTermClick)
    if (clickedTerms.includes(conceptId)) {
      setClickedTerms(clickedTerms.filter((id) => id !== conceptId));
    } else {
      setClickedTerms([...clickedTerms, conceptId]);
    }
  };

  const getReport = () => {
    const factIdTemp = "";
    // If there are fact based reports, highlight the displaying one
    const currentReportCssClass = "current_displaying_report";
    const currentFactTermsCssClass = "fact_based_term";
    $(".fact_based_report_id").removeClass(currentReportCssClass);
    $(".fact_based_term_span").removeClass(currentFactTermsCssClass);

    // Highlight the curent displaying report name
    $("#" + reportId + "_" + factIdTemp).addClass(currentReportCssClass);
    // Also highlight all the fact-based text mentions in the fact info area
    $("#terms_list_" + reportId + "_" + factIdTemp)
      .children()
      .find(">:first-child")
      .addClass(currentFactTermsCssClass);
  };

  if (isEmpty(semanticGroups)) {
    return "Loading...";
  } else {
    getReport();
    return (
      <Card id={"docs"} style={{ height: "100vh", overflow: "hidden" }}>
        <CardHeader className={"basicCardHeader"}>
          Documents Related to Selected Cancer/Tumor Detail
        </CardHeader>
        <GridItem xs={3} id="report_id">
          <div>
            <i className="fa fa-file-o"></i>
            <span className="display_report_id currentReportCssClass current_displaying_report">
              {reportId}
            </span>
          </div>
        </GridItem>
        <CardBody
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            margin: 0,
          }}
        >
          <div id="report_instance" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <SplitPane
              split="vertical"
              minSize={500}
              maxSize={-650}
              defaultSize="40%"
              style={{ flexGrow: 1, display: "flex", height: "100%", margin: 0, padding: 0 }}
            >
              {/* Left Panel - Mentions Container */}
              <GridItem
                md={4}
                id="mentions_container"
                className="mentions_container"
                style={{
                  height: "100%",
                  overflow: "auto",
                  backgroundColor: "#f0f0f0",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "none",
                  direction: "rtl",
                }}
              >
                <GridContainer
                  id="term_container2"
                  style={{
                    height: "100%",
                    margin: 0,
                    padding: 0,
                    flexGrow: 1,
                    direction: "ltr",
                  }}
                >
                  <GridItem
                    md={12}
                    id="mentions_container2"
                    className="mentions_container2"
                    style={{ margin: 0, padding: 0 }}
                  >
                    <ConceptPanel
                      mentions={patientDocument.getMentionIdsInDocument()}
                      concepts={concepts}
                      getCheckboxGridVisible={getCheckboxGridVisible}
                      setCheckboxGridVisible={setCheckboxGridVisible}
                      handleDropdownClick={handleDropdownClick}
                      semanticGroups={semanticGroups}
                      handleSemanticGroupChange={handleSemanticGroupChange}
                      setFilteredConcepts={setFilteredConcepts}
                      filteredConcepts={filteredConcepts}
                      handleTermClick={handleTermClick}
                      clickedTerms={clickedTerms}
                      handleConfidenceChange={handleConfidenceChange}
                      confidence={confidence}
                      doc={patientDocument}
                      filterLabel={filterLabel}
                      setFilterLabel={setFilterLabel}
                    />
                  </GridItem>
                </GridContainer>
              </GridItem>
              {/* Right Panel - Document View */}
              <GridItem
                md={8}
                id="report_text"
                style={{
                  height: "100%",
                  overflow: "auto",
                  backgroundColor: "#ffffff",
                  margin: 0,
                  padding: 0,
                  maxWidth: "none",
                  lineHeight: "1.7",
                }}
              >
                <DocumentPanel
                  doc={patientDocument}
                  concepts={concepts}
                  mentions={mentions}
                  reportId={reportId}
                  semanticGroups={semanticGroups}
                  handleSemanticGroupChange={handleSemanticGroupChange}
                  setFilteredConcepts={setFilteredConcepts}
                  filteredConcepts={filteredConcepts}
                  fontSize={fontSize}
                  clickedTerms={clickedTerms}
                  confidence={confidence}
                  filterLabel={filterLabel}
                  setFilterLabel={setFilterLabel}
                  onMentionClick={handleMentionClick}
                />
              </GridItem>
            </SplitPane>
          </div>
        </CardBody>
      </Card>
    );
  }
}
