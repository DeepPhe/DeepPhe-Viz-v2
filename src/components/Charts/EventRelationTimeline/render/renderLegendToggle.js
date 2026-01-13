export function renderLegendToggle({ parent, width, initialState = false, onToggle }) {
  let state = initialState;

  const group = parent
    .append("g")
    .attr("class", "filter-toggle-group")
    .style("cursor", "pointer")
    .style("pointer-events", "all");

  // Label
  const label = group
    .append("text")
    .attr("x", -10)
    .attr("y", 15)
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", "12px");

  // Background
  const bg = group
    .append("rect")
    .attr("class", "toggle-bg")
    .attr("width", 40)
    .attr("height", 20)
    .attr("rx", 10)
    .attr("ry", 10);

  // Knob
  const knob = group
    .append("circle")
    .attr("class", "toggle-knob")
    .attr("cy", 10)
    .attr("r", 8)
    .style("stroke", "#888");

  function render() {
    knob
      .transition()
      .duration(200)
      .attr("cx", state ? 30 : 10);

    bg.transition()
      .duration(200)
      .attr("fill", state ? "#007bff" : "#ccc");

    label.text(state ? "Showing: Filtered Patient Events" : "Showing: All Patient Events");
  }

  function reposition(newWidth) {
    group.attr("transform", `translate(${newWidth - 40}, 0)`);
  }

  group.on("click", () => {
    state = !state;
    render();
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
