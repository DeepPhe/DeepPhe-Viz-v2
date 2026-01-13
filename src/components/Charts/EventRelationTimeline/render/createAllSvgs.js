import * as d3 from "d3";
/**
 * Create and append the legend SVG and main timeline SVG.
 *
 * @param {Object} params
 * @param {string} params.containerId - The HTML container ID
 * @param {number} params.containerWidth - Width of the SVG
 * @param {number} params.svgTotalHeight - Total height for the timeline SVG
 * @param {Object} params.LEGEND - Legend constants
 * @returns {Object} - { legendSvg, svg }
 */
export function createAllSvgs({ containerId, containerWidth, svgTotalHeight, LEGEND }) {
  // Append the legend SVG
  const container = d3.select("#" + containerId);
  const legendSvg = container
    .append("svg")
    .attr("class", "legend_svg")
    .attr("width", containerWidth)
    .attr("height", LEGEND.height)
    .style("display", "block");

  // Append the main timeline SVG
  const timelineSvg = container
    .append("svg")
    .attr("class", "timeline_svg")
    .attr("viewBox", `0 0 ${containerWidth} ${svgTotalHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  return { legendSvg, timelineSvg };
}
