import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3v4";

const baseUri = "http://localhost:3001/api";
const transitionDuration = 800; // time in ms

const laneGroups = {
  // Severity
  behavior: "Severity",
  "disease stage qualifier": "Severity",
  "disease grade qualifier": "Severity",
  "temporal qualifier": "Severity",
  severity: "Severity",
  "pathologic tnm finding": "Severity",
  "generic tnm finding": "Severity",

  // Qualifier
  // 'disease qualifier': 'Qualifier',
  // 'property or attribute': 'Qualifier',
  // 'general qualifier': 'Qualifier',
  // 'clinical course of disease': 'Qualifier',
  // 'pathologic process': 'Qualifier',
  // 'quantitative concept': 'Qualifier',
  // 'position': 'Qualifier',

  // Site
  // 'lymph node': 'Site',
  // 'body part': 'Site',
  // 'body fluid or substance': 'Site',
  // 'side': 'Site',
  // 'spatial qualifier': 'Site',
  // 'tissue': 'Site',

  // Finding
  finding: "Finding",
  "clinical test result": "Finding",
  gene: "Finding",
  "gene product": "Finding",

  // Disease
  "disease or disorder": "Disease",
  neoplasm: "Disease",
  mass: "Disease",

  // Treatment
  "pharmacologic substance": "Treatment",
  "chemo/immuno/hormone therapy regimen": "Treatment",
  "intervention or procedure": "Treatment",
  "imaging device": "Treatment",

  // Other
  unknown: "Other",
};

let mentionedTerms = "";
let reportTextRight = "";
export { mentionedTerms };
export { reportTextRight };

