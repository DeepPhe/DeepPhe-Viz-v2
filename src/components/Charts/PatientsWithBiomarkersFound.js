import * as d3 from "d3";
import React from "react";

export default class PatientsWithBiomarkersFound extends React.Component {
  state = {
    loading: true,
    biomarkerData: null,
    width: 0,
    height: 0,
  };

  reset = async () => {
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

    await fetchData().then(function (response) {
      response.json().then(function (json) {
        that.setState({
          biomarkerData: json,
        });
        that.setState({ loading: false });
        that.show("patients_with_biomarkers");
        that.updateDimensions();
      });
    });
  };

  updateDimensions = () => {
    const newWidth = document.getElementById("patients_with_biomarkers").clientWidth;
    this.setState({ width: newWidth, height: 350 });
  };

  componentDidMount() {
    this.reset();
    window.addEventListener("resize", this.updateDimensions);
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
      this.show("patients_with_biomarkers");
    }
  }

  show = (svgContainerId) => {
    if (!d3.select(".biomarkers_chart").empty()) {
      d3.select(".biomarkers_chart")._groups[0][0].remove();
    }
    const transitionDuration = 800;
    const data = this.state.biomarkerData.patientsWithBiomarkersData;

    const svgWidth = Math.max(300, this.state.width);
    const svgHeight = 180;
    const svgPadding = { top: 10, right: 10, bottom: 15, left: 0 };
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
    const chartTopMargin = 35;
    const legendGroupWidth = 65;
    const legendRectSize = 10;
    const legnedTextRectPad = 3;

    // Band scale of biomarkers
    let y = d3
      .scaleBand()
      .domain(data.biomarkersPool)
      .range([0, chartHeight - chartTopMargin])
      .padding(0.2);

    // Percentage X
    let x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, chartWidth - legendGroupWidth]);

    // Colors of status: positive, negative, unknown
    let color = d3
      .scaleOrdinal()
      .range(["rgb(214, 39, 40)", "rgb(44, 160, 44)", "rgb(150, 150, 150)"]);

    // https://github.com/d3/d3-format
    // keep one decimal in percentage, like 45.5%
    let formatPercentBarText = d3.format(".1%");

    // No decimal, like 45%
    let formatPercentAxisTick = d3.format(".0%");

    // Create the stack data structure
    // https://github.com/d3/d3-shape/blob/master/README.md#stack
    var stack = d3
      .stack()
      .keys(data.biomarkerStatus)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    var stackData = stack(data.data);

    // Only draw everything for the first time
    if (d3.select(".biomarkers_chart_group").empty()) {
      let svg = d3
        .select("#" + svgContainerId)
        .append("svg")
        .attr("class", "biomarkers_chart") // Used for CSS styling
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      let biomarkersChartGrp = svg
        .append("g")
        .attr("class", "biomarkers_chart_group")
        .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

      // Chart title
      svg
        .append("text")
        .attr("class", "biomarkers_chart_title")
        .attr("transform", function (d) {
          return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
        })
        .text("Patients With Biomarkers Found");

      let biomarkerStatusGrp = biomarkersChartGrp
        .selectAll(".biomarker_status_group")
        .data(stackData)
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "biomarker_status_group " + d.key;
        })
        .attr("fill", function (d) {
          return color(d.key);
        });

      // Status bars inside each biomarker group
      const that = this;
      biomarkerStatusGrp
        .selectAll(".biomarker_status_bar")
        // here d is each object in the stackData array
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .on("click", function (event, d) {
          biomarkerStatusGrp
            .selectAll(".biomarker_status_bar")
            .classed("selected_biomarker_bar", false)
            .classed("non_selected_biomarker_bar", true);
          biomarkerStatusGrp
            .selectAll(".biomarker_status_percentage")
            .classed("selected_biomarker_text_color", false);
          d3.selectAll("#" + d.data.biomarker + "_" + d.status).classed(
            "selected_biomarker_text_color",
            true
          );
          event.currentTarget.classList.add("selected_biomarker_bar");

          let selectedPatients = that.state.biomarkerData.biomarkerStatsPerPatient.filter((f) => {
            let result = false;
            f.relationValueArray.forEach((a) => {
              if (a[0] === d.data.biomarker && a[1] === d.status) result = true;
            });
            return result;
          });

          // console.log(that.state.patients)

          let stagesInfoCopy = JSON.parse(
            JSON.stringify(that.props.patientsAndStagesInfo.stagesInfo)
          );
          for (let i = stagesInfoCopy.length - 1; i >= 0; i--) {
            let stagesInfo = stagesInfoCopy[i];
            for (let j = stagesInfo.patients.length - 1; j >= 0; j--) {
              // if (!selectedStages.includes(stage.stage) ||
              if (
                !selectedPatients.map((p) => p.patientId).includes(stagesInfo.patients[j].patientId)
              ) {
                stagesInfo.patients.splice(j, 1);
                stagesInfo.ages.splice(j, 1);
                stagesInfo.patientsCount -= 1;
              }
            }
          }

          that.props.patientsAndStagesInfoSetter({
            patients: that.props.patientsAndStagesInfo.patients.filter((p) => {
              return selectedPatients
                .map((sp) => sp.patientId)
                .flat()
                .includes(p.patientId);
            }),
            stagesInfo: stagesInfoCopy,
          });

          // console.log("Patients to show: ")
          // console.log(selectedPatients);
        })
        .attr("class", "biomarker_status_bar")
        .attr("x", function (d) {
          return x(d[0]);
        })
        .attr("y", function (d) {
          return y(d.data.biomarker);
        })
        .attr("height", y.bandwidth())
        .transition()
        .duration(transitionDuration)
        .attr("width", function (d) {
          // Return the absolute value to avoid errors due to negative value
          return Math.abs(x(d[1]) - x(d[0]));
        });

      // Append the percentage text
      biomarkerStatusGrp
        .selectAll(".biomarker_status_percentage")
        // here d is each object in the stackData array
        .data(function (d) {
          // Add status property to make it available in the text()
          d.forEach(function (item) {
            item.status = d.key;
          });

          return d;
        })
        .enter()
        .append("text")
        .attr("id", function (d) {
          return d.data.biomarker + "_" + d.status;
        })
        .attr("class", "biomarker_status_percentage")
        .attr("x", function (d) {
          return x(d[0]) + 5; // Add 5px margin to left
        })
        .attr("y", function (d) {
          return y(d.data.biomarker) + y.bandwidth() / 2;
        })
        .text(function (d) {
          // Only show percentage text for values bigger than 10%
          if (d.data[d.status] > 0.1) {
            return d.data.biomarker + formatPercentBarText(d.data[d.status]);
          }
        });

      // Y axis
      biomarkersChartGrp
        .append("g")
        .attr("class", "biomarkers_chart_y_axis")
        .call(d3.axisLeft(y))
        // Now modify the label text to add patients count
        .selectAll("text")
        .text(function (d) {
          if (d === "has_ER_Status") {
            return "ER";
          } else if (d === "has_PR_Status") {
            return "PR";
          } else if (d === "has_HER2_Status") {
            return "HER2/Neu";
          } else {
            return d.replace("_", " ");
          }
        });

      // X axis
      biomarkersChartGrp
        .append("g")
        .attr("class", "biomarkers_chart_x_axis")
        .attr("transform", "translate(0," + (chartHeight - chartTopMargin) + ")")
        .call(d3.axisBottom(x).tickFormat(formatPercentAxisTick));

      // Status legend
      let legend = biomarkersChartGrp
        .append("g")
        .attr("class", "biomarkers_chart_legend")
        .selectAll("g")
        .data(data.biomarkerStatus)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
          return "translate(0," + i * (legendRectSize + legnedTextRectPad) + ")";
        });

      legend
        .append("rect")
        .attr("class", "biomarker_status_legend")
        .attr("x", chartWidth - legendRectSize)
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("fill", function (d) {
          return color(d);
        })
        .attr("stroke", function (d) {
          return color(d);
        });

      legend
        .append("text")
        .attr("class", "biomarker_status_legend_text")
        .attr("x", chartWidth - legendRectSize - legnedTextRectPad)
        .attr("y", 9)
        .text(function (d) {
          // Capitalized
          return d.charAt(0).toUpperCase() + d.slice(1);
        });
    } else {
      // Update the data
      let biomarkerStatusGrp = d3
        .selectAll(".biomarkers_chart_group")
        .selectAll(".biomarker_status_group")
        .data(stackData);

      // Update the status bars position and width
      biomarkerStatusGrp
        .selectAll(".biomarker_status_bar")
        // here d is each object in the stackData array
        .data(function (d) {
          return d;
        })
        .attr("x", function (d) {
          return x(d[0]);
        })
        .transition()
        .duration(transitionDuration)
        .attr("width", function (d, i) {
          // Return the absolute value to avoid errors due to negative value
          // during transitioning from one stage to another stage
          return Math.abs(x(d[1]) - x(d[0]));
        });

      // Update the percentage text and x position
      biomarkerStatusGrp
        .selectAll(".biomarker_status_percentage")
        // here d is each object in the stackData array
        .data(function (d) {
          // Add status property to make it available in the text()
          d.forEach(function (item) {
            item.status = d.key;
          });

          return d;
        })
        .attr("x", function (d) {
          return x(d[0]) + 5;
        })
        .text(function (d) {
          // Only show percentage text for values bigger than 10%
          if (d.data[d.status] > 0.1) {
            return formatPercentBarText(d.data[d.status]);
          }
        });
    }
  };

  render() {
    return <div id="patients_with_biomarkers"></div>;
  }
}
