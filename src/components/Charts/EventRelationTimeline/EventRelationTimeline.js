import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3v4";
import {
  TRANSITION_DURATION,
  MARGINS,
  LEGEND,
  TEXT,
  AGE_AREA,
  GAPS,
  TIMELINE_PADDING_DAYS,
  MARKER_TOGGLE_MAP,
} from "./timelineConstants";
import { fetchTXTData } from "./data";
import { renderTimeline } from "./render/renderTimeline";

export default function EventRelationTimeline(props) {
  // const [json, setJson] = useState(undefined);
  const [patientId, setPatientId] = useState(props.patientId);
  const [toggleState, setToggleState] = useState(false);
  const setReportId = props.setReportId;
  const patientJson = props.patientJson;
  const reportId = props.reportId;
  const concepts = props.concepts;
  const svgContainerId = props.svgContainerId;
  const clickedTerms = props.clickedTerms;
  const setClickedTerms = props.setClickedTerms;
  const conceptsPerDocument = props.conceptsPerDocument;
  // const currDocId = props.currDocId;
  const [isFilterOn, setIsFilterOn] = useState(false);

  useEffect(() => {
    if (clickedTerms.length === 0) {
      document.querySelectorAll("circle").forEach((circle) => {
        circle.style.fillOpacity = "0.3"; // Reset fill opacity to default
        circle.style.strokeWidth = "1px"; // Reset stroke width to none
      });
    }
  }, [clickedTerms]);

  const transformTXTData = (data) => {
    return {
      //PatientID is same for every instance
      patientId: data[0].PatientID,
      conceptIds: data.map((d) => d.ConceptID),
      startRelation: data.map((d) => d.Relation1),
      startDate: data.map((d) => d.Date1),
      endRelation: data.map((d) => d.Relation2),
      endDate: data.map((d) => d.Date2),
      dpheGroup: data.map((d) => d.dpheGroup),
      laneGroup: data.map((d) => d.laneGroup),
      dpheGroupCounts: data.dpheGroupCounts,
      laneGroupsCounts: data.laneGroupsCounts,
    };
  };

  function getDpheGroupByConceptId(conceptId) {
    const concept = concepts.find((concept) => concept.id === conceptId);
    return concept ? concept.dpheGroup : null;
  }

  const skipNextEffect = useRef(false);

  useEffect(() => {
    if (!conceptsPerDocument) return;

    fetchTXTData(getDpheGroupByConceptId).then((data) => {
      if (!data) return;
      // setJson(data);
      const transformedData = transformTXTData(data);
      const container = document.getElementById(svgContainerId);
      if (container) {
        container.innerHTML = "";
      }
      const filteredDpheGroup = transformedData.dpheGroup.filter((item) => item != null);
      const filteredLaneGroup = transformedData.laneGroup.filter((item) => item != null);

      if (filteredDpheGroup.length !== 0 && filteredLaneGroup.length !== 0) {
        renderTimeline(
          svgContainerId,
          transformedData.patientId,
          transformedData.conceptIds,
          transformedData.startRelation,
          transformedData.startDate,
          transformedData.endRelation,
          transformedData.endDate,
          transformedData.dpheGroup,
          transformedData.laneGroup,
          transformedData.dpheGroupCounts,
          transformedData.laneGroupsCounts,
          concepts
        );
      }
    });
  }, [conceptsPerDocument]);

  useEffect(() => {
    if (skipNextEffect.current) {
      skipNextEffect.current = false; // reset for next time
      return;
    }
    // if (!clickedTerms || clickedTerms.length === 0) return;

    document.querySelectorAll(".relation-icon").forEach((el) => {
      if (!el.classList.contains("selected")) {
        el.classList.add("unselected");
      }
    });

    document.querySelectorAll(`.relation-icon`).forEach((el) => {
      const conceptIds = el.dataset.conceptIds
        ? el.dataset.conceptIds.split(",").map((s) => s.trim())
        : [];
      console.log(clickedTerms);
      console.log(conceptIds);
      if (clickedTerms.includes(conceptIds)) {
        console.log("match");
      }

      if (clickedTerms.includes(conceptId)) {
        if (el.hasAttribute("marker-end")) {
          const currentMarker = el.getAttribute("marker-end");
          if (MARKER_TOGGLE_MAP[currentMarker]) {
            el.setAttribute("marker-end", MARKER_TOGGLE_MAP[currentMarker]);
          }
        }

        if (el.hasAttribute("marker-start")) {
          const currentMarker = el.getAttribute("marker-start");
          if (MARKER_TOGGLE_MAP[currentMarker]) {
            el.setAttribute("marker-start", MARKER_TOGGLE_MAP[currentMarker]);
          }
        }

        if (el.classList.contains("selected")) {
          el.classList.remove("selected");
          el.classList.add("unselected");
        } else {
          el.classList.remove("unselected");
          el.classList.add("selected");
        }
      } else {
      }

      // Show/hide the black outline line
      const group = el.closest("g");
      const isNowSelected = el.classList.contains("selected");
      if (group) {
        const outlines = group.querySelectorAll(".relation-outline");
        if (outlines.length) {
          outlines.forEach((outline) => {
            // Do something with the outlines, like showing or hiding
            outline.setAttribute("stroke-opacity", isNowSelected ? "1" : "0");
          });
        }
      }
    });
  }, [clickedTerms]);

  const currDocRef = useRef(props.currDocId);
  useEffect(() => {
    currDocRef.current = props.currDocId;
  }, [props.currDocId]);

  useEffect(() => {
    console.log("togglestate", toggleState);
    if (!toggleState) return;
    applyDocumentFilter();
  }, [currDocRef.current, toggleState]);

  function applyDocumentFilter() {
    const docKey = Object.keys(conceptsPerDocument).find((key) =>
      key.endsWith(`_${currDocRef.current}`)
    );
    const conceptsForDoc = conceptsPerDocument[docKey] || [];
    const conceptIdsFromDoc = conceptsForDoc.map((concept) => concept.id);
    // Call your update logic
    if (toggleState) {
      filterRelationsByConceptIds(conceptIdsFromDoc);
    } else {
      // Show all relations
      document.querySelectorAll(".relation-icon").forEach((el) => {
        el.style.display = null;
        const group = el.closest("g");
        if (group) {
          group.querySelectorAll(".relation-outline").forEach((outline) => {
            outline.style.display = null;
          });
        }
      });
    }
  }

  function filterRelationsByConceptIds(conceptIdsFromDoc) {
    if (!conceptIdsFromDoc || !conceptIdsFromDoc.length) return;

    document.querySelectorAll(".relation-icon").forEach((el) => {
      const elConceptIds = el.dataset.conceptIds
        ? el.dataset.conceptIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // Show the relation if any of its concept IDs match the selected doc's concepts
      const matches = elConceptIds.some((id) => conceptIdsFromDoc.includes(id));

      el.style.display = matches ? null : "none";

      // Also hide/show outlines
      const group = el.closest("g");
      if (group) {
        group.querySelectorAll(".relation-outline").forEach((outline) => {
          outline.style.display = matches ? null : "none";
        });
      }
    });
  }

  return <div className="Timeline" id={svgContainerId}></div>;
}
