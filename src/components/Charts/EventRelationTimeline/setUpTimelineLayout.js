import { GAPS, LEGEND, MARGINS, PADDING } from "./timelineConstants";

export function setupTimelineLayout(timelineSvg, svgWidth, totalContentHeight, zoom) {
  timelineSvg
    .append("defs")
    .append("clipPath")
    .attr("id", "secondary_area_clip")
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
