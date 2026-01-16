import { GAPS, LEGEND, MARGINS, PADDING, LABEL, TOGGLE_BUTTON } from "./timelineConstants";

export function setupTimelineLayout(timelineSvg, svgWidth, totalContentHeight, zoom) {
  const defs = timelineSvg.append("defs");

  defs
    .append("clipPath")
    .attr("id", "secondary_area_clip")
    .attr("clipPathUnits", "userSpaceOnUse")
    .append("rect")
    .attr("x", 0)
    .attr("y", -PADDING.top)
    .attr("width", svgWidth)
    .attr("height", totalContentHeight + GAPS.legendToMain + PADDING.top);

  timelineSvg
    .append("rect")
    .attr("class", "zoom_ER")
    .attr("width", svgWidth)
    .attr("height", totalContentHeight + GAPS.legendToMain)
    .attr("transform", `translate(${MARGINS.left}, ${MARGINS.top + LEGEND.height})`)
    .call(zoom);

  // Axis layer (NOT clipped)
  const axisLayer = timelineSvg
    .append("g")
    .attr("class", "axis-layer")
    .attr(
      "transform",
      `translate(${MARGINS.left}, ${MARGINS.top + LEGEND.height + GAPS.legendToMain})`
    );

  const main_ER_root = timelineSvg
    .append("g")
    .attr("class", "main_ER_root")
    .attr(
      "transform",
      `translate(${MARGINS.left}, ${MARGINS.top + LEGEND.height + GAPS.legendToMain})`
    );

  // UI layer (labels, toggles, headers)
  const main_ER_ui = main_ER_root.append("g").attr("class", "main_ER_ui");

  // Data layer (lanes, ranges, markers)
  const main_ER_data = main_ER_root
    .append("g")
    .attr("class", "main_ER_data")
    .attr("clip-path", "url(#secondary_area_clip)");

  const age_ER = timelineSvg
    .append("g")
    .attr("class", "age_ER")
    .attr(
      "transform",
      `translate(${MARGINS.left}, ${
        MARGINS.top + LEGEND.height + GAPS.legendToMain + totalContentHeight + GAPS.pad
      })`
    );

  return {
    main_ER_root,
    main_ER_ui,
    main_ER_data,
    axisLayer,
    age_ER,
  };
}
