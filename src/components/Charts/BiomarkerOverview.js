import * as d3 from "d3";
import React from "react";

export default class BiomarkerOverview extends React.Component {
  state = {
    loading: true,

    biomarkerData: null,
    width: 0,
    height: 0,
  };

  reset = () => {
    const that = this;
    const fetchData = async () => {
      const patientIds = that.props.patientsAndStagesInfo.patients.map(
        (patient) => patient.patientId
      );
      return new Promise(function (resolve, reject) {
        fetch("http://localhost:3001/api/biomarkers/" + patientIds.join("+")).then(function (
          response
        ) {
          if (response) {
            resolve(response);
          } else {
            reject("User not logged in");
          }
        });
      });
    };

    fetchData().then(function (response) {
      response.json().then(function (json) {
        that.setState({ biomarkerData: json });
        that.setState({ loading: false });
        that.updateDimensions();
      });
    });
  };
  updateDimensions = () => {
    const newWidth = document.getElementById("biomarkers").clientWidth;
    this.setState({ width: newWidth, height: 350 });
    let it = d3.select(".biomarkers_overview_chart");
    // it._groups[0][0].setAttribute("width", newWidth)
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.reset();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const externalUpdate =
      JSON.stringify(prevProps.patientsAndStagesInfo) !==
      JSON.stringify(this.props.patientsAndStagesInfo);
    const internalUpdate =
      JSON.stringify(prevState.biomarkerData) !== JSON.stringify(this.state.biomarkerData);
    const sizeChange = prevState.width !== this.state.width;
    if ((internalUpdate || externalUpdate || sizeChange) && !this.state.loading) {
      this.show("biomarkers");
    }
  }

  show = (svgContainerId) => {
    if (!d3.select(".biomarkers_overview_chart").empty()) {
      d3.select(".biomarkers_overview_chart")._groups[0][0].remove();
    }
    const transitionDuration = 800; // time in ms
    const data = this.state.biomarkerData.biomarkersOverviewData;

    const svgWidth = Math.max(300, this.state.width);
    //console.log("width: " + this.state.width)
    const svgHeight = 120;
    const svgPadding = { top: 10, right: 15, bottom: 15, left: 180 };
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
    const chartTopMargin = 35;

    let yLables = [];
    data.forEach(function (obj) {
      yLables.push(obj.label);
    });

    // Band scale of biomarkers
    let y = d3
      .scaleBand()
      .domain(yLables)
      .range([0, chartHeight - chartTopMargin])
      .padding(0.2);

    // Percentage X
    let x = d3.scaleLinear().domain([0, 1]).range([0, chartWidth]);

    // https://github.com/d3/d3-format
    // keep one decimal in percentage, like 45.5%
    let formatPercentBarText = d3.format(".1%");

    // No decimal, like 45%
    let formatPercentAxisTick = d3.format(".0%");

    // Only draw everything for the first time
    if (d3.select(".biomarkers_overview_chart_group").empty()) {
      let svg = d3
        .select("#" + svgContainerId)
        .append("svg")
        .attr("class", "biomarkers_overview_chart") // Used for CSS styling
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      // Chart title
      svg
        .append("text")
        .attr("class", "biomarkers_chart_title")
        .attr("transform", function (d) {
          return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
        })
        .text("Biomarkers Overview");

      let biomarkersPatientsChartGrp = svg
        .append("g")
        .attr("class", "biomarkers_overview_chart_group")
        .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

      // Bars
      let barGrp = biomarkersPatientsChartGrp
        .selectAll(".biomarkers_overview_chart_bar_group")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "biomarkers_overview_chart_bar_group")
        .on("click", function (d) {
          alert("clicked!");
        });

      // Bar
      barGrp
        .append("rect")
        .attr("class", "biomarkers_overview_chart_bar")
        .attr("x", 0)
        .attr("y", function (d) {
          return y(d.label);
        })
        .attr("height", y.bandwidth())
        .transition()
        .duration(transitionDuration)
        .attr("width", function (d) {
          return x(d.count);
        });

      // Percentage text
      barGrp
        .append("text")
        .attr("id", function (d) {
          return d.label + "_" + d.status;
        })
        .attr("class", "biomarkers_overview_chart_bar_percentage")
        .attr("x", 5)
        .attr("y", function (d) {
          return y(d.label) + y.bandwidth() / 2;
        })
        .text(function (d) {
          return formatPercentBarText(d.count);
        });

      // Y axis
      biomarkersPatientsChartGrp
        .append("g")
        .attr("class", "biomarkers_overview_chart_y_axis")
        .call(d3.axisLeft(y));

      // X axis
      biomarkersPatientsChartGrp
        .append("g")
        .attr("class", "biomarkers_overview_chart_x_axis")
        .attr("transform", "translate(0," + (chartHeight - chartTopMargin) + ")")
        .call(d3.axisBottom(x).tickFormat(formatPercentAxisTick));
    } else {
      // Update the data
      let biomarkersPatientsGrp = d3
        .selectAll(".biomarkers_overview_chart_group")
        .selectAll(".biomarkers_overview_chart_bar_group")
        .data(data);

      // Update the bar width for each category
      biomarkersPatientsGrp
        .select(".biomarkers_overview_chart_bar")
        .transition()
        .duration(transitionDuration)
        .attr("width", function (d) {
          return x(d.count);
        });

      // Update the percentage text
      biomarkersPatientsGrp.select(".biomarkers_overview_chart_bar_percentage").text(function (d) {
        return formatPercentBarText(d.count);
      });
    }
  };

  render() {
    return <div id="biomarkers"></div>;
  }
}