export default function EventRelationTimeline(props) {
  const [json, setJson] = useState(undefined);
  const [patientId, setPatientId] = useState(props.patientId);
  const setReportId = props.setReportId;
  const patientJson = props.patientJson;
  const reportId = props.reportId;
  const concepts = props.concepts;
  const svgContainerId = props.svgContainerId;
  const clickedTerms = props.clickedTerms;
  const setClickedTerms = props.setClickedTerms;
  const conceptsPerDocument = props.conceptsPerDocument;

  useEffect(() => {
    if (clickedTerms.length === 0) {
      document.querySelectorAll("circle").forEach((circle) => {
        circle.style.fillOpacity = "0.3"; // Reset fill opacity to default
        circle.style.strokeWidth = "1px"; // Reset stroke width to none
      });
    }
  }, [clickedTerms]);

  const fetchTXTData = async () => {
    try {
      const response = await fetch("/docs/Patient01_times.txt");
      console.log("Fetch response status:", response.status);
      console.log("Fetch response headers:", response.headers);

      if (!response.ok) throw new Error("Failed to load file");

      const text = await response.text();
      console.log("Raw text from fetch:", text); // This will show you what's actually being fetched

      return parseTXT(text);
    } catch (error) {
      console.error("Error loading TSV:", error);
      return null;
    }
  };

  function getDpheGroupByConceptId(conceptId) {
    const concept = concepts.find((concept) => concept.id === conceptId);
    return concept ? concept.dpheGroup : null;
  }

  const parseTXT = (txt) => {
    const lines = txt.trim().split("\n");
    const headers = lines[0].split("\t").map((h) => h.trim());
    const dpheGroupCounts = {};
    const laneGroupCounts = {};
    // const tLinkCounts = {};

    const data = lines.slice(1).map((line) => {
      const values = line.split("\t");
      const obj = headers.reduce((acc, header, index) => {
        acc[header] = values[index]?.trim()?.replace(/^"|"$/g, "");
        return acc;
      }, {});

      // Get and assign dpheGroup
      const dpheGroup = getDpheGroupByConceptId(obj.ConceptID);
      obj.dpheGroup = dpheGroup;

      // Optionally count occurrences
      if (dpheGroup) {
        dpheGroupCounts[dpheGroup] = (dpheGroupCounts[dpheGroup] || 0) + 1;

        const laneGroup = laneGroups[dpheGroup.toLowerCase()] || "Uncategorized";
        obj.laneGroup = laneGroup;
        laneGroupCounts[laneGroup] = (laneGroupCounts[laneGroup] || 0) + 1;
      }

      return obj;
    });

    data.dpheGroupCounts = dpheGroupCounts;
    data.laneGroupsCounts = laneGroupCounts;
    return data;
  };

  const transformTXTData = (data) => {
    return {
      patientId: data.map((d) => d.PatientID),
      conceptId: data.map((d) => d.ConceptID),
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

  const skipNextEffect = useRef(false);

  useEffect(() => {
    if (!conceptsPerDocument) return;

    fetchTXTData(conceptsPerDocument).then((data) => {
      if (!data) return;
      // console.log("are we getting here");
      setJson(data);
      const transformedData = transformTXTData(data);
      // console.log("transformed data:", transformedData);
      const container = document.getElementById(svgContainerId);
      if (container) {
        container.innerHTML = "";
      }
      const filteredDpheGroup = transformedData.dpheGroup.filter((item) => item != null);
      const filteredLaneGroup = transformedData.laneGroup.filter((item) => item != null);
      // console.log("filteredDpheGroup", filteredDpheGroup);
      // console.log("filteredLaneGroup", filteredLaneGroup);
      if (filteredDpheGroup.length !== 0 && filteredLaneGroup.length !== 0) {
        renderTimeline(
          svgContainerId,
          transformedData.patientId,
          transformedData.conceptId,
          transformedData.startRelation,
          transformedData.startDate,
          transformedData.endRelation,
          transformedData.endDate,
          transformedData.dpheGroup,
          transformedData.laneGroup,
          transformedData.dpheGroupCounts,
          transformedData.laneGroupsCounts
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

    const markerToggleMap = {
      "url(#rightCap)": "url(#selectedRightCap)",
      "url(#selectedRightCap)": "url(#rightCap)",
      "url(#leftCap)": "url(#selectedLeftCap)",
      "url(#selectedLeftCap)": "url(#leftCap)",
      "url(#verticalLineCap)": "url(#selectedVerticalLineCap)",
      "url(#selectedVerticalLineCap)": "url(#verticalLineCap)",
      "url(#rightArrow)": "url(#selectedRightArrow)",
      "url(#selectedRightArrow)": "url(#rightArrow)",
      "url(#leftArrow)": "url(#selectedLeftArrow)",
      "url(#selectedLeftArrow)": "url(#leftArrow)",
    };

    document.querySelectorAll(`.relation-icon`).forEach((el) => {
      const conceptId = el.getAttribute("data-concept-id");
      console.log(conceptId);

      if (clickedTerms.includes(conceptId)) {
        if (el.hasAttribute("marker-end")) {
          const currentMarker = el.getAttribute("marker-end");
          if (markerToggleMap[currentMarker]) {
            el.setAttribute("marker-end", markerToggleMap[currentMarker]);
          }
        }

        if (el.hasAttribute("marker-start")) {
          const currentMarker = el.getAttribute("marker-start");
          if (markerToggleMap[currentMarker]) {
            el.setAttribute("marker-start", markerToggleMap[currentMarker]);
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

  const renderTimeline = (
    svgContainerId,
    patientId,
    conceptId,
    startRelation,
    startDate,
    endRelation,
    endDate,
    dpheGroup,
    laneGroup,
    dpheGroupCount,
    laneGroupCount
  ) => {
    // Vertical count position of each report type
    // E.g., "Progress Note" has max 6 vertical reports, "Surgical Pathology Report" has 3
    // then the vertical position of "Progress Note" bottom line is 6, and "Surgical Pathology Report" is 6+3=9
    let verticalPositions = {};
    // Vertical max counts from top to bottom
    // This is used to decide the domain range of mainY and overviewY
    // console.log(
    //   svgContainerId,
    //   patientId,
    //   startRelation,
    //   endDate,
    //   endDate,
    //   laneGroup,
    //   dpheGroupCount,
    //   laneGroupCount
    // );

    // function createEventData() {
    //   const eventData = [];
    //
    //   for (let i = 0; i < startDate.length; i++) {
    //     eventData.push({
    //       start: startDate[i],
    //       end: endDate[i],
    //       patient_id: patientId[i], // Use patientId as unique identifier
    //       laneGroup: laneGroup[i],
    //       relation1: startRelation[i],
    //       relation2: endRelation[i],
    //       dpheGroup: dpheGroup[i],
    //       conceptId: conceptId[i],
    //     });
    //   }
    //
    //   return eventData;
    // }

    function createEventData() {
      const eventMap = new Map(); // To track events by lane + start + end

      for (let i = 0; i < startDate.length; i++) {
        const key = `${laneGroup[i]}_${startDate[i]}_${endDate[i]}`;

        if (eventMap.has(key)) {
          // Merge with existing event
          console.log("Merging event:", key); // Check if merging is happening
          const existingEvent = eventMap.get(key);

          // Merge patient_ids
          if (!existingEvent.patient_id.includes(patientId[i])) {
            existingEvent.patient_id.push(patientId[i]);
          }

          // Merge other arrays
          if (!existingEvent.dpheGroup.includes(dpheGroup[i])) {
            existingEvent.dpheGroup.push(dpheGroup[i]);
          }
          if (!existingEvent.conceptId.includes(conceptId[i])) {
            existingEvent.conceptId.push(conceptId[i]);
          }
        } else {
          // Create new event entry
          eventMap.set(key, {
            start: startDate[i],
            end: endDate[i],
            patient_id: [patientId[i]], // Convert to array for merged events
            laneGroup: laneGroup[i],
            relation1: startRelation[i],
            relation2: endRelation[i],
            dpheGroup: [dpheGroup[i]],
            conceptId: [conceptId[i]],
          });
        }
      }

      const result = Array.from(eventMap.values());
      console.log("Total events after merging:", result.length);
      console.log("Sample event:", result[0]); // Check structure
      return result;
    }

    function removeDuplicatesFromDpheAndLane() {
      //REMOVING DUPLICATES from chemo_text and TLink
      const dpheGroupSet = new Set();
      const laneGroupSet = new Set();
      const relation1Set = new Set();
      const relation2Set = new Set();

      for (let i = 0; i < dpheGroup.length; i++) {
        dpheGroupSet.add(dpheGroup[i]);
      }

      for (let i = 0; i < laneGroup.length; i++) {
        if (laneGroup[i] !== undefined) {
          laneGroupSet.add(laneGroup[i]);
        }
      }

      for (let i = 0; i < startRelation.length; i++) {
        relation1Set.add(startRelation[i]);
      }
      for (let i = 0; i < endRelation.length; i++) {
        relation2Set.add(endRelation[i]);
      }
      dpheGroup = Array.from(dpheGroupSet);
      laneGroup = Array.from(laneGroupSet);
      startRelation = Array.from(relation1Set);
      endRelation = Array.from(relation2Set);
    }

    // Use the order in reportTypes to calculate totalMaxVerticalCounts of each report type
    // to have a consistent report type order

    function getTotalMaxVertCount(dictionary) {
      let count = 0;

      for (let key in dictionary) {
        count += dictionary[key];

        if (typeof verticalPositions[key] !== "undefined") {
          verticalPositions[key] = totalMaxVerticalCounts;
        }
      }

      return count;
    }

    let totalMaxVerticalCounts = getTotalMaxVertCount(laneGroupCount);

    const margin = { top: 5, right: 20, bottom: 5, left: 200 };
    const mainChemoTextRowHeightPerCount = 10;
    const overviewChemoTextRowHeightPerCount = 3;

    const legendHeight = 22;
    const legendSpacing = 2;
    const widthPerLetter = 12;
    const episodeLegendAnchorPositionX = 40;
    const episodeLegendAnchorPositionY = 6;

    const gapBetweenlegendAndMain = 5;

    const container = document.getElementById(svgContainerId);
    const containerWidth = container.offsetWidth;

    const svgWidth = containerWidth - margin.left - 25;

    const pad = 25;

    // Dynamic height based on vertical counts
    const overviewHeight = totalMaxVerticalCounts * overviewChemoTextRowHeightPerCount;

    const ageAreaHeight = 10;
    const ageAreaBottomPad = 10;

    const reportMainRadius = 5;
    const reportOverviewRadius = 1.5;

    // Set the timeline start date 10 days before the min date
    // and end date 10 days after the max date
    const marginOfDays = 50;

    // Gap between texts and mian area left border
    const textMargin = 10;

    // let eventData = null;

    // Need to create EventData before removing duplicates !IMPORTANT!
    // if (startDate && endDate && patientId && dpheGroup && laneGroup){
    const eventData = createEventData();
    // }

    // Convert string to date
    if (eventData !== null) {
      console.log("eventData length:", eventData.length);
      console.log("First few events:", eventData.slice(0, 3));

      const minStartDate = new Date(
        eventData.reduce(
          (min, d) => (new Date(d.start) < new Date(min) ? d.start : min),
          eventData[0].start
        )
      );
      const maxEndDate = new Date(
        eventData.reduce(
          (max, d) => (new Date(d.end) > new Date(max) ? d.end : max),
          eventData[0].end
        )
      );

      console.log("minStartDate:", minStartDate);
      console.log("maxEndDate:", maxEndDate);

      minStartDate.setDate(minStartDate.getDate() - marginOfDays);
      maxEndDate.setDate(maxEndDate.getDate() + marginOfDays);

      let mainX = d3.scaleTime().domain([minStartDate, maxEndDate]).range([0, svgWidth]);
      console.log("svgWidth:", svgWidth);

      const allDates = new Set();

      eventData.forEach(function (d, i) {
        const startDate = new Date(d.start);
        const endDate = new Date(d.end);

        allDates.add(startDate.getTime());
        allDates.add(endDate.getTime());

        d.formattedStartDate = mainX(startDate);
        d.formattedEndDate = mainX(endDate);

        if (i < 3) {
          console.log(`Event ${i} formatted:`, d.formattedStartDate, d.formattedEndDate);
        }
      });

      // Convert timestamps back to Date objects and sort
      const uniqueDates = Array.from(allDates)
        .map((timestamp) => new Date(timestamp))
        .sort((a, b) => a - b);

      removeDuplicatesFromDpheAndLane();
      const desiredOrder = ["Finding", "Disease", "Severity", "Treatment"];

      const groupLaneHeights = {}; // e.g., { 'AC': 2, 'Taxol': 3, ... }
      desiredOrder.forEach((group) => {
        const eventsInGroup = eventData.filter((d) => d.laneGroup === group);
        const slots = [];
        const isPoint = ([start, end]) => start === end;

        const pixelPadding = 8;
        const checkOverlapWithPadding = (a, b, padding) => {
          const aStart = a[0] - padding;
          const aEnd = a[1] + padding;
          const bStart = b[0] - padding;
          const bEnd = b[1] + padding;
          return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
        };

        eventsInGroup.forEach((d) => {
          const x1 = +d.formattedStartDate;
          const x2 = +d.formattedEndDate;
          let row = 0;

          while (true) {
            if (!slots[row]) slots[row] = [];

            const hasOverlap = slots[row].some((slot) =>
              checkOverlapWithPadding([x1, x2], slot, pixelPadding)
            );

            if (!hasOverlap) {
              slots[row].push([x1, x2]);
              break;
            }
            row += 1;
          }
        });

        // Now store the number of rows
        groupLaneHeights[group] = slots.length;
      });

      // console.log(groupLaneHeights);

      // Dynamic height based on vertical counts
      const totalGroupLaneHeights = Object.values(groupLaneHeights).reduce(
        (acc, val) => acc + val,
        0
      );
      const height = totalGroupLaneHeights * mainChemoTextRowHeightPerCount * 2;

      // Transition used by focus/defocus episode
      let transt = d3.transition().duration(transitionDuration).ease(d3.easeLinear);

      // Main area and overview area share the same width

      let overviewX = d3.scaleTime().domain([minStartDate, maxEndDate]).range([0, svgWidth]);

      // Y scale to handle main area
      let mainY = d3.scaleLinear().domain([0, totalGroupLaneHeights]).range([0, height]);

      // Y scale to handle overview area
      // console.log("blash", overviewHeight, height)
      let overviewY = d3
        .scaleLinear()
        .domain([0, totalGroupLaneHeights])
        .range([0, overviewHeight]);

      // Process episode dates
      let episodeSpansData = [];

      // Create the container if it doesn't exist
      if (!document.getElementById(svgContainerId)) {
        console.log(svgContainerId);
        const container = document.createElement("div");
        container.id = svgContainerId;
        document.body.appendChild(container); // Append to the desired parent (body, or other parent element)
      }

      // SVG
      let svgTotalHeight =
        margin.top +
        legendHeight +
        gapBetweenlegendAndMain +
        height +
        pad +
        overviewHeight / 18 +
        pad +
        ageAreaHeight +
        margin.bottom;

      // Append the legend SVG (on top)
      let legendSvg = d3
        .select("#" + svgContainerId)
        .append("svg")
        .attr("class", "legend_svg")
        .attr("width", containerWidth)
        .attr("height", legendHeight)
        .style("display", "block");

      let svg = d3
        .select("#" + svgContainerId)
        .append("svg")
        .attr("class", "timeline_svg")
        .attr("viewBox", `0 0 ${containerWidth} ${svgTotalHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Optional
        .style("width", "100%")
        .style("height", "auto");

      const arrowWidth = 20;
      const arrowLabelGap = 5;
      const labelPadding = 10;
      let labelWidths = [];
      const allRelations = [...new Set([...startRelation, ...endRelation])];

      // Temporarily render text to measure widths
      let temp = legendSvg.append("g").attr("class", "tempTextMeasure");
      allRelations.forEach((d, i) => {
        const textEl = temp.append("text").text(d);
        const width = textEl.node().getComputedTextLength();
        labelWidths.push(width);
      });
      temp.remove(); // cleanup

      // Now build an array of x positions
      let episodeLegendX = [];
      let currentX = episodeLegendAnchorPositionX + legendSpacing;
      labelWidths.forEach((labelWidth) => {
        episodeLegendX.push(currentX);
        currentX += arrowWidth + arrowLabelGap + labelWidth + labelPadding;
      });

      // Add label first in its own position
      legendSvg
        .append("text")
        .attr("x", 10) // or whatever left margin you want
        .attr("y", margin.top + episodeLegendAnchorPositionY)
        .attr("dy", ".5ex")
        .attr("class", "episode_legend_text")
        .attr("text-anchor", "start")
        .text("Event Occurrence:");

      legendSvg
        .append("line")
        .attr("x1", 10) // match the x of "Time Relation:"
        .attr("y1", margin.top + legendHeight)
        .attr("x2", margin.left + svgWidth)
        .attr("y2", margin.top + legendHeight)
        .attr("class", "legend_group_divider");

      // Now episodeLegendGrp only contains the icons and labels
      let episodeLegendGrp = legendSvg
        .append("g")
        .attr("class", "episode_legend_group")
        .attr("transform", `translate(90, ${margin.top})`); // shift it right to make room for "Time Relation:"

      // Container group for each legend item
      let episodeLegend = episodeLegendGrp
        .selectAll(".episode_legend")
        .data(allRelations)
        .enter()
        .append("g")
        .attr("class", "episode_legend")
        .attr("transform", (d, i) => `translate(${episodeLegendX[i]}, 0)`);

      // Arrow paths
      episodeLegend
        .append("path")
        .attr("class", "episode_legend_arrow")
        .attr("d", function (d) {
          if (d === "On") {
            return "M 6 0 L 6 12";
          } else if (d === "Before") {
            return "M 12 0 L 0 6 L 12 12";
          } else if (d === "Overlaps") {
            return "M 0 6 L 12 6";
          } else {
            return "M 0 0 L 12 6 L 0 12";
          }
        })
        .attr("transform", "translate(0, 0)") // put at baseline
        .style("fill", "rgb(49, 163, 84)")
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", (d) => (d === "Overlaps" ? 4 : 2));

      // Legend labels (shifted slightly to the right and vertically aligned)
      episodeLegend
        .append("text")
        .attr("x", 20) // give space between arrow and label
        .attr("y", 10) // visually center with the arrow
        .attr("alignment-baseline", "middle") // better vertical alignment
        .attr("class", "episode_legend_text")
        .text((d) => `${d}`)
        .each(function (d) {
          console.log(d);
          d3.select(this)
            .append("title")
            .text(() => {
              if (d === "Before") return "Event occurs *before* time/date";
              if (d === "On") return "Event occurs *within* time span";
              if (d === "Overlaps") return "Event *overlaps* time span";
              if (d === "After") return "Event occurs *after* time/date";
              return "Unspecified temporal relation.";
            });
        });

      // Specify a specific region of an element to display, rather than showing the complete area
      // Any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
      const topPadding = 15;

      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "secondary_area_clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -topPadding) // shift upward
        .attr("width", svgWidth)
        .attr("height", height + gapBetweenlegendAndMain + topPadding);

      function updateMainReports() {
        // Re-bind data to existing groups
        const groups = d3
          .selectAll('g[clip-path="url(#secondary_area_clip)"]')
          .selectAll(".main_report_group");

        // ENTER + UPDATE
        groups.each(function (d, i) {
          const group = d3.select(this);
          const startDate = new Date(d.start);
          const endDate = new Date(d.end);

          d.formattedStartDate = mainX(startDate);
          d.formattedEndDate = mainX(endDate);
          const x1 = d.formattedStartDate;
          const x2 = d.formattedEndDate;

          // Update report lines
          group.selectAll('line[data-line-type="x1-only"]').attr("x1", x1).attr("x2", x1);

          group.selectAll('line[data-line-type="x2-only"]').attr("x1", x2).attr("x2", x2);

          group.selectAll('circle[data-marker-type="start"]').attr("cx", x1);

          group.selectAll('circle[data-marker-type="end"]').attr("cx", x2);

          group.selectAll('line[data-line-type="range"]').attr("x1", x1).attr("x2", x2);

          group.selectAll('rect[data-rect-type="before"]').attr("x", x1);

          group.selectAll('rect[data-rect-type="after"]').attr("x", x2);
        });

        // Update x-axis
        d3.select(".main-ER-x-axis-bottom").call(xAxisBottom);
        d3.select(".main-ER-x-axis-top").call(xAxisTop);
      }

      // Function expression to handle mouse wheel zoom or drag on main area
      let zoomed = function () {
        // Ignore zoom triggered by brushing
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

        let transform = d3.event.transform;

        // Rescale the main X-axis based on zoom transform
        let newDomain = transform.rescaleX(overviewX).domain();
        mainX.domain(newDomain);

        // Redraw all reports using new mainX scale
        updateMainReports();
        updateHeatmaps();
        updateDateAnchors();

        // Sync brush with zoom
        // let newBrushSelection = mainX.range().map(transform.invertX, transform);
        // overview.select(".brush").call(brush.move, newBrushSelection);
        overview.select(".brush").call(brush.move, mainX.range().map(transform.invertX, transform));

        // Update custom brush handles (if selection exists)
        let selection = d3.brushSelection(overviewBrush.node());

        showAndMoveCustomBrushHandles(selection);
      };

      // Track expanded/collapsed state for each group
      const expandedState = {};
      desiredOrder.forEach((d) => (expandedState[d] = true)); // Start with all expanded

      // Zoom rect that covers the main area
      let zoom = d3
        .zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
          [0, 0],
          [svgWidth, height],
        ])
        .extent([
          [0, 0],
          [svgWidth, height],
        ])
        .on("zoom", zoomed);

      // Appending zoom rect after the main area will prevent clicking relations
      svg
        .append("rect")
        .attr("class", "zoom_ER")
        .attr("width", svgWidth)
        .attr("height", height + gapBetweenlegendAndMain)
        .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight) + ")")
        .call(zoom);

      // Main area
      // Create main area after zoom panel, so we can select the relations
      let main_ER_svg = svg
        .append("g")
        .attr("class", "main_ER_svg")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top + legendHeight + gapBetweenlegendAndMain) +
            ")"
        );

      // Encounter ages
      let age_ER = svg
        .append("g")
        .attr("class", "age_ER")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top + legendHeight + gapBetweenlegendAndMain + height + pad) +
            ")"
        );

      // Mini overview
      let overview = svg
        .append("g")
        .attr("class", "overview")
        .attr(
          "transform",
          "translate(" +
            margin.left +
            "," +
            (margin.top +
              legendHeight +
              gapBetweenlegendAndMain +
              height +
              pad +
              ageAreaHeight +
              ageAreaBottomPad) +
            ")"
        );

      // Function to calculate lane positions based on expanded state
      function calculateLanePositions() {
        let offset = 0;
        const positions = [];

        desiredOrder.forEach((d) => {
          const isExpanded = expandedState[d];
          const fullHeight = groupLaneHeights[d] * 10 * 2;
          const collapsedHeight = 20; // Minimal height when collapsed
          const height = isExpanded ? fullHeight : collapsedHeight;

          positions.push({
            group: d,
            y: offset + (isExpanded ? groupLaneHeights[d] * 10 : 0), // Label position (middle if expanded)
            startY: offset,
            endY: offset + height,
            isExpanded: isExpanded,
          });

          offset += height;
        });

        return positions;
      }

      // Store original Y positions for each element
      const originalYPositions = new Map();

      // Function to create a heatmap for collapsed lanes
      function createLaneHeatmap(laneGroup, width, height = 15) {
        // Filter data for this lane group
        const laneData = eventData.filter((d) => d.laneGroup === laneGroup);
        console.log("Lane Data:", laneData);

        if (laneData.length === 0) return null;

        // Get the domain from your x scale
        const xScale = mainX;
        const domain = xScale.domain();

        // Create bins across the timeline
        const numBins = 100; // Adjust for granularity
        const binWidth = (domain[1].getTime() - domain[0].getTime()) / numBins; // binWidth in milliseconds
        const bins = Array(numBins).fill(0);

        // Count events in each bin using original time values
        laneData.forEach((d) => {
          // Use d.start and d.end (convert to Date if needed)
          const startDate = xScale.invert(d.formattedStartDate);
          const endDate = xScale.invert(d.formattedEndDate);

          // Calculate bin indices using millisecond timestamps
          const startBin = Math.floor((startDate.getTime() - domain[0].getTime()) / binWidth);
          const endBin = Math.floor((endDate.getTime() - domain[0].getTime()) / binWidth);
          // console.log("Bins:", startBin, endBin);

          // Increment bins
          for (let i = Math.max(0, startBin); i <= Math.min(numBins - 1, endBin); i++) {
            bins[i]++;
          }
        });
        // console.log("Bins:", bins);

        // Find max count for color scaling
        const maxCount = Math.max(...bins);
        // console.log("Max Count:", maxCount);

        // Create color scale
        const colorScale = d3
          .scaleSequential(d3.interpolateRgb("#ffffff", "#006d2c"))
          .domain([0, maxCount || 1]);

        // Create heatmap data, mapping time to pixels with xScale
        const heatmapData = bins.map((count, i) => ({
          x: xScale(new Date(domain[0].getTime() + i * binWidth)), // Convert time to pixel position
          width: xScale(new Date(domain[0].getTime() + binWidth)) - xScale(domain[0]), // Pixel width of a bin
          count: count,
          color: count > 0 ? colorScale(count) : "#ffffff",
        }));
        console.log("Heatmap Data:", heatmapData);

        return heatmapData;
      }

      function updateHeatmaps() {
        const laneGroups = [...new Set(eventData.map((d) => d.laneGroup))];

        laneGroups.forEach((laneGroup) => {
          const heatmapClass = `heatmap-${laneGroup.replace(/\s+/g, "-")}`;
          const heatmapGroup = d3.select(`.${heatmapClass}`);

          if (!heatmapGroup.empty()) {
            // Get the current transform (y position)
            const transform = heatmapGroup.attr("transform");

            // Remove old heatmap
            heatmapGroup.remove();

            // Regenerate heatmap data with updated mainX scale
            const heatmapData = createLaneHeatmap(laneGroup, svgWidth);

            if (heatmapData) {
              // Create new heatmap group
              const newHeatmapGroup = main_ER_svg
                .append("g")
                .attr("class", heatmapClass)
                .attr("transform", transform); // Keep same y position

              // Draw rectangles
              newHeatmapGroup
                .selectAll("rect")
                .data(heatmapData)
                .enter()
                .append("rect")
                .attr("x", (d) => d.x)
                .attr("y", 0)
                .attr("width", (d) => Math.max(1, d.width))
                .attr("height", 10)
                .attr("fill", (d) => d.color)
                .attr("stroke", "none")
                .style("opacity", 0.8);

              // Add border
              newHeatmapGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", svgWidth)
                .attr("height", 10)
                .attr("fill", "none")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1);
            }
          }
        });
      }

      // Zoom in (for collapsed - click to expand/zoom in)
      const zoomIn =
        "M 0 0 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 M 5.65 5.65 L 10 10 M 0 -3 L 0 3 M -3 0 L 3 0";

      // Zoom out (for expanded - click to collapse/zoom out)
      const zoomOut =
        "M 0 0 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 M 5.65 5.65 L 10 10 M -3 0 L 3 0";

      // Function to update the layout
      function updateLayout(animate = true) {
        const positions = calculateLanePositions();

        // Update label groups
        const duration = animate ? 600 : 0;

        // Calculate total height needed
        const totalHeight = positions.length > 0 ? positions[positions.length - 1].endY : 0;

        // Calculate new total SVG height
        const newSvgHeight = totalHeight + overviewHeight;

        // Get the parent of the SVG (which is the MUI Box)
        const svgNode = svg.node();
        const parentBox = d3.select(svgNode.parentNode);

        parentBox
          .transition()
          .duration(duration)
          .style("height", `${newSvgHeight}px`)
          .style("min-height", "unset"); // Remove any min-height constraints

        svg
          .interrupt()
          .transition()
          .duration(duration)
          .attr("viewBox", `0 0 ${containerWidth} ${newSvgHeight}`)
          .style("height", `${newSvgHeight}px`);

        // Inside updateLayout function, add:
        main_ER_svg
          .selectAll(".date-anchor-line")
          .transition()
          .duration(duration)
          .attr("y2", totalHeight); // Update to new total height

        // Update zoom rect height
        svg
          .select(".zoom_ER")
          .transition()
          .duration(duration)
          .attr("height", totalHeight + gapBetweenlegendAndMain);

        // Update age_ER position
        age_ER
          .transition()
          .duration(duration)
          .attr(
            "transform",
            `translate(${margin.left}, ${
              margin.top + legendHeight + gapBetweenlegendAndMain + totalHeight + pad
            })`
          );

        // Update x-axis position (bottom of main area)
        svg
          .select(".main-ER-x-axis-bottom")
          .transition()
          .duration(duration)
          .attr(
            "transform",
            `translate(0, ${margin.top + legendHeight + gapBetweenlegendAndMain + totalHeight})`
          );

        // Update overview position
        overview
          .transition()
          .duration(duration)
          .attr(
            "transform",
            `translate(${margin.left}, ${
              margin.top +
              margin.bottom +
              legendHeight +
              gapBetweenlegendAndMain +
              totalHeight +
              pad +
              ageAreaHeight +
              ageAreaBottomPad
            })`
          );

        labelGroup
          .transition()
          .duration(duration)
          .attr("transform", (d, i) => {
            const offset = positions[i].isExpanded ? 0 : 10;
            return `translate(0, ${positions[i].y + offset})`;
          });

        // Update toggle buttons position
        toggleButtonGroup
          .transition()
          .duration(duration)
          .attr("transform", (d, i) => {
            const offset = positions[i].isExpanded ? 0 : 10;
            return `translate(0, ${positions[i].y + offset})`;
          });

        // Update divider lines
        const dividers = main_ER_svg.selectAll(".report_type_divider").data(positions.slice(0, -1));

        dividers
          .transition()
          .duration(duration)
          .attr("y1", (d) => {
            // If the lane is collapsed, position divider after the heatmap
            // Otherwise position it at the end of the expanded lane
            return d.isExpanded ? d.endY : d.y + 20;
          })
          .attr("y2", (d) => {
            return d.isExpanded ? d.endY : d.y + 20;
          });

        // Update toggle buttons text/icon - more specific selector
        toggleButtonGroup.each(function (d) {
          d3.select(this)
            .select(".toggle-icon")
            .transition()
            .duration(duration)
            .attr("d", expandedState[d] ? zoomOut : zoomIn);
        });

        // Recalculate groupBaseYMap based on new positions
        const newGroupBaseYMap = {};
        positions.forEach((pos) => {
          newGroupBaseYMap[pos.group] =
            pos.startY + (pos.isExpanded ? groupLaneHeights[pos.group] * 10 : 0);
        });

        // Calculate the offset for each group
        const groupOffsets = {};
        positions.forEach((pos) => {
          const oldBaseY = groupBaseYMap[pos.group];
          const newBaseY = newGroupBaseYMap[pos.group];
          groupOffsets[pos.group] = newBaseY - oldBaseY;
        });

        // Update data elements
        mainReports.selectAll(".main_report_group").each(function (d, i) {
          const group = d3.select(this);
          const isExpanded = expandedState[d.laneGroup];

          // Handle conceptId as array or single value
          const conceptId = Array.isArray(d.conceptId) ? d.conceptId[0] : d.conceptId;
          const elementId = `${d.laneGroup}_${i}_${conceptId}`;

          // Get the relative Y position (stored relative to base)
          const relativeY = originalYPositions.get(elementId) || 0;

          // Calculate new absolute Y position
          const newBaseY = newGroupBaseYMap[d.laneGroup];
          const newY = newBaseY + relativeY;

          group
            .transition()
            .duration(duration)
            .attr("transform", `translate(0, ${newY})`)
            .style("opacity", isExpanded ? 1 : 0);

          group.style("pointer-events", isExpanded ? "all" : "none");
        });

        // Update or create heatmaps for collapsed lanes
        positions.forEach((pos) => {
          const laneGroup = pos.group;
          const isExpanded = pos.isExpanded;

          // Remove existing heatmap if it exists
          main_ER_svg.selectAll(`.heatmap-${laneGroup.replace(/\s+/g, "-")}`).remove();

          if (!isExpanded) {
            // Create heatmap for collapsed lane
            const heatmapData = createLaneHeatmap(laneGroup, svgWidth);

            if (heatmapData) {
              const heatmapGroup = main_ER_svg
                .append("g")
                .attr("class", `heatmap-${laneGroup.replace(/\s+/g, "-")}`)
                .attr("transform", `translate(0, ${pos.y + 5})`); // Position at lane location

              heatmapGroup
                .selectAll("rect")
                .data(heatmapData)
                .enter()
                .append("rect")
                .attr("x", (d) => d.x)
                .attr("y", 0)
                .attr("width", (d) => Math.max(1, d.width))
                .attr("height", 10)
                .attr("fill", (d) => d.color)
                .attr("stroke", "none")
                .style("opacity", 0)
                .transition()
                .duration(duration)
                .style("opacity", 0.8);

              // Add a border around the heatmap
              heatmapGroup
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", svgWidth)
                .attr("height", 10)
                .attr("fill", "none")
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1);
            }
          }
        });

        // Update the global groupBaseYMap
        Object.assign(groupBaseYMap, newGroupBaseYMap);
      }

      // Create a group for toggle buttons (outside the main graph area)
      let toggleButtonContainer = svg
        .append("g")
        .attr("class", "toggle_button_container")
        .attr(
          "transform",
          "translate(" +
            (margin.left + svgWidth + 10) + // 10px to the right of the graph
            "," +
            (margin.top + legendHeight + gapBetweenlegendAndMain) +
            ")"
        );

      let laneOffset = 0;
      // Report types texts
      const labelPositions = calculateLanePositions(); // Store the y-coordinates
      let previousY = 0;
      const labelGroup = main_ER_svg
        .append("g")
        .selectAll(".report_type_label_group")
        .data([...new Set(desiredOrder)])
        .enter()
        .append("g")
        .attr("class", "report_type_label_group")
        .attr("transform", (d, i) => `translate(0, ${labelPositions[i].y})`);

      // Add the main text label
      labelGroup
        .append("text")
        .attr("class", "report_type_label")
        .attr("dy", ".5ex")
        .attr("x", -textMargin)
        .text((d) => `${d} (${laneGroupCount[d]}):`);

      // Create toggle buttons in the separate container
      const toggleButtonGroup = toggleButtonContainer
        .selectAll(".toggle_button")
        .data([...new Set(desiredOrder)])
        .enter()
        .append("g")
        .attr("class", "toggle_button")
        .attr("transform", (d, i) => `translate(0, ${labelPositions[i].y})`)
        .style("cursor", "pointer")
        .on("click", function (d) {
          d3.event.stopPropagation(); // Use event.stopPropagation() for D3 v6+
          expandedState[d] = !expandedState[d];
          updateLayout(true);
        });

      toggleButtonGroup.each(function () {
        const btn = d3.select(this);

        // Add background circle
        btn
          .append("circle")
          .attr("class", "toggle-bg")
          .attr("r", 10)
          .attr("fill", "#fff")
          .attr("stroke", "#666")
          .attr("stroke-width", 1.5);

        btn
          .append("path")
          .attr("class", "toggle-icon")
          .attr("d", (d) => {
            if (expandedState[d]) {
              return zoomOut;
            } else {
              return zoomIn;
            }
          })
          .attr("fill", "none")
          .attr("stroke", "#666")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round");
      });

      labelGroup.each(function (d) {
        const group = d3.select(this);
        const label = group.select(".report_type_label");

        // Add a <title> to the label itself to show tooltip on hover
        label.append("title").text(() => {
          const definitions = {
            Finding: "(symptoms, test results)",
            Severity: "(stage, grade, tnm)",
            Disease: "(neoplasm, disease, disorder)",
            Treatment: "(procedure, medication)",
          };
          return definitions[d] || "No definition available.";
        });
      });

      // Initial divider lines
      main_ER_svg
        .append("g")
        .selectAll(".report_type_divider")
        .data(labelPositions.slice(0, -1))
        .enter()
        .append("line")
        .attr("class", "report_type_divider")
        .attr("x1", 0)
        .attr("x2", svgWidth)
        .attr("y1", (d) => Math.round(d.endY))
        .attr("y2", (d) => Math.round(d.endY))
        .attr("stroke", "#666")
        .attr("stroke-width", 2);

      const defs = d3.select("svg").append("defs");

      const rightArrow = defs
        .append("marker")
        .attr("id", "rightArrow")
        .attr("class", "relation-icon")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 4)
        .attr("refY", 6)
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("fill-opacity", 1)
        .attr("orient", "auto");

      // Green "top" arrow (normal size)
      rightArrow
        .append("path")
        .attr("class", "relation-icon")
        .attr("d", "M 0 0 L 12 6 L 0 12 Z")
        .style("fill", "rgb(49, 163, 84)");

      const selectedRightArrow = defs
        .append("marker")
        .attr("id", "selectedRightArrow")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 4)
        .attr("refY", 6)
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto");

      selectedRightArrow
        .append("path")
        .attr("d", "M 0 0 L 12 6 L 0 12 Z")
        .style("fill", "rgb(49, 163, 84)")
        .style("stroke", "black")
        .style("stroke-width", 1);

      const rightCap = defs
        .append("marker")
        .attr("id", "rightCap")
        .attr("viewBox", "0 0 20 12")
        .attr("refX", 8)
        .attr("refY", 6)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto");

      rightCap
        .append("path")
        .attr("d", "M 0 6 L 8 6")
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", 4);

      const selectedRightCap = defs
        .append("marker")
        .attr("id", "selectedRightCap")
        .attr("viewBox", "0 0 20 12")
        .attr("refX", 8)
        .attr("refY", 6)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto");

      // Add black outline stroke (slightly wider)
      selectedRightCap
        .append("path")
        .attr("d", "M 0 6 L 8 6")
        .style("stroke", "black")
        .style("stroke-width", 6); // wider for outline

      // Add green stroke on top
      selectedRightCap
        .append("path")
        .attr("d", "M 0 6 L 8 6")
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", 4);

      const leftCap = defs
        .append("marker")
        .attr("id", "leftCap")
        .attr("viewBox", "0 0 20 12")
        .attr("refX", 12) // Position at the start of the line
        .attr("refY", 6)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto");

      leftCap
        .append("path")
        .attr("d", "M 12 6 L 20 6") // horizontal line extending leftward from the line start
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", 4);

      const selectedLeftCap = defs
        .append("marker")
        .attr("id", "selectedLeftCap")
        .attr("viewBox", "0 0 20 12")
        .attr("refX", 12) // Position at the start of the line
        .attr("refY", 6)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto");

      // Black outline (wider stroke underneath)
      selectedLeftCap
        .append("path")
        .attr("d", "M 12 6 L 20 6")
        .style("stroke", "black")
        .style("stroke-width", 6);

      // Green line on top
      selectedLeftCap
        .append("path")
        .attr("d", "M 12 6 L 20 6")
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", 4);

      // Define the left arrow marker
      const leftArrow = defs
        .append("marker")
        .attr("id", "leftArrow")
        .attr("class", "relation-icon")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6) // Shift the arrowhead slightly left
        .attr("refY", 6)
        .attr("markerWidth", 2.5)
        .attr("fill-opacity", 1)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto");

      leftArrow
        .append("path")
        .attr("class", "relation-icon")
        .attr("d", "M 12 0 L 0 6 L 12 12") // Left-pointing triangle
        .style("fill", "rgb(49, 163, 84)");

      const selectedLeftArrow = defs
        .append("marker")
        .attr("id", "selectedLeftArrow")
        // .attr("class", "relation-icon")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6) // Shift the arrowhead slightly left
        .attr("refY", 6)
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto");

      selectedLeftArrow
        .append("path")
        .attr("d", "M 12 0 L 0 6 L 12 12 Z") // Close the triangle
        .style("fill", "rgb(49, 163, 84)")
        .style("stroke", "black")
        .style("stroke-width", 1);

      const verticalLineCap = defs
        .append("marker")
        .attr("id", "verticalLineCap")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6) // Center horizontally
        .attr("refY", 6) // Center vertically
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto");

      verticalLineCap
        .append("path")
        .attr("d", "M6 0 L6 12") // vertical line from top to bottom
        // .style("fill", "rgb(49, 163, 84)")
        .style("stroke", "rgb(49, 163, 84)")
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.75);

      const selectedVerticalLineCap = defs
        .append("marker")
        .attr("id", "selectedVerticalLineCap")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6) // Center horizontally
        .attr("refY", 6) // Center vertically
        .attr("markerWidth", 2.5)
        .attr("markerHeight", 2.5)
        .attr("orient", "auto");

      // Black stroke underneath (wider for outline)
      selectedVerticalLineCap
        .append("path")
        .attr("d", "M6 0 L6 12")
        .style("stroke", "black")
        .style("stroke-width", 5) // slightly wider than green
        .style("stroke-opacity", 1);

      // Green stroke on top
      selectedVerticalLineCap
        .append("path")
        .attr("d", "M6 0 L6 12")
        .style("stroke", "rgb(49, 163, 84)")
        .style("stroke-width", 3)
        .style("stroke-opacity", 0.75);

      function updateDateAnchors() {
        d3.selectAll(".date-anchor-line")
          .attr("x1", (d) => mainX(d))
          .attr("x2", (d) => mainX(d));
      }

      // Add this BEFORE you create mainReports
      const dateAnchorGroup = main_ER_svg
        .append("g")
        .attr("class", "date-anchors")
        .attr("clip-path", "url(#secondary_area_clip)")
        .lower(); // Send to back so relations appear on top

      // Add vertical lines at each unique date
      dateAnchorGroup
        .selectAll(".date-anchor-line")
        .data(uniqueDates)
        .enter()
        .append("line")
        .attr("class", "date-anchor-line")
        .attr("x1", (d) => mainX(d))
        .attr("x2", (d) => mainX(d))
        .attr("y1", 0)
        .attr("y2", height) // spans all lanes
        .style("stroke", "#d3d3d3") // light gray
        .style("stroke-width", 2)
        .style("stroke-dasharray", "3,3") // dashed line
        .style("opacity", 0.9)
        .style("pointer-events", "none"); // don't interfere with clicks

      let mainReports = main_ER_svg.append("g").attr("clip-path", "url(#secondary_area_clip)");

      const occupiedSlots = new Map(); // Key: base Y, Value: array of [x1, x2] pairs
      laneOffset = 0;
      let groupBaseYMap = {};

      [...new Set(desiredOrder)].forEach((group) => {
        groupBaseYMap[group] = laneOffset + groupLaneHeights[group] * 10; // center within the block if needed
        laneOffset += groupLaneHeights[group] * 10 * 2; // double it if each lane is that tall
      });

      mainReports
        .selectAll(".main_report_ER")
        .data(
          eventData
            .slice() // avoid mutating the original
            .sort((a, b) => {
              // Count how often each conceptID appears (handling arrays)
              const countMap = {};
              eventData.forEach((item) => {
                // Handle both single values and arrays
                const conceptIds = Array.isArray(item.conceptId)
                  ? item.conceptId
                  : [item.conceptId];
                conceptIds.forEach((id) => {
                  countMap[id] = (countMap[id] || 0) + 1;
                });
              });

              // Get the primary (first) conceptId for sorting
              const aConceptId = Array.isArray(a.conceptId) ? a.conceptId[0] : a.conceptId;
              const bConceptId = Array.isArray(b.conceptId) ? b.conceptId[0] : b.conceptId;

              // Sort by count (descending)
              return countMap[bConceptId] - countMap[aConceptId];
            })
        )
        .enter()
        .append("g")
        .attr("class", "main_report_group")
        .each(function (d, i) {
          console.log("Rendering event:", i, d); // Add this line

          // Handle conceptId as array or single value
          const conceptId = Array.isArray(d.conceptId) ? d.conceptId[0] : d.conceptId;
          const preferredText = concepts.find((c) => c.id === conceptId)?.preferredText;
          console.log("Found preferredText:", preferredText); // And this line

          const group = d3.select(this);
          const x1 = d.formattedStartDate;
          const x2 = d.formattedEndDate;
          const baseY = groupBaseYMap[d.laneGroup];
          let y = baseY;
          const buffer = 15;

          // const checkOverlap = (a, b) => Math.max(a[0], b[0]) <= Math.min(a[1], b[1]);

          const checkOverlapWithPadding = (a, b, padding) => {
            const aStart = a[0] - padding;
            const aEnd = a[1] + padding;
            const bStart = b[0] - padding;
            const bEnd = b[1] + padding;
            return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
          };

          const pixelPadding = 8; // or however much buffer you want

          // Check if base position is available first
          let slotList = occupiedSlots.get(baseY) || [];
          if (
            !slotList.some((slot) =>
              checkOverlapWithPadding(
                [d.formattedStartDate, d.formattedEndDate],
                slot,
                pixelPadding
              )
            )
          ) {
            y = baseY;
          } else {
            // Search for available slot by alternating up and down
            let found = false;
            let offset = buffer;

            while (!found) {
              // Try below first
              let candidateY = baseY + offset;
              let candidateSlots = occupiedSlots.get(candidateY) || [];
              if (
                !candidateSlots.some((slot) =>
                  checkOverlapWithPadding(
                    [d.formattedStartDate, d.formattedEndDate],
                    slot,
                    pixelPadding
                  )
                )
              ) {
                y = candidateY;
                found = true;
              } else {
                // Try above
                candidateY = baseY - offset;
                candidateSlots = occupiedSlots.get(candidateY) || [];
                if (
                  !candidateSlots.some((slot) =>
                    checkOverlapWithPadding(
                      [d.formattedStartDate, d.formattedEndDate],
                      slot,
                      pixelPadding
                    )
                  )
                ) {
                  y = candidateY;
                  found = true;
                } else {
                  // Increase offset and try next level
                  offset += buffer;
                }
              }
            }
          }

          // Reserve this slot
          slotList = occupiedSlots.get(y) || [];
          slotList.push([d.formattedStartDate, d.formattedEndDate]);
          occupiedSlots.set(y, slotList);

          // When storing, store relative to base
          // const conceptId = Array.isArray(d.conceptId) ? d.conceptId[0] : d.conceptId;
          const elementId = `${d.laneGroup}_${i}_${conceptId}`;
          const relativeY = y - baseY; // Store position relative to base!
          originalYPositions.set(elementId, relativeY);

          // Then set the parent group's position
          group.attr("transform", `translate(0, ${y})`);

          // Adjust line thickness if it's an overlap
          const containsGroup = group.append("g").attr("class", "contains-group");

          function drawRelationLine({ group, d, x1, x2, markerStart, markerEnd, handleClick }) {
            console.log("Drawing relation line:", d.conceptId, x1, x2); // Add this

            // Handle arrays for display
            const conceptIds = Array.isArray(d.conceptId) ? d.conceptId : [d.conceptId];
            // Get concept names and count duplicates
            const conceptNames = conceptIds.map(
              (id) => concepts.find((c) => c.id === id)?.preferredText || "Unknown"
            );
            // Count occurrences of each concept name
            const nameCounts = {};
            conceptNames.forEach((name) => {
              nameCounts[name] = (nameCounts[name] || 0) + 1;
            });

            // Format as "Name (x3), Other Name (x2)" or just "Name" if count is 1
            const conceptNamesDisplay = Object.entries(nameCounts)
              .map(([name, count]) => (count > 1 ? `${name} (x${count})` : name))
              .join(", ");

            const tooltipText = `${d.relation1}: ${d.start}\n${d.relation2}: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;

            group
              .append("line")
              .attr("class", "relation-outline")
              .attr("data-line-type", "range")
              .attr("x1", x1 - 1)
              .attr("y1", 0)
              .attr("x2", x2 + 1)
              .attr("y2", 0)
              .attr("stroke", "black")
              .attr("stroke-width", 7)
              .style("cursor", "pointer")
              .attr("stroke-opacity", 0);

            const mainLine = group
              .append("line")
              .attr("class", "main_report_ER relation-icon")
              .attr("data-concept-id", conceptIds.join(","))
              .attr("data-line-type", "range")
              .attr("x1", x1)
              .attr("x2", x2)
              .attr("y1", 0)
              .attr("y2", 0)
              .attr("stroke", "rgb(49, 163, 84)")
              .attr("stroke-width", 5)
              .attr("stroke-opacity", 0.75)
              .style("cursor", "pointer")
              .on("click", (event) => handleClick(event, d));
            if (markerStart) {
              mainLine.attr("marker-start", markerStart);
            }
            if (markerEnd) {
              mainLine.attr("marker-end", markerEnd);
            }
            mainLine.append("title").text(tooltipText);

            group
              .append("circle")
              .attr("cx", x2)
              .attr("cy", 0)
              .attr("data-marker-type", "end")
              .attr("r", 8) // increase as needed to ensure easy hover/click
              .style("fill", "transparent")
              .style("cursor", "pointer")
              .attr("pointer-events", "all")
              .on("click", (event) => handleClick(event, d))
              .append("title")
              .text(tooltipText);

            group
              .append("circle")
              .attr("cx", x1)
              .attr("cy", 0)
              .attr("data-marker-type", "start")
              .attr("r", 8) // increase as needed to ensure easy hover/click
              .style("fill", "transparent")
              .style("cursor", "pointer")
              .attr("pointer-events", "all")
              .on("click", (event) => handleClick(event, d))
              .append("title")
              .text(tooltipText);
          }

          function drawSoloAfterRelation({ group, d, x, handleClick }) {
            // Handle arrays for display
            const conceptIds = Array.isArray(d.conceptId) ? d.conceptId : [d.conceptId];
            // Get concept names and count duplicates
            const conceptNames = conceptIds.map(
              (id) => concepts.find((c) => c.id === id)?.preferredText || "Unknown"
            );
            // Count occurrences of each concept name
            const nameCounts = {};
            conceptNames.forEach((name) => {
              nameCounts[name] = (nameCounts[name] || 0) + 1;
            });

            // Format as "Name (x3), Other Name (x2)" or just "Name" if count is 1
            const conceptNamesDisplay = Object.entries(nameCounts)
              .map(([name, count]) => (count > 1 ? `${name} (x${count})` : name))
              .join(", ");

            const tooltipText = `${d.relation1}: ${d.start}\n${d.relation2}: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;

            group
              .append("rect")
              .attr("data-concept-id", conceptIds.join(","))
              .attr("data-rect-type", "after")
              .attr("x", x - 5) // Align with arrow
              .attr("y", -5)
              .attr("width", 10)
              .attr("height", 10)
              .style("fill", "transparent")
              .style("cursor", "pointer")
              .on("click", (event) => handleClick(event, d))
              .append("title")
              .text(tooltipText);
          }

          function drawSoloBeforeRelation({ group, d, x, handleClick }) {
            // Handle arrays for display
            const conceptIds = Array.isArray(d.conceptId) ? d.conceptId : [d.conceptId];
            // Get concept names and count duplicates
            const conceptNames = conceptIds.map(
              (id) => concepts.find((c) => c.id === id)?.preferredText || "Unknown"
            );
            // Count occurrences of each concept name
            const nameCounts = {};
            conceptNames.forEach((name) => {
              nameCounts[name] = (nameCounts[name] || 0) + 1;
            });

            // Format as "Name (x3), Other Name (x2)" or just "Name" if count is 1
            const conceptNamesDisplay = Object.entries(nameCounts)
              .map(([name, count]) => (count > 1 ? `${name} (x${count})` : name))
              .join(", ");

            const tooltipText = `${d.relation1}: ${d.start}\n${d.relation2}: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;

            group
              .append("rect")
              .attr("data-concept-id", conceptIds.join(","))
              .attr("data-rect-type", "before")
              .attr("x", x - 10) // Align with arrow
              .attr("y", -5)
              .attr("width", 10)
              .attr("height", 10)
              .style("fill", "transparent")
              .style("cursor", "pointer")
              .on("click", (event) => handleClick(event, d))
              .append("title")
              .text(tooltipText);
          }

          function drawOnRelation({ group, d, x, lineType, handleClick }) {
            // Handle arrays for display
            const conceptIds = Array.isArray(d.conceptId) ? d.conceptId : [d.conceptId];
            // Get concept names and count duplicates
            const conceptNames = conceptIds.map(
              (id) => concepts.find((c) => c.id === id)?.preferredText || "Unknown"
            );
            // Count occurrences of each concept name
            const nameCounts = {};
            conceptNames.forEach((name) => {
              nameCounts[name] = (nameCounts[name] || 0) + 1;
            });

            // Format as "Name (x3), Other Name (x2)" or just "Name" if count is 1
            const conceptNamesDisplay = Object.entries(nameCounts)
              .map(([name, count]) => (count > 1 ? `${name} (x${count})` : name))
              .join(", ");

            const tooltipText = `${d.relation1}: ${d.start}\n${d.relation2}: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;
            group
              .append("line")
              .attr("class", "relation-outline")
              .attr("data-line-type", lineType)
              .attr("x1", x)
              .attr("y1", -7)
              .attr("x2", x)
              .attr("y2", 7)
              .attr("stroke", "black")
              .attr("stroke-width", 5)
              .style("cursor", "pointer")
              .attr("stroke-opacity", 0);

            group
              .append("line")
              .attr("class", "main_report_contains relation-icon")
              .attr("data-concept-id", conceptIds.join(", "))
              .attr("data-line-type", lineType)
              .attr("y1", -6) // Extends above
              .attr("y2", 6) // Extends below
              .attr("stroke", "rgb(49, 163, 84)")
              .attr("stroke-width", 4)
              .attr("stroke-opacity", 0.75)
              .style("cursor", "pointer")
              .on("click", (event) => {
                console.log("Data bound to this line:", d);
                handleClick(event, d);
              })
              .append("title")
              .text(tooltipText);
          }

          if (d.relation1 === "After" && d.relation2 === "After") {
            //   >
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              handleClick,
            });
            drawSoloAfterRelation({
              group: containsGroup,
              d,
              x: x2,
              handleClick,
            });
          }
          if (d.relation1 === "After" && d.relation2 === "Overlaps") {
            // >------
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#rightArrow)",
              markerEnd: "url(#rightCap)",
              handleClick,
            });
            // TODO: ADD A rightArrowLeft option >----- in defs
          }
          // TODO: NO AFTER , ON to test on
          if (d.relation1 === "After" && d.relation2 === "On") {
            // >---|
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#rightArrow)",
              markerEnd: "url(#verticalLineCap)",
              handleClick,
            });
          }
          if (d.relation1 === "On" && d.relation2 === "On") {
            // |----|
            if (d.formattedStartDate === d.formattedEndDate) {
              drawOnRelation({
                group: containsGroup,
                d,
                x: x1,
                lineType: "x1-only",
                handleClick,
              });
            } else {
              drawRelationLine({
                group: containsGroup,
                d,
                x1,
                x2,
                markerStart: "url(#verticalLineCap)",
                markerEnd: "url(#verticalLineCap)",
                handleClick,
              });
            }
          }
          if (d.relation1 === "On" && d.relation2 === "Before") {
            // |-----<
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#verticalLineCap)",
              markerEnd: "url(#leftArrow)",
              handleClick,
            });
          }
          if (d.relation1 === "On" && d.relation2 === "Overlaps") {
            // |----
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#verticalLineCap)",
              markerEnd: "url(#rightCap)",
              handleClick,
            });
          }
          if (d.relation1 === "After" && d.relation2 === "Before") {
            // >---<

            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#rightArrow)",
              markerEnd: "url(#leftArrow)",
              handleClick,
            });
          }
          if (d.relation1 === "Before" && d.relation2 === "Before") {
            //    <
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              handleClick,
            });
            drawSoloBeforeRelation({
              group: containsGroup,
              d,
              x: x1,
              handleClick,
            });
          }
          if (d.relation1 === "Before" && d.relation2 === "Overlaps") {
            // <-------
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#leftArrow)",
              markerEnd: "url(#rightCap)",
              handleClick,
            });
          }
          if (d.relation1 === "Overlaps" && d.relation2 === "Before") {
            // --------<
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#leftCap)",
              markerEnd: "url(#leftArrow)",
              handleClick,
            });
          }
          if (d.relation1 === "Overlaps" && d.relation2 === "On") {
            // -----|

            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#leftCap)",
              markerEnd: "url(#verticalLineCap)",
              handleClick,
            });
          }
          if (d.relation1 === "Overlaps" && d.relation2 === "Overlaps") {
            // ------
            drawRelationLine({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#leftCap)",
              markerEnd: "url(#rightCap)",
              handleClick,
            });
          }
        });

      function handleClick(event, d) {
        const clickedConceptIds = Array.isArray(d.conceptId) ? d.conceptId : [d.conceptId];
        console.log(d);
        if (!clickedConceptIds.length) return;

        setClickedTerms((prevTerms) => {
          // Check if ANY of the merged concept IDs are already clicked
          const hasAnyClicked = clickedConceptIds.some((id) => prevTerms.includes(id));

          if (hasAnyClicked) {
            // Remove ALL concept IDs from this merged event
            return prevTerms.filter((term) => !clickedConceptIds.includes(term));
          } else {
            // Add ALL concept IDs from this merged event
            return [...prevTerms, ...clickedConceptIds];
          }
        });

        // Set all circles and relations to light/transparent
        document.querySelectorAll("circle").forEach((circle) => {
          circle.style.fillOpacity = "0.3"; // very light by default
        });

        document.querySelectorAll(".relation-icon").forEach((el) => {
          if (!el.classList.contains("selected")) {
            el.classList.add("unselected");
          }
        });

        const markerToggleMap = {
          "url(#rightCap)": "url(#selectedRightCap)",
          "url(#selectedRightCap)": "url(#rightCap)",
          "url(#leftCap)": "url(#selectedLeftCap)",
          "url(#selectedLeftCap)": "url(#leftCap)",
          "url(#verticalLineCap)": "url(#selectedVerticalLineCap)",
          "url(#selectedVerticalLineCap)": "url(#verticalLineCap)",
          "url(#rightArrow)": "url(#selectedRightArrow)",
          "url(#selectedRightArrow)": "url(#rightArrow)",
          "url(#leftArrow)": "url(#selectedLeftArrow)",
          "url(#selectedLeftArrow)": "url(#leftArrow)",
        };

        // Emphasize matching relations
        clickedConceptIds.forEach((id) => {
          document.querySelectorAll(`.relation-icon[data-concept-id="${id}"]`).forEach((el) => {
            skipNextEffect.current = true;
            // console.log(clickedConceptId);

            if (el.hasAttribute("marker-end")) {
              const currentMarker = el.getAttribute("marker-end");
              if (markerToggleMap[currentMarker]) {
                el.setAttribute("marker-end", markerToggleMap[currentMarker]);
              }
            }

            if (el.hasAttribute("marker-start")) {
              const currentMarker = el.getAttribute("marker-start");
              if (markerToggleMap[currentMarker]) {
                el.setAttribute("marker-start", markerToggleMap[currentMarker]);
              }
            }

            if (el.classList.contains("selected")) {
              el.classList.remove("selected");
              el.classList.add("unselected");
            } else {
              el.classList.remove("unselected");
              el.classList.add("selected");
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
        });

        const matchingNotes = Object.entries(conceptsPerDocument)
          .filter(([_, objArray]) => objArray.some((obj) => clickedConceptIds.includes(obj.id)))
          .map(([note]) => note);

        matchingNotes.forEach((reportId) => {
          const circle = document.getElementById(reportId);

          if (circle && circle.parentNode) {
            const svg = circle.parentNode;
            const existingRing = svg.querySelector(`#highlight-ring-${reportId}`);

            if (existingRing) {
              // 🔹 If it's already highlighted, remove the ring (toggle off)
              existingRing.remove();
              return;
            }

            // 🔹 Otherwise, create a slightly larger ring behind the circle
            const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ring.setAttribute("cx", circle.getAttribute("cx"));
            ring.setAttribute("cy", circle.getAttribute("cy"));
            ring.setAttribute("r", parseFloat(circle.getAttribute("r")) * 1.4);
            ring.setAttribute("fill", "none");
            ring.setAttribute("stroke", "gold");
            ring.setAttribute("stroke-opacity", "0.7");
            ring.setAttribute("stroke-width", "6");
            ring.setAttribute("id", `highlight-ring-${reportId}`);

            svg.insertBefore(ring, circle);
          } else {
            console.log("Circle not found:", reportId);
          }
        });
      }

      // Bottom axis
      const xAxisBottom = d3.axisBottom(mainX).tickSizeInner(5).tickSizeOuter(0);

      // Top axis (same ticks, but labels on top)
      const xAxisTop = d3.axisTop(mainX).tickSizeInner(5).tickSizeOuter(0);

      // Append x axis to bottom
      main_ER_svg
        .append("g")
        .attr("class", "main-ER-x-axis-bottom")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxisBottom);

      // Append x axis to top
      main_ER_svg
        .append("g")
        .attr("class", "main-ER-x-axis-top")
        .attr("transform", "translate(0, 0)") // or tweak the Y offset if needed
        .call(xAxisTop);

      // Encounter ages
      age_ER
        .append("text")
        .attr("x", -textMargin)
        .attr("y", ageAreaHeight / 2) // Relative to the overview area
        .attr("dy", ".5ex")
        .attr("class", "age_label")
        .text("Patient Age");

      // Patient's first and last encounter dates and corresponding ages
      // We use the dates to render x position
      let encounterDates = [minStartDate, maxEndDate];
      // We use the calculated ages to render the text of age
      // TODO: NEED TO MAKE ENCOUNTER AGE DYNAMIC
      let encounterAges = [53, 56];

      age_ER
        .selectAll(".encounter_age")
        .data(encounterDates)
        .enter()
        .append("text")
        .attr("x", function (d) {
          return mainX(d);
        })
        .attr("y", ageAreaHeight / 2)
        .attr("dy", ".5ex")
        .attr("class", "encounter_age")
        .text(function (d, i) {
          return encounterAges[i];
        });

      // Vertical guidelines based on min and max dates (date objects)
      age_ER
        .selectAll(".encounter_age_guideline")
        .data(encounterDates)
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return mainX(d);
        })
        .attr("y1", 12)
        .attr("x2", function (d) {
          return mainX(d);
        })
        .attr("y2", 25)
        .attr("class", "encounter_age_guideline");

      let overViewScrollerHeight = overviewHeight / 18;

      // Overview label text
      overview
        .append("text")
        .attr("x", -textMargin)
        .attr("y", overViewScrollerHeight) // Relative to the overview area
        .attr("dy", ".5ex")
        .attr("class", "overview_label")
        .text("Date");

      // Overview x axis
      let overviewXAxis = d3
        .axisBottom(overviewX)
        .tickSizeInner(5)
        .tickSizeOuter(0)
        // Abbreviated month format
        .tickFormat(d3.timeFormat("%b"));

      // Append x axis to the bottom of overview area
      overview
        .append("g")
        .attr("class", "overview-x-axis")
        .attr("transform", "translate(0, " + overviewHeight / 18 + ")")
        .call(overviewXAxis);

      // Add brush to overview
      let overviewBrush = overview.append("g").attr("class", "brush");

      // Add custom brush handles
      let customBrushHandlesData = [{ type: "w" }, { type: "e" }];

      // Function expression to create custom brush handle path
      let createCustomBrushHandle = function (d) {
        let e = +(d.type === "e"),
          x = e ? 1 : -1,
          y = overViewScrollerHeight / 2;

        return (
          "M" +
          0.5 * x +
          "," +
          y +
          "A6,6 0 0 " +
          e +
          " " +
          6.5 * x +
          "," +
          (y + 6) +
          "V" +
          (2 * y - 6) +
          "A6,6 0 0 " +
          e +
          " " +
          0.5 * x +
          "," +
          2 * y +
          "ZM" +
          2.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8) +
          "M" +
          4.5 * x +
          "," +
          (y + 8) +
          "V" +
          (2 * y - 8)
        );
      };

      // Add two custom brush handles
      let customBrushHandle = overviewBrush
        .selectAll(".handle--custom")
        .data(customBrushHandlesData)
        .enter()
        .append("path")
        .attr("class", "handle--custom")
        .attr("cursor", "ew-resize")
        .attr("d", createCustomBrushHandle)
        .attr("transform", function (d, i) {
          // Position the custom handles based on the default selection range
          let selection = [0, svgWidth];
          return "translate(" + [selection[i], -overViewScrollerHeight / 4] + ")";
        });

      // Function expression of updating custom handles positions
      let showAndMoveCustomBrushHandles = function (selection) {
        customBrushHandle
          // First remove the "display: none" added by brushStart to show the handles
          .style("display", null)
          // Then move the handles to desired positions
          .attr("transform", function (d, i) {
            return "translate(" + [selection[i], -overViewScrollerHeight / 4] + ")";
          });
      };

      // Function expression to create brush function redraw with selection
      // Need to define this before defining brush since it's function expression instead of function declaration
      let brushed = function () {
        // Ignore brush triggered by zooming
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

        let selection = d3.brushSelection(overviewBrush.node());
        if (!selection) return;

        // Update custom brush handles
        showAndMoveCustomBrushHandles(selection);

        // Rescale main X-axis domain based on brush
        mainX.domain(selection.map(overviewX.invert));

        // Redraw reports
        updateMainReports();
        updateHeatmaps();
        updateDateAnchors();

        // Sync zoom with brush
        svg
          .select(".zoom_ER")
          .call(
            zoom.transform,
            d3.zoomIdentity
              .scale(svgWidth / (selection[1] - selection[0]))
              .translate(-selection[0], 0)
          );
      };

      // D3 brush
      let brush = d3
        .brushX()
        .extent([
          [0, 0],
          [svgWidth, overViewScrollerHeight],
        ])
        // Update the UI on brush move
        .on("brush", brushed);

      // Applying brush on the overviewBrush element
      // Don't merge this with the overviewBrush definition because
      // brush calls brushed which uses customBrushHandle when it gets called and
      // we can't define overviewBrush before brush if combined.
      overviewBrush
        // For the first time of loading this page, no brush movement
        .call(brush)
        // We use overviewX.range() as the default selection
        // https://github.com/d3/d3-selection#selection_call
        // call brush.move and pass overviewX.range() as argument
        // https://github.com/d3/d3-brush#brush_move
        .call(brush.move, overviewX.range());

      // Reset button
      svg
        .append("foreignObject")
        .attr("id", "reset")
        .attr(
          "transform",
          "translate(10, " +
            (margin.top + pad + height + pad + ageAreaHeight + ageAreaBottomPad + overviewHeight) +
            ")"
        )
        .append("xhtml:body")
        .html("<button>Reset</button>");
    }
  };

  return <div className="Timeline" id={svgContainerId}></div>;
}
