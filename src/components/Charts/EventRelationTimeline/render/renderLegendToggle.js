export function renderLegendToggle({ parent, width, initialState = false, onToggle }) {
  let state = initialState;

  const group = parent
    .append("g")
    .attr("class", "filter-toggle-group")
    .style("pointer-events", "all");

  // Label
  group
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "12px")
    .text("Showing:");

  // Foreign object to embed HTML <select> in SVG
  const foreignObj = group
    .append("foreignObject")
    .attr("x", 55)
    .attr("y", 2)
    .attr("width", 165)
    .attr("height", 24);

  const dropdown = foreignObj
    .append("select")
    .style("width", "100%")
    .style("height", "100%")
    .style("font-size", "12px")
    .style("cursor", "pointer")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px");

  dropdown.append("option").attr("value", "all").text("All Patient Events");
  dropdown.append("option").attr("value", "filtered").text("Filtered Patient Events");

  function render() {
    dropdown.property("value", state ? "filtered" : "all");
  }

  function reposition(newWidth) {
    group.attr("transform", `translate(${newWidth - 230}, 0)`);
  }

  dropdown.on("change", function () {
    state = this.value === "filtered";
    onToggle?.(state);
  });

  // Initial render
  render();
  reposition(width);

  return {
    update(newState) {
      state = newState;
      render();
    },
    reposition,
  };
}
