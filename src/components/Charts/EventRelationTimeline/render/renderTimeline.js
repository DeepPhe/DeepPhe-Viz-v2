import {
  AGE_AREA,
  ARROW,
  GAPS,
  LANE,
  LEGEND,
  MARGINS,
  MARKER_TOGGLE_MAP,
  OVERVIEW,
  TEXT,
  TIMELINE_PADDING_DAYS,
  TIMESPAN,
  PADDING,
  LABEL,
  TOGGLE_BUTTON,
} from "../timelineConstants";
import * as d3 from "d3";
import { createAllSvgs } from "./createAllSvgs";
import { renderEpisodeLegend } from "./renderEpisodeLegend";
import { computeEpisodeLegendLayout } from "./computeEpisodeLegendLayout";
import { setupTimelineLayout } from "../setUpTimelineLayout";

export function renderTimeline({
  svgContainerId,
  patientId,
  conceptIds,
  startRelation,
  startDate,
  endRelation,
  endDate,
  dpheGroup,
  laneGroup,
  dpheGroupCounts,
  laneGroupsCounts: timeSpanCounts,
  negated,
  concepts,
  toggleState,
  handleToggleClick,
  setClickedTerms,
  skipNextEffect,
  conceptsPerDocument,
  reportId,
}) {
  let verticalPositions = {};

  function mergeSpanData(existingSpan, i) {
    // Merge patient_ids
    if (!existingSpan.patient_id.includes(patientId[i])) {
      existingSpan.patient_id.push(patientId[i]);
    }
    // Merge other arrays
    if (!existingSpan.dpheGroup.includes(dpheGroup[i])) {
      existingSpan.dpheGroup.push(dpheGroup[i]);
    }
    if (!existingSpan.conceptIds.includes(conceptIds[i])) {
      existingSpan.conceptIds.push(conceptIds[i]);
    }
  }

  function createSpanData() {
    const spanMap = new Map(); // To track events by lane + start + end

    for (let i = 0; i < startDate.length; i++) {
      const key = `${laneGroup[i]}_${startDate[i]}_${endDate[i]}`;

      if (spanMap.has(key)) {
        // Merge with existing event
        const existingEvent = spanMap.get(key);
        mergeSpanData(existingEvent, i);
      } else {
        // Create new event entry
        spanMap.set(key, {
          start: startDate[i],
          end: endDate[i],
          patient_id: [patientId[i]], // Convert to array for merged events
          laneGroup: laneGroup[i],
          relation1: startRelation[i],
          relation2: endRelation[i],
          dpheGroup: [dpheGroup[i]],
          conceptIds: [conceptIds[i]],
          negated: negated[i],
        });
      }
    }
    return Array.from(spanMap.values());
  }

  function removeDuplicatesFromDpheAndLane() {
    // console.log("removingDuplicates");
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

  function getTotalTimeSpanCount(dictionary) {
    let count = 0;

    for (let key in dictionary) {
      count += dictionary[key];

      if (typeof verticalPositions[key] !== "undefined") {
        verticalPositions[key] = totalTimeSpanCount;
      }
    }

    return count;
  }

  // Get total time span count;
  let totalTimeSpanCount = getTotalTimeSpanCount(timeSpanCounts);

  const container = document.getElementById(svgContainerId);
  const containerWidth = container.offsetWidth;
  const svgWidth = containerWidth - MARGINS.left - 25; // TODO: replace 25 with a constant
  const spanData = createSpanData();

  // Convert string to date
  const minStartDate = new Date(d3.min(spanData, (d) => new Date(d.start)));
  const maxEndDate = new Date(d3.max(spanData, (d) => new Date(d.end)));

  const expandedState = {};
  const desiredOrder = ["Finding", "Disease", "Stage, Grade", "Treatment"];

  // Track expanded/collapsed state for each group
  desiredOrder.forEach((d) => (expandedState[d] = true));

  // Add padding
  minStartDate.setDate(minStartDate.getDate() - TIMELINE_PADDING_DAYS);
  maxEndDate.setDate(maxEndDate.getDate() + TIMELINE_PADDING_DAYS);

  // Create MainX for D3
  let mainX = d3.scaleTime().domain([minStartDate, maxEndDate]).range([0, svgWidth]);
  const allDates = new Set();

  // Populate allDates with start and end dates of each event
  spanData.forEach(function (d, i) {
    const startDate = new Date(d.start);
    const endDate = new Date(d.end);

    allDates.add(startDate.getTime());
    allDates.add(endDate.getTime());
    d.formattedStartDate = mainX(startDate);
    // console.log("formattedStartDate", d.formattedStartDate);
    d.formattedEndDate = mainX(endDate);
  });

  // Convert timestamps back to Date objects and sort
  const uniqueDates = Array.from(allDates)
    .map((timestamp) => new Date(timestamp))
    .sort((a, b) => a - b);

  function checkOverlapWithPadding(a, b, padding) {
    const aStart = a[0] - padding;
    const aEnd = a[1] + padding;
    const bStart = b[0] - padding;
    const bEnd = b[1] + padding;
    return Math.max(aStart, bStart) <= Math.min(aEnd, bEnd);
  }

  removeDuplicatesFromDpheAndLane();
  const allGroupLanes = [];

  const groupLaneCounts = {}; // e.g., { 'AC': 2, 'Taxol': 3, ... }
  desiredOrder.forEach((group) => {
    const groupLane = [];
    const spansInGroup = spanData.filter((d) => d.laneGroup === group);

    spansInGroup.forEach((d) => {
      const x1 = +d.formattedStartDate;
      const x2 = +d.formattedEndDate;
      let laneNumber = 0;

      while (laneNumber < spansInGroup.length) {
        if (!groupLane[laneNumber]) groupLane[laneNumber] = [];
        const hasOverlap = groupLane[laneNumber].some((lane) =>
          checkOverlapWithPadding([x1, x2], lane, TIMESPAN.padding)
        );
        if (!hasOverlap) {
          groupLane[laneNumber].push([x1, x2]);
          break;
        }
        laneNumber += 1;
      }
    });

    // Now store the number of rows
    groupLaneCounts[group] = groupLane.length;
    allGroupLanes.push(groupLane);
  });

  // Get the sum of grouplanecounts
  const totalGroupLaneCounts = Object.values(groupLaneCounts).reduce((acc, val) => acc + val, 0);
  // console.log(totalGroupLaneCounts);
  const totalGroupHeight = totalGroupLaneCounts * LANE.height;
  let overviewX = d3.scaleTime().domain([minStartDate, maxEndDate]).range([0, svgWidth]);

  let yGroupOffset = 0;
  const groupLayouts = [];

  // Compute group heights before setupTimelineLayout
  for (const key of desiredOrder) {
    // Filter spans that belong to this group
    const spansForGroup = spanData.filter((d) => d.laneGroup === key);
    console.log(spansForGroup);
    // Skip groups with no spans
    if (!spansForGroup.length) continue;
    const laneCount = getLaneCount(spansForGroup);
    console.log(laneCount);
    const groupHeight = laneCount * LANE.height;

    groupLayouts.push({
      key,
      spans: spansForGroup,
      height: groupHeight,
      yOffset: yGroupOffset,
    });
    yGroupOffset += groupHeight + LANE.GROUP_TOP_PADDING;
  }
  const totalContentHeight = yGroupOffset;

  // SVG
  let svgTotalHeight =
    MARGINS.top +
    LEGEND.height +
    GAPS.legendToMain +
    totalContentHeight +
    GAPS.pad +
    OVERVIEW.height +
    GAPS.pad +
    AGE_AREA.height +
    MARGINS.bottom;

  // Create SVGs
  const { legendSvg, timelineSvg } = createAllSvgs({
    containerId: svgContainerId,
    containerWidth,
    svgTotalHeight,
    LEGEND,
  });

  // Compute legend layout
  const allRelations = [...new Set([...startRelation, ...endRelation])];
  const episodeLegendX = computeEpisodeLegendLayout({
    legendSvg,
    allRelations,
    arrowWidth: ARROW.width,
    arrowLabelGap: ARROW.LabelGap,
    labelPadding: ARROW.labelPadding,
    LEGENDAnchorXAndSpacing: LEGEND.anchorX + LEGEND.spacing,
  });

  // Call renderEpisodeLegend using these positions
  renderEpisodeLegend({
    legendSvg,
    allRelations,
    episodeLegendX,
    containerWidth,
  });

  // Add toggle group to legendSvg
  // const toggleGroup = legendSvg
  //   .append("g")
  //   .attr("class", "filter-toggle-group")
  //   .attr("transform", `translate(${containerWidth - 40})`)
  //   .style("cursor", "pointer")
  //   .style("pointer-events", "all") // Ensure it can receive clicks
  //   .raise(); // Move to front
  //
  // // Label text
  // const toggleLabel = toggleGroup
  //   .append("text")
  //   .attr("x", -10)
  //   .attr("y", 15)
  //   .attr("alignment-baseline", "middle")
  //   .attr("text-anchor", "end")
  //   .attr("font-size", "12px")
  //   .text("Showing: All Patient Events");
  //
  // // Background (toggle track)
  // const toggleBg = toggleGroup
  //   .append("rect")
  //   .attr("class", "toggle-bg")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("width", 40)
  //   .attr("height", 20)
  //   .attr("rx", 10)
  //   .attr("ry", 10)
  //   .attr("fill", "#ccc");
  //
  // // Circle (toggle knob)
  // const knob = toggleGroup
  //   .append("circle")
  //   .attr("class", "toggle-knob")
  //   .attr("cx", 10)
  //   .attr("cy", 10)
  //   .attr("r", 8)
  //   .attr("fill", "white")
  //   .style("stroke", "#888");
  //
  // let localToggleState = toggleState; // Initialize with React state
  //
  // // Click → notify React
  // toggleGroup.on("click", () => {
  //   if (handleToggleClick) {
  //     handleToggleClick();
  //
  //     // Toggle the LOCAL state
  //     localToggleState = !localToggleState; // UPDATE the local state!
  //
  //     // Update visuals based on the NEW local state
  //     knob
  //       .transition()
  //       .duration(200)
  //       .attr("cx", localToggleState ? 30 : 10); // Use localToggleState, not isNowOn
  //
  //     toggleBg
  //       .transition()
  //       .duration(200)
  //       .attr("fill", localToggleState ? "#007bff" : "#ccc");
  //
  //     toggleLabel.text(
  //       localToggleState ? "Showing: Filtered Patient Events" : "Showing: All Patient Events"
  //     );
  //   }
  // });

  // After defining everything:
  // function updateTogglePosition() {
  //   const containerWidth = document.getElementById(svgContainerId).getBoundingClientRect().width;
  //   // Keep it 40px from the right edge and some padding from the top
  //   toggleGroup.attr("transform", `translate(${containerWidth - 40})`);
  // }

  // Call it initially
  // updateTogglePosition();

  let isUpdating = false; // Add this flag at the top level of renderTimeline

  // Function expression to handle mouse wheel zoom or drag on main area
  let zoomed = function (event) {
    if (isUpdating) {
      return;
    }
    if (event.sourceEvent && event.sourceEvent.type === "brush") return;

    isUpdating = true; // Set flag

    try {
      let transform = event.transform;

      // Rescale the main X-axis based on zoom transform
      let newDomain = transform.rescaleX(overviewX).domain();
      mainX.domain(newDomain);

      // Redraw all reports using new mainX scale
      updateMainReports();
      updateHeatmaps();
      updateDateAnchors();

      // Sync brush with zoom
      overview.select(".brush").call(brush.move, mainX.range().map(transform.invertX, transform));

      // Update custom brush handles (if selection exists)
      let selection = d3.brushSelection(overviewBrush.node());
      showAndMoveCustomBrushHandles(selection);
    } finally {
      isUpdating = false; // Reset flag
    }
  };
  // Zoom rect that covers the main area
  let zoom = d3
    .zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
      [0, 0],
      [svgWidth, totalContentHeight],
    ])
    .extent([
      [0, 0],
      [svgWidth, totalContentHeight],
    ])
    .on("zoom", zoomed);

  // make main_ER_svg and Age_ER (ER = event relation)
  const { main_ER_root, main_ER_ui, main_ER_data, axisLayer, age_ER } = setupTimelineLayout(
    timelineSvg,
    svgWidth,
    totalContentHeight,
    zoom
  );
  const caretPath = "M -4 -2.67 L 0 1.33 L 4 -2.67";
  const caretRight = "M 0 0 L 10 5 L 0 10"; // triangle pointing right
  const caretDown = "M 0 0 L 10 0 L 5 10 Z"; // triangle pointing down
  // Attach zoom ONCE
  // main_ER_svg.call(zoom);

  groupLayouts.forEach((layout, i) => {
    // isLastGroup is used to ensure divider line is not used after last group
    const isLastGroup = i === groupLayouts.length - 1;

    const groupG = drawCaretAndLabelForGroup(
      {
        ui: main_ER_ui,
        data: main_ER_data,
      },
      layout.spans,
      layout.key,
      layout.yOffset,
      layout.height,
      svgWidth,
      !isLastGroup
    );

    drawLanes(groupG, layout.spans, layout.key);
  });

  const xAxisTop = d3.axisTop(mainX).tickSizeInner(5).tickSizeOuter(0);
  const xAxisBottom = d3.axisBottom(mainX).tickSizeInner(5).tickSizeOuter(0);

  // Top axis
  axisLayer.append("g").attr("class", "main-ER-x-axis-top").call(xAxisTop);

  // Bottom axis
  axisLayer
    .append("g")
    .attr("class", "main-ER-x-axis-bottom")
    .attr("transform", `translate(0, ${totalContentHeight})`)
    .call(xAxisBottom);

  function drawCaretAndLabelForGroup(
    layers,
    spans,
    groupKey,
    yOffset,
    height,
    width,
    showDivider = true
  ) {
    const collapsedHeight = 10;

    const dataGroupG = layers.data
      .append("g")
      .attr("class", `group group-data group-${groupKey.replace(/\s+/g, "-")}`)
      .attr("data-expanded-height", height)
      .attr("data-collapsed-height", collapsedHeight)
      .attr("data-group-key", groupKey)
      .attr("transform", `translate(0, ${yOffset + LANE.GROUP_TOP_PADDING})`);

    const uiGroupG = layers.ui
      .append("g")
      .attr("class", `group group-ui group-${groupKey.replace(/\s+/g, "-")}`)
      .attr("data-group-key", groupKey)
      .attr("transform", `translate(0, ${yOffset + LANE.GROUP_TOP_PADDING})`);

    dataGroupG.append("g").attr("class", "heatmap").style("display", "none");

    const labelG = uiGroupG
      .append("g")
      .attr("class", "group-label")
      .attr("transform", `translate(${-TEXT.marginLeft}, ${height / 2 - 5})`);

    labelG
      .append("text")
      .attr("class", "report_type_label")
      .attr("dy", "0.35em")
      .text(`${groupKey} (${spans.length}):`);

    // ---------- TOGGLE ----------
    const toggleG = uiGroupG
      .append("g")
      .attr("class", "group-toggle")
      .attr("transform", `translate(${svgWidth + 10}, ${height / 2 - 5})`)
      .style("cursor", "pointer")
      .on("click", (event) => {
        event.stopPropagation();
        expandedState[groupKey] = !expandedState[groupKey];
        updateLayout(true, groupKey, spans);
      });

    // hit area
    toggleG.append("circle").attr("r", 10).attr("fill", "transparent");

    // caret
    toggleG
      .append("path")
      .attr("class", "toggle-icon")
      .attr("d", caretPath)
      .attr("transform", expandedState[groupKey] ? "rotate(0)" : "rotate(-90)")
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

    // Divider
    if (showDivider) {
      dataGroupG
        .append("line")
        .attr("class", "group-divider")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", height)
        .attr("y2", height)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
    }

    return {
      data: dataGroupG,
      ui: uiGroupG,
    };
  }

  function getLaneCount(spans, padding = 0) {
    const lanes = []; // array of arrays, each array = spans in that lane

    const expanded = expandedState[spans[0].laneGroup];

    if (!expanded) {
      return 1;
    }

    // Sort spans by start date
    spans.sort((a, b) => a.start - b.start);

    spans.forEach((span) => {
      let placed = false;

      for (let i = 0; i < lanes.length; i++) {
        // Check if spans overlaps anything in lane i
        if (
          !lanes[i].some((e) =>
            checkOverlapWithPadding(
              [e.formattedStartDate, e.formattedEndDate],
              [span.formattedStartDate, span.formattedEndDate],
              padding
            )
          )
        ) {
          span.laneIndex = i;
          lanes[i].push(span);
          placed = true;
          break;
        }
      }

      if (!placed) {
        // No lane found → create new lane
        span.laneIndex = lanes.length;
        lanes.push([span]);
      }
    });

    return lanes.length; // number of lanes in this group
  }

  // Mini overview
  let overview = timelineSvg
    .append("g")
    .attr("class", "overview")
    .attr(
      "transform",
      "translate(" +
        MARGINS.left +
        "," +
        (MARGINS.top +
          LEGEND.height +
          GAPS.legendToMain +
          totalContentHeight +
          GAPS.pad +
          AGE_AREA.height +
          AGE_AREA.bottomPad) +
        ")"
    );
  console.log("totalContentHeight", totalContentHeight);

  // Specify a specific region of an element to display, rather than showing the complete area
  // Any parts of the drawing that lie outside the region bounded by the currently active clipping path are not drawn.

  // Also call on resize
  // window.addEventListener("resize", updateTogglePosition);
  // PUT AT END OF RENDERTIMELINE IF NEEDED
  // return () => {
  //   window.removeEventListener("resize", updateTogglePosition);
  // };

  function updateMainReports() {
    // Re-bind data to existing groups
    const lanes = d3.select(".main_ER_data").selectAll(".contains-group");

    lanes.each(function (d) {
      const g = d3.select(this);

      const x1 = mainX(new Date(d.start));
      const x2 = mainX(new Date(d.end));

      // Update vertical lines
      g.selectAll('line[data-line-type="x1-only"]').attr("x1", x1).attr("x2", x1);

      g.selectAll('line[data-line-type="x2-only"]').attr("x1", x2).attr("x2", x2);

      // Update range lines
      g.selectAll('line[data-line-type="range"]').attr("x1", x1).attr("x2", x2);

      // Update markers
      g.selectAll('circle[data-marker-type="start"]').attr("cx", x1);
      g.selectAll('circle[data-marker-type="end"]').attr("cx", x2);

      // Update rects if present
      g.selectAll('rect[data-rect-type="before"]').attr("x", x1);
      g.selectAll('rect[data-rect-type="after"]').attr("x", x2);
    });

    d3.select(".main-ER-x-axis-bottom").call(xAxisBottom);
    d3.select(".main-ER-x-axis-top").call(xAxisTop);
  }

  // Function to calculate lane positions based on expanded state
  function calculateLanePositions() {
    let offset = 0;
    const positions = [];

    desiredOrder.forEach((d) => {
      const isExpanded = expandedState[d];
      const fullHeight = groupLaneCounts[d] * 10 * 2; // Hard coded values, should add constants for 10 and 2
      const collapsedHeight = 20; // Minimal height when collapsed
      const height = isExpanded ? fullHeight : collapsedHeight;

      positions.push({
        group: d,
        y: offset + (isExpanded ? groupLaneCounts[d] * 10 : 0), // Label position (middle if expanded)
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
  function createLaneHeatmap(laneGroup) {
    // Filter data for this lane group
    const laneData = spanData.filter((d) => d.laneGroup === laneGroup);
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

      // Increment bins
      for (let i = Math.max(0, startBin); i < Math.min(numBins - 1, endBin); i++) {
        bins[i]++;
      }
    });

    // Find max count for color scaling
    const maxCount = Math.max(...bins);

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

    return heatmapData;
  }

  function updateHeatmaps() {
    const laneGroups = [...new Set(spanData.map((d) => d.laneGroup))];

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
          const newHeatmapGroup = main_ER_data
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

  function updateLayout(animate = true, activeGroupKey = null, spans) {
    main_ER_data.selectAll("*").remove();
    main_ER_ui.selectAll("*").remove();
    axisLayer.selectAll(".main-ER-x-axis-bottom").remove();
    age_ER.selectAll("*").remove();
    // timelineSvg.selectAll(".zoom_ER").remove();
    const duration = animate ? 600 : 0;
    let yGroupOffset = 0;
    const updatedGroupLayout = [];

    // Compute group heights before setupTimelineLayout
    for (const key of desiredOrder) {
      // Filter spans that belong to this group
      const spansForGroup = spanData.filter((d) => d.laneGroup === key);
      console.log(spansForGroup);
      // Skip groups with no spans
      if (!spansForGroup.length) continue;
      const laneCount = getLaneCount(spansForGroup);
      console.log(laneCount);
      const groupHeight = laneCount * LANE.height;

      updatedGroupLayout.push({
        key,
        spans: spansForGroup,
        height: groupHeight,
        yOffset: yGroupOffset,
      });
      yGroupOffset += groupHeight + LANE.GROUP_TOP_PADDING;
    }
    const totalContentHeight = yGroupOffset;

    updatedGroupLayout.forEach((layout, i) => {
      // isLastGroup is used to ensure divider line is not used after last group
      const isLastGroup = i === updatedGroupLayout.length - 1;

      const groupG = drawCaretAndLabelForGroup(
        {
          ui: main_ER_ui,
          data: main_ER_data,
        },
        layout.spans,
        layout.key,
        layout.yOffset,
        layout.height,
        svgWidth,
        !isLastGroup
      );

      drawLanes(groupG, layout.spans, layout.key);
    });

    const newViewBoxHeight =
      MARGINS.top +
      LEGEND.height +
      GAPS.legendToMain +
      totalContentHeight +
      GAPS.pad +
      OVERVIEW.height +
      GAPS.pad +
      AGE_AREA.height +
      MARGINS.bottom;

    timelineSvg.attr("viewBox", `0 0 ${containerWidth} ${newViewBoxHeight}`);

    // Select zoom rect
    const zoomER = timelineSvg.select(".zoom_ER");
    if (!zoomER.empty()) {
      // 1. Resize zoom rect
      zoomER.attr("height", totalContentHeight).attr("width", svgWidth);

      // 2. Update zoom constraints
      zoom
        .translateExtent([
          [0, 0],
          [svgWidth, totalContentHeight],
        ])
        .extent([
          [0, 0],
          [svgWidth, totalContentHeight],
        ]);

      // 3. Re-apply current transform
      const t = d3.zoomTransform(zoomER.node());
      zoomER.call(zoom.transform, t);
    } else {
      console.warn("zoom_ER not found! Make sure it exists outside cleared groups.");
    }

    timelineSvg
      .select("#secondary_area_clip rect")
      .attr("x", 0) // no negative margin
      .attr("y", -PADDING.top)
      .attr("width", svgWidth) // only the data area
      .attr("height", totalContentHeight + GAPS.legendToMain + PADDING.top);

    const dateAnchorGroup = main_ER_data
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
      .attr("y2", totalContentHeight) // spans all lanes
      .style("stroke", "#d3d3d3") // light gray
      .style("stroke-width", 2)
      .style("stroke-dasharray", "3,3") // dashed line
      .style("opacity", 0.9)
      .style("pointer-events", "none");

    const ageERY = MARGINS.top + LEGEND.height + GAPS.legendToMain + totalContentHeight + GAPS.pad;

    age_ER.attr("transform", `translate(${MARGINS.left}, ${ageERY})`);

    age_ER
      .append("text")
      .attr("x", -TEXT.marginLeft)
      .attr("y", AGE_AREA.height / 2)
      .attr("dy", ".5ex")
      .attr("class", "age_label")
      .text("Patient Age");

    // Draw start + end ages
    age_ER
      .selectAll(".encounter_age")
      .data(encounterDates)
      .enter()
      .append("text")
      .attr("x", (d) => mainX(d))
      .attr("y", AGE_AREA.height / 2)
      .attr("dy", ".5ex")
      .attr("class", "encounter_age")
      .text((d, i) => encounterAges[i]);

    // Start + end guideline lines
    age_ER
      .selectAll(".encounter_age_guideline")
      .data(encounterDates)
      .enter()
      .append("line")
      .attr("x1", (d) => mainX(d))
      .attr("y1", 12)
      .attr("x2", (d) => mainX(d))
      .attr("y2", 25)
      .attr("class", "encounter_age_guideline");

    // const yearsSinceDiagnosis = interiorAges.map((a) => a - startAge);

    // Draw the “year since diagnosis” labels (1, 2, 3…)
    age_ER
      .selectAll(".years_since_label")
      .data(interiorDates)
      .enter()
      .append("text")
      .attr("x", (d) => mainX(d))
      .attr("y", AGE_AREA.height / 2) // below everything else
      .attr("class", "years_since_label")
      .text((d, i) => `Year ${yearsSinceDiagnosis[i]}`);

    // Draw guideline lines for intermediate ages
    age_ER
      .selectAll(".interior_age_guideline")
      .data(interiorDates)
      .enter()
      .append("line")
      .attr("x1", (d) => mainX(d))
      .attr("y1", 12)
      .attr("x2", (d) => mainX(d))
      .attr("y2", 25)
      .attr("class", "interior_age_guideline");

    axisLayer
      .append("g")
      .attr("class", "main-ER-x-axis-bottom")
      .attr("transform", `translate(0, ${totalContentHeight})`)
      .call(xAxisBottom);

    const overviewY =
      MARGINS.top +
      LEGEND.height +
      GAPS.legendToMain +
      totalContentHeight +
      GAPS.pad +
      AGE_AREA.height +
      AGE_AREA.bottomPad;

    overview.attr("transform", `translate(${MARGINS.left}, ${overviewY})`);
  }

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
    .style("stroke", "rgb(49, 163, 84)")
    .attr("stroke-width", 3)
    .attr("stroke-opacity", 0.75);

  const collapsedVerticalLineCap = defs
    .append("marker")
    .attr("id", "verticalLineCap")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", 6) // Center horizontally
    .attr("refY", 6) // Center vertically
    .attr("markerWidth", 2.5)
    .attr("markerHeight", 2.5)
    .attr("orient", "auto");

  collapsedVerticalLineCap
    .append("path")
    .attr("d", "M6 0 L6 12") // vertical line from top to bottom
    .style("stroke", "rgb(128, 128, 128)")
    .attr("stroke-width", 3)
    .attr("stroke-opacity", 0.3);

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
  const dateAnchorGroup = main_ER_data
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
    .attr("y2", totalContentHeight) // spans all lanes
    .style("stroke", "#d3d3d3") // light gray
    .style("stroke-width", 2)
    .style("stroke-dasharray", "3,3") // dashed line
    .style("opacity", 0.9)
    .style("pointer-events", "none"); // don't interfere with clicks

  // const occupiedLanes = new Map(); // Key: base Y, Value: array of [x1, x2] pairs

  function timeBetween(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);

    let diffMs = d2 - d1;

    const units = [
      { label: "year", ms: 1000 * 60 * 60 * 24 * 365 },
      { label: "month", ms: 1000 * 60 * 60 * 24 * 30 },
      { label: "day", ms: 1000 * 60 * 60 * 24 },
    ];

    const parts = [];

    for (const u of units) {
      if (diffMs >= u.ms) {
        const amount = Math.floor(diffMs / u.ms);
        diffMs -= amount * u.ms;
        parts.push(`${amount} ${u.label}${amount !== 1 ? "s" : ""}`);
      }
    }

    return parts.join(", ");
  }

  function drawTimeSpan({ group, d, x1, x2, markerStart, markerEnd, handleClick }) {
    // Handle arrays for display
    // console.log(d);
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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

    const tooltipText = `Duration: ${timeBetween(d.start, d.end)}\n${d.relation1}: ${d.start}\n${
      d.relation2
    }: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;

    group
      .append("line")
      .attr("class", "relation-outline")
      .attr("data-line-type", "range")
      .attr("x1", x1)
      .attr("y1", 0)
      .attr("x2", x2)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 7)
      .style("cursor", "pointer")
      .attr("stroke-opacity", 0);

    const mainLine = group
      .append("line")
      .attr("class", "main_report_ER relation-icon")
      .attr("data-concept-ids", d.conceptIds.join(","))
      .attr("data-line-type", "range")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", d.negated ? "rgb(255, 0, 0)" : "rgb(49, 163, 84)")
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

    // const tooltip = d3.select("#tooltip");

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

  function drawHeatSpan({ group, d, x1, x2, markerStart, markerEnd, handleClick }) {
    // Handle arrays for display
    // console.log(d);
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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

    const tooltipText = `Duration: ${timeBetween(d.start, d.end)}\n${d.relation1}: ${d.start}\n${
      d.relation2
    }: ${d.end}\nConcept Name: ${conceptNamesDisplay}\n`;

    group
      .append("line")
      .attr("class", "relation-outline")
      .attr("data-line-type", "range")
      .attr("x1", x1)
      .attr("y1", 0)
      .attr("x2", x2)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 7)
      .style("cursor", "pointer")
      .attr("stroke-opacity", 0);

    const mainLine = group
      .append("line")
      .attr("class", "main_report_ER relation-icon")
      .attr("data-concept-ids", d.conceptIds.join(","))
      .attr("data-line-type", "range")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "rgb(128, 128, 128)")
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 0.3)
      .style("cursor", "pointer")
      .on("click", (event) => handleClick(event, d));
    if (markerStart) {
      mainLine.attr("marker-start", markerStart);
    }
    if (markerEnd) {
      mainLine.attr("marker-end", markerEnd);
    }
    mainLine.append("title").text(tooltipText);
  }

  function drawHeatOn({ group, d, x, lineType, handleClick }) {
    // Handle arrays for display
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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
      .attr("data-concept-ids", d.conceptIds.join(","))
      .attr("data-line-type", lineType)
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", -6) // Extends above
      .attr("y2", 6) // Extends below
      .attr("stroke", "rgb(128, 128, 128)")
      .attr("stroke-width", 4)
      .attr("stroke-opacity", 0.75)
      .style("cursor", "pointer")
      .on("click", (event) => {
        handleClick(event, d);
      })
      .append("title")
      .text(tooltipText);
  }

  function drawSoloAfterRelation({ group, d, x, handleClick }) {
    // Handle arrays for display
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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
      .attr("data-concept-ids", d.conceptIds.join(","))
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
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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
      .attr("data-concept-ids", d.conceptIds.join(","))
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
    const conceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
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
      .attr("data-concept-ids", d.conceptIds.join(","))
      .attr("data-line-type", lineType)
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", -6) // Extends above
      .attr("y2", 6) // Extends below
      .attr("stroke", "rgb(49, 163, 84)")
      .attr("stroke-width", 4)
      .attr("stroke-opacity", 0.75)
      .style("cursor", "pointer")
      .on("click", (event) => {
        handleClick(event, d);
      })
      .append("title")
      .text(tooltipText);
  }

  function drawLanes(groupG, spans, groupKey) {
    // Group events by lane index
    const spansByLane = d3.group(spans, (d) => d.laneIndex);
    const expanded = expandedState[groupKey];
    const groupDataG = groupG.data;

    for (const [laneIndex, spansInLane] of spansByLane) {
      const laneG = groupDataG
        .append("g")
        .attr("class", "lane")
        .attr("transform", `translate(0, ${!expanded ? 0 : laneIndex * LANE.height})`);

      // Draw all timespans in this lane
      spansInLane.forEach((d) => {
        const x1 = d.formattedStartDate;
        const x2 = d.formattedEndDate;

        const containsGroup = laneG.append("g").attr("class", "contains-group").datum(d);

        if (!expanded) {
          if (d.relation1 === "On" && d.relation2 === "On") {
            if (d.formattedStartDate === d.formattedEndDate) {
              drawHeatOn({
                group: containsGroup,
                d,
                x: x1,
                lineType: "x1-only",
                handleClick,
              });
            } else {
              drawTimeSpan({
                group: containsGroup,
                d,
                x1,
                x2,
                markerStart: "url(#verticalLineCap)",
                markerEnd: "url(#verticalLineCap)",
                handleClick,
              });
            }
          } else if (d.relation1 === "Overlaps" && d.relation2 === "On") {
            drawHeatSpan({
              group: containsGroup,
              d,
              x1,
              x2,
              markerEnd: "url(#collapsedVerticalLineCap)",
              handleClick,
            });
          } else if (d.relation1 === "On" && d.relation2 === "Overlaps") {
            drawHeatSpan({
              group: containsGroup,
              d,
              x1,
              x2,
              markerStart: "url(#collapsedVerticalLineCap)",
              handleClick,
            });
          } else {
            // catch-all for anything else
            drawHeatSpan({
              group: containsGroup,
              d,
              x1,
              x2,
              handleClick,
            });
          }

          return;
        }

        if (d.relation1 === "After" && d.relation2 === "After") {
          //   >
          drawTimeSpan({
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
          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            markerStart: "url(#rightArrow)",
            handleClick,
          });
          // TODO: ADD A rightArrowLeft option >----- in defs
        }
        // TODO: NO AFTER , ON to test on
        if (d.relation1 === "After" && d.relation2 === "On") {
          // >---|
          drawTimeSpan({
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
            drawTimeSpan({
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
          drawTimeSpan({
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
          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            markerStart: "url(#verticalLineCap)",
            handleClick,
          });
        }
        if (d.relation1 === "After" && d.relation2 === "Before") {
          // >---<

          drawTimeSpan({
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
          drawTimeSpan({
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
          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            markerStart: "url(#leftArrow)",
            handleClick,
          });
        }
        if (d.relation1 === "Overlaps" && d.relation2 === "Before") {
          // --------<
          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            markerEnd: "url(#leftArrow)",
            handleClick,
          });
        }
        if (d.relation1 === "Overlaps" && d.relation2 === "On") {
          // -----|

          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            markerEnd: "url(#verticalLineCap)",
            handleClick,
          });
        }
        if (d.relation1 === "Overlaps" && d.relation2 === "Overlaps") {
          // ------
          drawTimeSpan({
            group: containsGroup,
            d,
            x1,
            x2,
            handleClick,
          });
        }
      });
    }
  }

  function handleClick(event, d) {
    const clickedConceptIds = Array.isArray(d.conceptIds) ? d.conceptIds : [d.conceptIds];
    // console.log("handleClick called during render!", event, d);
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

    // 1. Find all elements that should toggle
    const toToggle = new Set();

    // Emphasize matching relations
    clickedConceptIds.forEach((id) => {
      document.querySelectorAll(".relation-icon").forEach((el) => {
        const ids = el.dataset.conceptIds
          ? el.dataset.conceptIds.split(",").map((s) => s.trim())
          : [];

        if (clickedConceptIds.some((id) => ids.includes(id))) {
          toToggle.add(el);
        }
        // console.log(toToggle);
      });

      // 2. Toggle each element exactly once
      toToggle.forEach((el) => {
        skipNextEffect.current = true;

        // marker toggle
        ["marker-start", "marker-end"].forEach((attr) => {
          if (el.hasAttribute(attr)) {
            const currentMarker = el.getAttribute(attr);
            if (MARKER_TOGGLE_MAP[currentMarker]) {
              el.setAttribute(attr, MARKER_TOGGLE_MAP[currentMarker]);
            }
          }
        });

        // class toggle
        el.classList.toggle("selected");
        el.classList.toggle("unselected");

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
          existingRing.remove();
          return;
        }

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

  // Encounter ages label
  age_ER
    .append("text")
    .attr("x", -TEXT.marginLeft)
    .attr("y", AGE_AREA.height / 2)
    .attr("dy", ".5ex")
    .attr("class", "age_label")
    .text("Patient Age");

  // Start and end dates (date objects)
  let encounterDates = [minStartDate, maxEndDate];

  // Start and end ages (numbers) — replace with dynamic calculation when ready
  let encounterAges = [53, 56];
  let startAge = encounterAges[0];
  let endAge = encounterAges[1];

  // Draw start + end ages
  age_ER
    .selectAll(".encounter_age")
    .data(encounterDates)
    .enter()
    .append("text")
    .attr("x", (d) => mainX(d))
    .attr("y", AGE_AREA.height / 2)
    .attr("dy", ".5ex")
    .attr("class", "encounter_age")
    .text((d, i) => encounterAges[i]);

  // Start + end guideline lines
  age_ER
    .selectAll(".encounter_age_guideline")
    .data(encounterDates)
    .enter()
    .append("line")
    .attr("x1", (d) => mainX(d))
    .attr("y1", 12)
    .attr("x2", (d) => mainX(d))
    .attr("y2", 25)
    .attr("class", "encounter_age_guideline");

  // Compute interior ages (full years between startAge and endAge)
  const interiorAges = d3.range(startAge + 1, endAge);
  // Example: [54, 55]

  // Convert those ages to actual Date positions
  function ageToDate(age, startAge, startDate) {
    const diffYears = age - startAge;
    const d = new Date(startDate);
    d.setFullYear(d.getFullYear() + diffYears);
    return d;
  }

  const interiorDates = interiorAges.map((a) => ageToDate(a, startAge, minStartDate));

  // Draw guideline lines for intermediate ages
  age_ER
    .selectAll(".interior_age_guideline")
    .data(interiorDates)
    .enter()
    .append("line")
    .attr("x1", (d) => mainX(d))
    .attr("y1", 12)
    .attr("x2", (d) => mainX(d))
    .attr("y2", 25)
    .attr("class", "interior_age_guideline");

  // Compute "years since diagnosis" numbers
  // e.g. if startAge = 53 → [1, 2] for ages [54, 55]
  const yearsSinceDiagnosis = interiorAges.map((a) => a - startAge);

  // Draw the “year since diagnosis” labels (1, 2, 3…)
  age_ER
    .selectAll(".years_since_label")
    .data(interiorDates)
    .enter()
    .append("text")
    .attr("x", (d) => mainX(d))
    .attr("y", AGE_AREA.height / 2) // below everything else
    .attr("class", "years_since_label")
    .text((d, i) => `Year ${yearsSinceDiagnosis[i]}`);

  let overViewScrollerHeight = OVERVIEW.height;

  // Overview label text
  overview
    .append("text")
    .attr("x", -TEXT.marginLeft)
    .attr("y", overViewScrollerHeight) // Relative to the overview area
    .attr("dy", ".5ex")
    .attr("class", "overview_label")
    .text("Date");

  // Overview x axis
  let overviewXAxis = d3.axisBottom(overviewX).tickSizeInner(5).tickSizeOuter(0);
  // Abbreviated month format
  // .tickFormat(d3.timeFormat("%b"));

  // Append x axis to the bottom of overview area
  overview
    .append("g")
    .attr("class", "overview-x-axis")
    .attr("transform", "translate(0, " + OVERVIEW.height + ")")
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
  let brushed = function (event) {
    // Ignore brush triggered by zooming
    if (event.sourceEvent && event.sourceEvent.type === "zoom") return;

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
    timelineSvg
      .select(".zoom_ER")
      .call(
        zoom.transform,
        d3.zoomIdentity.scale(svgWidth / (selection[1] - selection[0])).translate(-selection[0], 0)
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

    .call(brush.move, overviewX.range());
}
