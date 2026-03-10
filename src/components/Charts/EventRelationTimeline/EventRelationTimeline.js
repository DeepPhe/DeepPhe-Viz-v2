import React, { useEffect, useRef, useState } from "react";
import { MARKER_TOGGLE_MAP } from "./timelineConstants";
import { fetchTXTData } from "./data";
import { renderTimeline } from "./render/renderTimeline";

export default function EventRelationTimeline(props) {
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

  const clickedTermsRef = useRef(clickedTerms);
  const fullDataRef = useRef(null);

  useEffect(() => {
    clickedTermsRef.current = clickedTerms;
  }, [clickedTerms]);

  // In React component
  const handleToggleClick = () => {
    setToggleState((prev) => !prev);
  };

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
      negated: data.map((d) => d.negated),
    };
  };

  function getDpheGroupByConceptId(conceptId) {
    const concept = concepts.find((concept) => concept.id === conceptId);
    return concept ? concept.dpheGroup : null;
  }

  function getNegatedByConceptId(conceptId) {
    const concept = concepts.find((concept) => concept.id === conceptId);
    return concept ? concept.negated : null;
  }

  const skipNextEffect = useRef(false);

  function getFilteredData() {
    const data = fullDataRef.current;
    if (!data || !conceptsPerDocument) return data;

    const docKey = Object.keys(conceptsPerDocument).find((key) =>
      key.endsWith(`_${currDocRef.current}`)
    );
    const conceptsForDoc = conceptsPerDocument[docKey] || [];
    const conceptIdsFromDoc = conceptsForDoc.map((c) => c.id);

    const indices = data.conceptIds
      .map((id, i) => (conceptIdsFromDoc.includes(id) ? i : null))
      .filter((i) => i !== null);

    return {
      ...data,
      conceptIds: indices.map((i) => data.conceptIds[i]),
      startRelation: indices.map((i) => data.startRelation[i]),
      startDate: indices.map((i) => data.startDate[i]),
      endRelation: indices.map((i) => data.endRelation[i]),
      endDate: indices.map((i) => data.endDate[i]),
      dpheGroup: indices.map((i) => data.dpheGroup[i]),
      laneGroup: indices.map((i) => data.laneGroup[i]),
      negated: indices.map((i) => data.negated[i]),
    };
  }

  function callRenderTimeline(data) {
    const container = document.getElementById(svgContainerId);
    if (container) container.innerHTML = "";

    renderTimeline({
      svgContainerId,
      patientId: data.patientId,
      conceptIds: data.conceptIds,
      startRelation: data.startRelation,
      startDate: data.startDate,
      endRelation: data.endRelation,
      endDate: data.endDate,
      dpheGroup: data.dpheGroup,
      laneGroup: data.laneGroup,
      dpheGroupCounts: data.dpheGroupCounts,
      laneGroupsCounts: data.laneGroupsCounts,
      negated: data.negated,
      concepts,
      toggleState,
      handleToggleClick,
      clickedTermsRef,
      setClickedTerms,
      skipNextEffect,
      conceptsPerDocument,
      reportId,
    });
  }

  // useEffect(() => {
  //   if (!conceptsPerDocument) return;
  //
  //   fetchTXTData(getDpheGroupByConceptId, getNegatedByConceptId).then((data) => {
  //     if (!data) return;
  //
  //     const transformedData = transformTXTData(data);
  //     const container = document.getElementById(svgContainerId);
  //     if (container) container.innerHTML = "";
  //
  //     const filteredDpheGroup = transformedData.dpheGroup.filter(Boolean);
  //     const filteredLaneGroup = transformedData.laneGroup.filter(Boolean);
  //
  //     if (filteredDpheGroup.length === 0 || filteredLaneGroup.length === 0) return;
  //
  //     fullDataRef.current = transformedData; // ← store it
  //     callRenderTimeline(transformedData);
  //   });
  // }, [conceptsPerDocument]);

  //     renderTimeline({
  //       svgContainerId,
  //       patientId: transformedData.patientId,
  //       conceptIds: transformedData.conceptIds,
  //       startRelation: transformedData.startRelation,
  //       startDate: transformedData.startDate,
  //       endRelation: transformedData.endRelation,
  //       endDate: transformedData.endDate,
  //       dpheGroup: transformedData.dpheGroup,
  //       laneGroup: transformedData.laneGroup,
  //       dpheGroupCounts: transformedData.dpheGroupCounts,
  //       laneGroupsCounts: transformedData.laneGroupsCounts,
  //       negated: transformedData.negated,
  //       concepts,
  //       toggleState,
  //       handleToggleClick: handleToggleClick,
  //       clickedTermsRef,
  //       setClickedTerms,
  //       skipNextEffect: skipNextEffect,
  //       conceptsPerDocument,
  //       reportId,
  //     });
  //   });
  // }, [conceptsPerDocument]);

  useEffect(() => {
    if (!conceptsPerDocument) return;

    fetchTXTData(getDpheGroupByConceptId, getNegatedByConceptId).then((data) => {
      if (!data) return;

      const transformedData = transformTXTData(data);

      const filteredDpheGroup = transformedData.dpheGroup.filter(Boolean);
      const filteredLaneGroup = transformedData.laneGroup.filter(Boolean);
      if (filteredDpheGroup.length === 0 || filteredLaneGroup.length === 0) return;

      fullDataRef.current = transformedData; // ← store it
      callRenderTimeline(transformedData);
    });
  }, [conceptsPerDocument]); // Add conceptsPerDocument as dependency

  useEffect(() => {
    if (!fullDataRef.current || !conceptsPerDocument) return;

    const data = toggleState ? getFilteredData() : fullDataRef.current;
    callRenderTimeline(data);
  }, [toggleState, reportId]);

  useEffect(() => {
    if (skipNextEffect.current) {
      skipNextEffect.current = false; // reset for next time
      return;
    }
    document.querySelectorAll(".relation-icon").forEach((el) => {
      if (!el.classList.contains("selected")) {
        el.classList.add("unselected");
      }
    });
    document.querySelectorAll(`.relation-icon`).forEach((el) => {
      const conceptIds = el.dataset.conceptIds
        ? el.dataset.conceptIds.split(",").map((s) => s.trim())
        : [];
      // console.log(clickedTerms);
      // console.log(conceptIds);
      if (clickedTerms.includes(conceptIds)) {
        console.log("match");
      }
      if (clickedTerms.includes(conceptIds)) {
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

  // function applyDocumentFilter() {
  //   if (!conceptsPerDocument) return; // Add this
  //   const docKey = Object.keys(conceptsPerDocument).find((key) =>
  //     key.endsWith(`_${currDocRef.current}`)
  //   );
  //   const conceptsForDoc = conceptsPerDocument[docKey] || [];
  //   const conceptIdsFromDoc = conceptsForDoc.map((concept) => concept.id);
  //   // Call your update logic
  //   if (toggleState) {
  //     filterRelationsByConceptIds(conceptIdsFromDoc);
  //   } else {
  //     // Show all relations
  //     document.querySelectorAll(".relation-icon").forEach((el) => {
  //       el.style.display = null;
  //       const group = el.closest("g");
  //       if (group) {
  //         group.querySelectorAll(".relation-outline").forEach((outline) => {
  //           outline.style.display = null;
  //         });
  //       }
  //     });
  //   }
  // }
  //
  // function filterRelationsByConceptIds(conceptIdsFromDoc) {
  //   if (!conceptIdsFromDoc || !conceptIdsFromDoc.length) return;
  //
  //   document.querySelectorAll(".relation-icon").forEach((el) => {
  //     const elConceptIds = el.dataset.conceptIds
  //       ? el.dataset.conceptIds
  //           .split(",")
  //           .map((s) => s.trim())
  //           .filter(Boolean)
  //       : [];
  //
  //     // Show the relation if any of its concept IDs match the selected doc's concepts
  //     const matches = elConceptIds.some((id) => conceptIdsFromDoc.includes(id));
  //
  //     el.style.display = matches ? null : "none";
  //
  //     // Also hide/show outlines
  //     const group = el.closest("g");
  //     if (group) {
  //       group.querySelectorAll(".relation-outline").forEach((outline) => {
  //         outline.style.display = matches ? null : "none";
  //       });
  //     }
  //   });
  // }

  return <div className="Timeline" id={svgContainerId}></div>;
}
