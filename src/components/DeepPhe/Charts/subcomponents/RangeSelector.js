import $ from "jquery";
import * as d3 from "d3v4";
import FilterComponent from "./FilterComponent";

class RangeSelector extends FilterComponent {
  state: any = {
    definition: this.props.definition,
    updated: false,
  };

  constructor(props) {
    super(props);
    this.state.definition = props.definition;
  }

  addCountsToCategory = () => {
    let total = 0;
    let fieldName = this.state.definition.fieldName;
    this.state.definition.globalPatientCountsForCategories.forEach((item) => {
      total += item.count;
    });
    this.state.definition.globalPatientCountsForCategories.forEach((item) => {
      this.addCountToCategory(fieldName, item.category, item.count, total);
    });
  };
  addCountToCategory = (fieldName, category, catCount, totalCount) => {
    let search = $("#" + fieldName + "-overlay-row span")
      .filter(function () {
        const that = $(this);

        return (
          $(this).text().toLowerCase().indexOf(category.toLowerCase()) >= 0 &&
          that.text().length === category.length
        );
      })
      .first();

    const cssId =
      fieldName.replaceAll(" ", "-").toLowerCase() + category.replaceAll(" ", "-").toLowerCase();
    const cssIdWithHash = "#" + cssId;

    $(cssIdWithHash).remove();
    search.append("<svg id='" + cssId + "' height=29 width=20 />");
    let svg = d3.select(cssIdWithHash);
    svg
      .style("position", "absolute")
      .style("top", "-8px")
      .style("left", "0px")
      .style("fill-opacity", "0.5");
    let catPercent = catCount / totalCount;

    let y = 29 - 29 * catPercent;

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", y)
      .attr("width", search.width())
      .attr("height", catPercent * 29)
      //.attr('stroke', 'black')
      .attr("fill", "blue");
  };
}

export default RangeSelector;
