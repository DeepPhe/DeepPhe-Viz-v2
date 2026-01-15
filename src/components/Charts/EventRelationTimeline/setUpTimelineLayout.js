import { GAPS, LEGEND, MARGINS, PADDING, LABEL, TOGGLE_BUTTON } from "./timelineConstants";

export function setupTimelineLayout(timelineSvg, svgWidth, totalContentHeight, zoom) {
  timelineSvg
    .append("defs")
    .append("rect")
    .attr("x", -LABEL.margin) //change this to labelWidth
    .attr("y", -PADDING.top)
    .attr("width", svgWidth + LABEL.margin + TOGGLE_BUTTON.margin)
    .attr("height", totalContentHeight + GAPS.legendToMain + PADDING.top);

  // .append("clipPath")
  // .attr("id", "secondary_area_clip")

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

  const main_ER_svg = timelineSvg
    .append("g")
    .attr("class", "main_ER_svg")
    .attr(
      "transform",
      `translate(${MARGINS.left}, ${MARGINS.top + LEGEND.height + GAPS.legendToMain})`
    )
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

  return { main_ER_svg, age_ER, axisLayer };
}
