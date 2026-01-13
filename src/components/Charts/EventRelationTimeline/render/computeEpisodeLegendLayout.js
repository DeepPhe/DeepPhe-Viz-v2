/**
 * Compute x positions for each episode legend item.
 *
 * @param {Object} params
 * @param {d3.Selection} params.legendSvg - The legend SVG (needed to measure text)
 * @param {string[]} params.allRelations - Array of all unique relations
 * @param {number} params.arrowWidth - Width of the arrow icon
 * @param {number} params.arrowLabelGap - Gap between arrow and label
 * @param {number} params.labelPadding - Extra padding between legend items
 * @param {number} params.LEGENDAnchorX - Optional: starting x anchor (default: 0)
 * @returns {number[]} - Array of x positions for each legend item
 */
export function computeEpisodeLegendLayout({
  legendSvg,
  allRelations,
  arrowWidth,
  arrowLabelGap,
  labelPadding,
  LEGENDAnchorX = 0,
}) {
  const labelWidths = [];

  // Temporarily render text to measure widths
  const temp = legendSvg.append("g").attr("class", "tempTextMeasure");
  allRelations.forEach((d) => {
    const textEl = temp.append("text").text(d);
    labelWidths.push(textEl.node().getComputedTextLength());
  });
  temp.remove();

  // Compute x positions
  const episodeLegendX = [];
  let currentX = LEGENDAnchorX;
  labelWidths.forEach((width) => {
    episodeLegendX.push(currentX);
    currentX += arrowWidth + arrowLabelGap + width + labelPadding;
  });

  return episodeLegendX;
}
