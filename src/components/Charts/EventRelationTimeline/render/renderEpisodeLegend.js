import { MARGINS, LEGEND } from "../timelineConstants";
import * as d3 from "d3";
/**
 * Renders the episode legend on a given legendSvg
 * @param {Object} params
 * @param {d3.Selection} params.legendSvg - The D3 selection of the legend SVG
 * @param {Array<string>} params.allRelations - List of relation labels (e.g., ["On", "Before"])
 * @param {Array<number>} params.episodeLegendX - Precomputed x positions for each legend item
 * @param {number} params.arrowWidth
 * @param {number} params.arrowLabelGap
 * @param {number} params.labelPadding
 * @param {Function} [params.onClick] - Optional click handler for legend items
 */
export function renderEpisodeLegend({
  legendSvg,
  allRelations,
  episodeLegendX,
  arrowWidth = 20,
  arrowLabelGap = 5,
  labelPadding = 10,
  onClick = null,
}) {
  // Clean previous legend if it exists
  legendSvg.selectAll("*").remove();

  // Add "Event Occurrence:" label
  legendSvg
    .append("text")
    .attr("x", 10)
    .attr("y", MARGINS.top + LEGEND.anchorY)
    .attr("dy", ".5ex")
    .attr("class", "episode_legend_text")
    .attr("text-anchor", "start")
    .text("Event Occurrence:");

  // Add divider line under legend label
  legendSvg
    .append("line")
    .attr("x1", 10)
    .attr("y1", MARGINS.top + LEGEND.height)
    .attr("x2", 800) // adjust as needed or pass as param
    .attr("y2", MARGINS.top + LEGEND.height)
    .attr("class", "legend_group_divider");

  // Container for episode legend items
  const episodeLegendGrp = legendSvg
    .append("g")
    .attr("class", "episode_legend_group")
    .attr("transform", `translate(90, ${MARGINS.top})`);

  // Bind data
  const episodeLegend = episodeLegendGrp
    .selectAll(".episode_legend")
    .data(allRelations)
    .enter()
    .append("g")
    .attr("class", "episode_legend")
    .attr("transform", (d, i) => `translate(${episodeLegendX[i]}, 0)`);
  if (onClick) {
    episodeLegend.on("click", onClick);
  }

  // Arrow shapes
  episodeLegend
    .append("path")
    .attr("class", "episode_legend_arrow")
    .attr("d", (d) => {
      if (d === "On") return "M 6 0 L 6 12";
      if (d === "Before") return "M 12 0 L 0 6 L 12 12";
      if (d === "Overlaps") return "M 0 6 L 12 6";
      if (d === "After") return "M 0 0 L 12 6 L 0 12";
      return "M 0 0 L 12 6 L 0 12";
    })
    .attr("transform", "translate(0,0)")
    .style("fill", "rgb(49, 163, 84)")
    .style("stroke", "rgb(49, 163, 84)")
    .style("stroke-width", (d) => (d === "Overlaps" ? 4 : 2));

  // Text labels
  episodeLegend
    .append("text")
    .attr("x", arrowWidth + arrowLabelGap)
    .attr("y", 10)
    .attr("alignment-baseline", "middle")
    .attr("class", "episode_legend_text")
    .text((d) => d)
    .each(function (d) {
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
}
