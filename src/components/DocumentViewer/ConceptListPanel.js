import GridItem from "../Grid/GridItem";
import React, { useEffect } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { hexToRgba } from "./ColorUtils";

export function ConceptListPanel(props) {
  const { concepts, mentions } = props;
  const semanticGroups = props.semanticGroups;
  const confidence = props.confidence;
  const filteredConcepts = props.filteredConcepts;
  const setFilteredConcepts = props.setFilteredConcepts;
  // const doc = props.doc;
  // const selectedOptions = props.selectedOptions;
  const clickedTerms = props.clickedTerms;

  // Gets mention count for concept for single document of patient
  const getDocMentionsCountForConcept = (conceptId) => {
    const idx = concepts.findIndex((c) => c.id === conceptId);
    if (idx === -1) {
      return 0;
    }
    return concepts[idx].mentionIds.filter((mentionId) => {
      return mentions.some((m) => m.id === mentionId);
    }).length;
  };

  // Gets mention count for concept for whole patient history
  const getPatientMentionsCountForConcept = (conceptId) => {
    const idx = concepts.findIndex((c) => c.id === conceptId);
    if (idx === -1) {
      return 0;
    }
    return concepts[idx].mentionIds.length;
  };

  useEffect(() => {
    // Wait until semanticGroups is populated
    if (!semanticGroups || Object.keys(semanticGroups).length === 0) return;

    const sortedConcepts = filterConceptsByConfidenceAndSemanticGroup(concepts);
    console.log("SORTED CONCEPTS", sortedConcepts);

    if (sortedConcepts.length === 0) {
      setFilteredConcepts([-1]);
    } else {
      setFilteredConcepts(sortedConcepts);
    }
  }, [concepts, confidence, semanticGroups]);

  //accessing the .checked property to see if [concept.dpheGroup] is checked
  function conceptGroupIsSelected(concept) {
    if (semanticGroups[concept.dpheGroup]) {
      return semanticGroups[concept.dpheGroup].checked;
    }
    return false;
  }

  // FilterConceptsByConfidenceAndSemanticGroup keeps an array of concepts that are updated dynamically
  // based on confidence and Semantic group selection
  function filterConceptsByConfidenceAndSemanticGroup(concepts) {
    let filteredConcepts = [];
    console.log("concepts in conceptListPanel", concepts);
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      // console.log(concept);
      // console.log(concept.dpheGroup);
      if (
        parseFloat(concept.confidence) >= parseFloat(confidence) &&
        (conceptGroupIsSelected(concept) || concept.dpheGroup === "Unknown")
      ) {
        if (semanticGroups.hasOwnProperty(concept.dpheGroup)) {
          concept.conceptClump = semanticGroups[concept.dpheGroup].conceptClump;
        } else {
          // console.log(concept);
          // fallback if dpheGroup not in semanticGroups for some reason
          concept.conceptClump = "Unknown";
        }
        filteredConcepts.push(concept);
      }
    }
    return sortConceptsByConceptClump(filteredConcepts);
  }

  function sortConceptsByConceptClump(filteredConcepts) {
    filteredConcepts.sort((a, b) => {
      return a.conceptClump.toLowerCase().localeCompare(b.conceptClump.toLowerCase());
    });
    return filteredConcepts;
  }

  function separateWords(str) {
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Handle consecutive capitals like "URL"
      .trim(); // Remove any leading/trailing spaces
  }

  function isNegated(negatedArray) {
    return negatedArray.includes(true);
  }

  function getConceptsList() {
    let sortedConcepts = filteredConcepts;
    if (sortedConcepts.length === 0) {
      sortedConcepts = [-1];
    }
    setFilteredConcepts(sortedConcepts);

    if (sortedConcepts[0] === -1) {
      sortedConcepts = [];
    }
    return (
      <List id="filtered_concepts" class="filtered_concepts_list">
        {filterConceptsByConfidenceAndSemanticGroup(concepts).map((obj) => {
          return (
            <ListItem
              style={{
                fontSize: "14px",
                fontFamily: "Monaco, monospace",
                backgroundColor: hexToRgba(
                  semanticGroups[obj.dpheGroup]?.backgroundColor || "#9e9e9e", // fallback to grey
                  0.65
                ),
                margin: "4px",
                borderStyle: "solid",
                borderColor: clickedTerms.includes(obj.id) ? "black" : "transparent", // Use .includes here
                fontWeight: "bold",
              }}
              key={obj.id}
              class="report_mentioned_term"
              data-id={obj.id}
              data-negated={obj.negated}
              data-confidence={obj.confidence}
              data-uncertain={obj.uncertain}
              data-text={obj.classUri}
              data-dphe-group={obj.dpheGroup}
              onClick={props.handleTermClick}
            >
              {/* Conditionally render the icon if negated is true */}
              {obj.negated && (
                <span className="icon" style={{ marginRight: "5px", color: "red" }}>
                  &#8856;
                </span>
              )}
              {obj.preferredText ? obj.preferredText : separateWords(obj.classUri)}
              {clickedTerms.includes(obj.id) && ":"}

              <br />
              {/* Conditionally render extra information if the term is clicked */}
              {clickedTerms.includes(obj.id) && (
                <span style={{ display: "block", marginLeft: "40px" }}>
                  {`Document Mention Count: ${getDocMentionsCountForConcept(obj.id)}`}
                  <br />
                  {`Patient Mention Count: ${getPatientMentionsCountForConcept(obj.id)}`}
                  <br />
                  {`Concept Confidence: ${Math.round(obj.confidence)}%`}
                  <br />
                  {`DeepPhe Semantic Group: ${obj.dpheGroup}`}
                </span>
              )}
            </ListItem>
          );
        })}
      </List>
    );
  }

  return (
    <GridItem style={{ border: "none", boxShadow: "none" }} md={12} id="mentions_container">
      <div id="report_mentioned_terms">{getConceptsList()}</div>
    </GridItem>
  );
}
