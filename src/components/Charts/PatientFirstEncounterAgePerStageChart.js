import React from "react";
import * as d3 from "d3";
import * as Cohort from "../../cohort.js";

export default class PatientFirstEncounterAgePerStageChart extends React.Component {
  state = {
    loaded: false,
    width: 0,
    height: 0,
    minAge: 0,
    maxAge: 0,
  };

  updateDimensions = () => {
    this.setState({ width: document.getElementById("chart1").clientWidth, height: 350 });
  };

  showChart = (that) => {
    const id = this.props.docId;
    const data = JSON.parse(JSON.stringify(this.props.patientsAndStagesInfo.stagesInfo));

    let patientsCounts = {};
    // In order to get the minAge and maxAge
    let minAges = [];
    let maxAges = [];

    let selectedStages = [];
    this.props.patientsAndStagesInfo.patients.forEach((patient) => {
      if (patient.stages.length > 0) {
        if (patient.stages[0] === "Stage_2A") {
          selectedStages.push("Stage IIA");
        }
        if (patient.stages[0] === "Stage_1B") {
          selectedStages.push("Stage IB");
        }
        if (patient.stages[0] === "Stage_2B") {
          selectedStages.push("Stage IIB");
        }
        if (patient.stages[0] === "Stage_3A") {
          selectedStages.push("Stage IIIA");
        }
        if (patient.stages[0] === "Stage_3B") {
          selectedStages.push("Stage IIIB");
        }
        if (patient.stages[0] === "Stage_4A") {
          selectedStages.push("Stage IVA");
        }
        if (patient.stages[0] === "Stage_4A") {
          selectedStages.push("Stage IVB");
        }
      }
    });

    for (let i = data.length - 1; i >= 0; i--) {
      if (!selectedStages.includes(data[i].stage)) {
        data.splice(i, 1);
      }
    }
    const patientInStagesInfo = (patient) => {
      return that.props.patientsAndStagesInfo.stagesInfo
        .map((el) => el.patients.map((el2) => el2.patientId))
        .flat()
        .includes(patient.patientId);
    };

    const patientFirstEncounterInAgeRange = (patient) => {
      // console.log("1 " + patient.firstEncounterAge)
      // console.log("2 " + that.props.minAge)
      // console.log("3 " + that.props.maxAge)
      if (
        !(patient.firstEncounterAge >= that.state.minAge) &&
        patient.firstEncounterAge <= that.state.maxAge
      ) {
        console.log("wha");
      }
      return (
        patient.firstEncounterAge >= that.state.minAge &&
        patient.firstEncounterAge <= that.state.maxAge
      );
    };

    data.forEach(function (stagesInfo) {
      for (let i = stagesInfo.patients.length - 1; i >= 0; i--) {
        // if (!selectedStages.includes(stage.stage) ||
        if (!patientInStagesInfo(stagesInfo.patients[i])) {
          stagesInfo.patients.splice(i, 1);
          stagesInfo.ages.splice(i, 1);
          stagesInfo.patientsCount -= 1;
        }
      }
      if (stagesInfo.patients.length > 0) {
        if (selectedStages.includes(stagesInfo.stage)) {
          // Must sort the ages by asending order
          // By default, the sort method sorts elements alphabetically.
          // To sort numerically just add a new method which handles numeric sorts

          stagesInfo.ages.sort(function (a, b) {
            return a - b;
          });

          // Initialise stats object
          let ageStats = {
            minVal: Infinity,
            lowerWhisker: Infinity,
            q1Val: Infinity,
            medianVal: 0,
            q3Val: -Infinity,
            iqr: 0, // Interquartile range or IQR
            upperWhisker: -Infinity,
            maxVal: -Infinity,
          };

          // calculate statistics
          // stagesInfo.ages is already sorted array
          ageStats.minVal = stagesInfo.ages.toSorted().at();
          ageStats.q1Val = Math.round(d3.quantile(stagesInfo.ages, 0.25));
          ageStats.medianVal = Math.round(d3.quantile(stagesInfo.ages, 0.5));
          ageStats.q3Val = Math.round(d3.quantile(stagesInfo.ages, 0.75));
          ageStats.iqr = ageStats.q3Val - ageStats.q1Val;
          ageStats.maxVal = stagesInfo.ages.toReversed().at();

          // Add new property
          stagesInfo.ageStats = ageStats;

          // Add to patientsCounts object for later use (modify the Y label)
          if (typeof patientsCounts[stagesInfo.stage] === "undefined") {
            patientsCounts[stagesInfo.stage] = stagesInfo.patientsCount;
          }

          // Also kepp record of the min age and max age for rendering the x axis as well as
          // age range in the patients table
          minAges.push(ageStats.minVal);
          maxAges.push(ageStats.maxVal);
        }
      }
    });

    // Make the min and max age range global
    let minAge = Math.min.apply(null, minAges);
    let maxAge = Math.max.apply(null, maxAges);
    // set the dimensions and margins of the graph
    const svgWidth = that.state.width;
    const svgHeight = that.state.height;

    // svgPadding.top is used to position the chart title
    // svgPadding.left is the space for Y axis labels
    const svgPadding = { top: 10, right: 15, bottom: 15, left: 63 };
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
    // Gap between svg top and chart top, nothing to do with svgPadding.top
    const chartTopMargin = 18;

    // Box plot
    const boxHeight = 15;
    const textBottomPadding = 3;

    // All stages found in data
    let allStages = data.map(function (d) {
      return d.stage;
    });

    let defaultStagesData = [];
    data.forEach(function (d) {
      defaultStagesData.push(d);
    });
    // // By default only show the top level stages if has data
    // // otherwise show sub stages directly
    // let defaultStagesData = data.filter(function (d) {
    //     if (Cohort.orderedCancerStages.indexOf(d.stage) !== -1) {
    //         return d.stage;
    //     } else {
    //         //trying to get rid of a warning
    //         return null;
    //     }
    //
    // });

    // set the ranges

    // age offset, so the min/max age doesn't overlap the y axis or right boundary
    let ageOffset = 5;

    let x = d3
      .scaleLinear()
      .domain([minAge - ageOffset, maxAge + ageOffset])
      .range([0, chartWidth]);

    let y = d3
      .scaleBand()
      .domain(
        defaultStagesData.map(function (d) {
          return d.stage;
        })
      )
      .range([0, chartHeight - chartTopMargin]) // top to bottom: stages by patients count in ascending order
      .padding(0.2); // blank space between bands

    if (!d3.select("#" + id + " svg").empty()) {
      d3.select("#" + id + " svg")._groups[0][0].remove();
    }
    let svg = d3
      .select("#" + id)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    let stagesChartGrp = svg
      .append("g")
      .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

    let distributionGrp = stagesChartGrp.append("g");

    let ageSelectionGrp = stagesChartGrp.append("g");

    // Chart title
    // svg.append("text")
    //     .attr("class", "stages_chart_title")
    //     .attr("transform", function (d) {
    //         // Works together with "dominant-baseline:text-before-edge;"" in CSS
    //         // to position the text based on upper left corner
    //         return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
    //     })
    //     .text("Patient Age of First Encounter Per Stage");

    // Render the bars before rendering the Y axis
    // so the Y axis vertical line covers the bar border
    renderDistribution(defaultStagesData);
    // renderYAxis() is based ont the y.domain(), so no argument
    renderYAxis();

    // Add the ages bottom X Axis
    stagesChartGrp
      .append("g")
      .attr("transform", "translate(0, " + (chartHeight - chartTopMargin) + ")")
      .attr("class", "age_axis")
      .call(d3.axisBottom(x))
      // Append axis label
      .append("text")
      .attr("class", "age_axis_label")
      .attr("x", chartWidth)
      .attr("y", -3)
      .text("Age of first encounter");

    // Age range selection

    let brush = d3
      .brushX()
      // Restrict the brush move between minAge and maxAge
      .extent([
        [x(minAge), 0],
        [x(maxAge), chartHeight - chartTopMargin],
      ])
      //TODO: fix duringBrush, endBrush, maybe crashing becase all people are the same age?
      .on("brush", during1Brush)
      // Only activate listener at the end of a brush gesture, such as on mouseup.
      // Update the resulting charts on brush end
      .on("end", end1Brush);
    let ageSelectionBrush = ageSelectionGrp
      .append("g")
      .attr("transform", "translate(0, 0)")
      .attr("class", "age_selection_brush");

    // Add custom brush handles
    let customBrushHandlesData = [{ type: "w" }, { type: "e" }];

    // Function expression to create custom brush handle path
    let createCustomBrushHandle = function (d) {
      let e = +(d.type === "e"),
        x = e ? 1 : -1,
        y = chartHeight / 2;

      return (
        "M" +
        0.5 * x +
        "," +
        y +
        "A6,6 0 0 " +
        e +
        " " +
        6.5 * x +
        "," +
        (y + 6) +
        "V" +
        (2 * y - 6) +
        "A6,6 0 0 " +
        e +
        " " +
        0.5 * x +
        "," +
        2 * y +
        "ZM" +
        2.5 * x +
        "," +
        (y + 8) +
        "V" +
        (2 * y - 8) +
        "M" +
        4.5 * x +
        "," +
        (y + 8) +
        "V" +
        (2 * y - 8)
      );
    };

    let customBrushHandle = ageSelectionBrush
      .selectAll(".handle--custom")
      .data(customBrushHandlesData)
      .enter()
      .append("path")
      .attr("class", "handle--custom")
      .attr("cursor", "ew-resize")
      .attr("d", createCustomBrushHandle)
      .attr("transform", function (d, i) {
        // Position the custom handles based on the default selection range
        let selection = [minAge, maxAge].map(x);
        return "translate(" + [selection[i], -chartHeight / 8] + ")";
      });

    // Function expression of updating custom handles positions
    let moveCustomBrushHandles = function (selection) {
      customBrushHandle.attr("transform", function (d, i) {
        return "translate(" + [selection[i], -chartHeight / 3] + ")";
      });
    };

    // Attach brush and move to default position
    // must call this before removing pointer events
    ageSelectionBrush
      .call(brush)
      // By default, move the brush to start at minAge and end at maxAge
      .call(brush.move, [minAge, maxAge].map(x));

    // Remove pointer events on brushe overlay, this prevents new brush from being made
    // when users click outside the current brush area
    // So basically, we force the users to only either move the current brush selection
    // or use the custom handles to resieze the brush selection.
    ageSelectionBrush.selectAll(".overlay").style("pointer-events", "none");

    // Lower age text, default to minAge
    ageSelectionGrp
      .append("text")
      .attr("class", "age_range")
      .attr("id", "lower_age")
      .attr("x", x(minAge))
      .attr("y", 0)
      .text(minAge);

    // Upper age text, default to maxAge
    ageSelectionGrp
      .append("text")
      .attr("class", "age_range")
      .attr("id", "upper_age")
      .attr("x", x(maxAge))
      .attr("y", 0)
      .text(maxAge);

    // Set the default of currentFirstEncounterAgeRange
    //let currentFirstEncounterAgeRange;
    //= [minAge, maxAge];

    // Update/move the range limits as the brush moves
    // Also update the position of custom brush handles
    function during1Brush(event) {
      let selection = event.selection;
      if (selection !== null) {
        let extent = selection.map(x.invert, x);
        // console.log("Extent 0: " + extent[0]);
        // console.log("Extent 1: " + extent[1]);

        let lowerAge = Math.round(extent[0]);
        let upperAge = Math.round(extent[1]);

        // console.log("Lower Age: " + lowerAge);
        // console.log("Upper Age: " + upperAge);

        // Update lower and upper ages
        // Rounding to integer only

        d3.select("#lower_age").attr("x", x(lowerAge)).text(lowerAge);

        d3.select("#upper_age").attr("x", x(upperAge)).text(upperAge);

        // Update the position of custom brush handles
        moveCustomBrushHandles(selection);
      } else {
        debugger;
      }
    }

    // Filter the patients based on age selection
    // Then update derived resulting charts
    function end1Brush(event) {
      let selection = event.selection;
      if (selection !== null) {
        let extent = event.selection.map(x.invert, x);

        let lowerAge = Math.round(extent[0]);
        let upperAge = Math.round(extent[1]);

        if (d3.selectAll("#lower_age").size() > 0) {
          lowerAge = parseInt(d3.select("#lower_age").text());
        }
        if (d3.select("#upper_age")[0] !== undefined) {
          upperAge = parseInt(d3.select("#upper_age").text());
        }
        that.state.maxAge = upperAge;
        that.state.minAge = lowerAge;

        // Update patientsByFirstEncounterAge by filtering allPatients

        const newStagesInfo = JSON.parse(
          JSON.stringify(that.props.patientsAndStagesInfo.stagesInfo)
        );
        for (let i = newStagesInfo.length - 1; i >= 0; i--) {
          if (
            that.props.patientsAndStagesInfo.selectedStage == null ||
            newStagesInfo[i].stage === that.props.selectedStage
          ) {
            const stage = newStagesInfo[i];
            for (let j = stage.patients.length - 1; j >= 0; j--) {
              // if (!selectedStages.includes(stage.stage) ||
              if (!patientFirstEncounterInAgeRange(stage.patients[j])) {
                stage.patients.splice(j, 1);
                stage.ages.splice(j, 1);
                stage.patientsCount -= 1;
              }
            }
          } else {
            newStagesInfo.splice(i, 1);
          }
        }

        const newPatients = that.props.patientsAndStagesInfo.patients.slice().filter((p) => {
          return patientInStagesInfo(p);
        });
        that.props.patientsAndStagesInfoSetter({
          stagesInfo: JSON.parse(JSON.stringify(newStagesInfo)),
          patients: JSON.parse(JSON.stringify(newPatients)),
        });

        // Update the final target patients array and resulting charts
        //  let targetPatients = Cohort.getTargetPatients(that.props.patients, that.props.patients);

        // Update curre ntFirstEncounterAgeRange
        //currentFirstEncounterAgeRange = [lowerAge, upperAge];

        //  showDerivedChart(targetPatients, Cohort.allStagesLabel, Cohort.currentFirstEncounterAgeRange);
        moveCustomBrushHandles(selection);
      } else {
        debugger;
      }
    }

    // Render all stage bars and boxplots
    function renderDistribution(data) {
      // Only show the patient age when the stage has only one patient
      let singlePatientGrp = distributionGrp
        .append("g")
        .selectAll(".single_patient_group")
        .data(
          data.filter(function (d) {
            return d.patientsCount === 1;
          })
        )
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "single_patient_group " + d.stage.replace(" ", "_");
        })
        .attr("transform", function (d) {
          return "translate(0, " + (y(d.stage) + y.bandwidth() / 2) + ")";
        });

      // Verical line of single age
      singlePatientGrp
        .append("line")
        .attr("class", "single_patient_age_line")
        .attr("x1", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y2", boxHeight);

      // Text of single age
      singlePatientGrp
        .append("text")
        .attr("class", "single_patient_text")
        .attr("x", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y", -textBottomPadding)
        .text(function (d) {
          return d.ageStats.minVal;
        });

      // Show the box plot for stage that has more than one patient
      let boxplotGrp = distributionGrp
        .append("g")
        .selectAll(".boxplot")
        .data(
          data.filter(function (d) {
            return d.patientsCount > 1;
          })
        )
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "boxplot " + d.stage.replace(" ", "_");
        })
        .attr("transform", function (d) {
          return "translate(0, " + (y(d.stage) + y.bandwidth() / 2) + ")";
        });

      // Verical line of min age
      boxplotGrp
        .append("line")
        .attr("class", "boxplot_min")
        .attr("x1", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y2", function (d) {
          return boxHeight;
        });

      // Text of min age
      boxplotGrp
        .append("text")
        .attr("class", "boxplot_text")
        .attr("x", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y", function (d) {
          return -textBottomPadding;
        })
        .text(function (d) {
          return d.ageStats.minVal;
        });

      // Vertical line of max age
      boxplotGrp
        .append("line")
        .attr("class", "boxplot_max")
        .attr("x1", function (d) {
          return x(d.ageStats.maxVal);
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
          return x(d.ageStats.maxVal);
        })
        .attr("y2", boxHeight);

      // Text of max age
      boxplotGrp
        .append("text")
        .attr("class", "boxplot_text")
        .attr("x", function (d) {
          return x(d.ageStats.maxVal);
        })
        .attr("y", -textBottomPadding)
        .text(function (d) {
          return d.ageStats.maxVal;
        });

      // Horizontal whisker lines
      boxplotGrp
        .append("line")
        .attr("class", "boxplot_whisker")
        .attr("x1", function (d) {
          return x(d.ageStats.minVal);
        })
        .attr("y1", boxHeight / 2)
        .attr("x2", function (d) {
          return x(d.ageStats.maxVal);
        })
        .attr("y2", boxHeight / 2);

      // Rect for iqr
      boxplotGrp
        .append("rect")
        .attr("class", "boxplot_box")
        .attr("x", function (d) {
          return x(d.ageStats.q1Val);
        })
        .attr("y", 0)
        .attr("height", boxHeight)
        // Add transition on box rect rendering
        .transition()
        .duration(Cohort.transitionDuration)
        .attr("width", function (d) {
          return x(d.ageStats.q3Val) - x(d.ageStats.q1Val);
        });

      // Text of q1 age
      boxplotGrp
        .append("text")
        .attr("class", "boxplot_text")
        .attr("x", function (d) {
          return x(d.ageStats.q1Val);
        })
        .attr("y", -textBottomPadding)
        .text(function (d) {
          return d.ageStats.q1Val;
        });

      // Text of q3 age
      boxplotGrp
        .append("text")
        .attr("class", "boxplot_text")
        .attr("x", function (d) {
          return x(d.ageStats.q3Val);
        })
        .attr("y", -textBottomPadding)
        .text(function (d) {
          return d.ageStats.q3Val;
        });

      // Must after the box so the bar doesn't gets covered by the box
      // Vertical line of median age
      boxplotGrp
        .append("line")
        .attr("class", "boxplot_median")
        .attr("x1", function (d) {
          return x(d.ageStats.medianVal);
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
          return x(d.ageStats.medianVal);
        })
        .attr("y2", boxHeight);

      // Text of median age
      boxplotGrp
        .append("text")
        .attr("class", "boxplot_text")
        .attr("x", function (d) {
          return x(d.ageStats.medianVal);
        })
        .attr("y", -textBottomPadding)
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.ageStats.medianVal;
        });
    }

    // Render Y axis
    function renderYAxis() {
      stagesChartGrp
        .append("g")
        .attr("transform", "translate(0, 0)")
        .attr("id", "patient_age_chart_y_axis")
        .call(d3.axisLeft(y))
        // Add custom id to each tick group
        .selectAll(".tick")
        .attr("class", function (d) {
          // Distiguish the top stage and sub stage labels using different colors
          return "tick " + (Cohort.topLevelStages.indexOf(d) !== -1 ? "top_stage" : "sub_stage");
        })
        // Now modify the label text to add patients count
        .selectAll("text")
        .text(function (d) {
          return d + " (" + patientsCounts[d] + ")";
        });

      // Only add click event to top level stages
      svg.selectAll(".top_stage").on("click", function (d) {
        let displayStages = y.domain();

        // Click top-level stage label to show sub level stages
        let subLevels = [d + "A", d + "B", d + "C"];
        let addedSubStages = [];
        let removedSubStages = [];

        subLevels.forEach(function (stage) {
          // sub stage must belong to the allStages
          if (allStages.indexOf(stage) !== -1) {
            // Add this sub stage to the stages to display when expanding the top stage
            // Remove the sub stage from the display stages when collapsing the top stage
            if (displayStages.indexOf(stage) === -1) {
              displayStages.push(stage);

              // Also add to updatedSubStages so we know the changes
              // No need to sort this array since it's based on the A, B, C
              addedSubStages.push(stage);
            } else {
              let index = displayStages.indexOf(stage);
              displayStages.splice(index, 1);

              // Also add to removedSubStages
              removedSubStages.push(stage);
            }
          }
        });

        // Need to sort the displayStages so the sub-stages appear under each top-stage
        let sortedDisplayStages = Cohort.sortByProvidedOrder(
          displayStages,
          Cohort.orderedCancerStages
        );

        // Also update the y.domain()
        y.domain(sortedDisplayStages);

        // Now for UI updates
        svg.selectAll("#patient_age_chart_y_axis").remove();

        function reposition() {
          // Reposition the single pateint groups
          svg
            .selectAll(".single_patient_group")
            .transition()
            .duration(Cohort.transitionDuration)
            .attr("transform", function (d) {
              return "translate(0, " + (y(d.stage) + y.bandwidth() / 2) + ")";
            });

          // Reposition the boxplots
          svg
            .selectAll(".boxplot")
            .transition()
            .duration(Cohort.transitionDuration)
            .attr("transform", function (d) {
              return "translate(0, " + (y(d.stage) + y.bandwidth() / 2) + ")";
            });
          //return null; //trying to get rid of a warning.
        }

        // Add sub stage bars and boxplots
        if (addedSubStages.length > 0) {
          let updatedData = data.forEach(function (d) {
            if (addedSubStages.indexOf(d.stage) !== -1) {
              updatedData.push(d);
            }
          });

          // Reposition the exisiting stages BEFORE adding new sub stages
          reposition();

          // The last thing is to add new sub stages

          renderDistribution(updatedData);
        }

        // Or remove sub stage bars and boxplots
        if (removedSubStages.length > 0) {
          removedSubStages.forEach(function (stage) {
            // Can't get the transition work here with reposition
            svg.selectAll("." + stage.replace(" ", "_")).remove();
          });

          // Reposition the rest of stages AFTER removing target sub stages
          reposition();
        }

        // Re-render Y axis after the bars/boxplots so the vertical line covers the bar border
        renderYAxis();
      });
    }
  };

  componentDidMount() {
    const that = this;
    this.state.width = document.getElementById("chart1").clientWidth;
    this.state.height = 350;
    window.addEventListener("resize", this.updateDimensions);
    this.showChart(that);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      JSON.stringify(prevProps.patientsAndStagesInfo) !==
        JSON.stringify(this.props.patientsAndStagesInfo) &&
      !this.props.loading
    ) {
      const that = this;
      this.showChart(that);
    }
  }

  render() {
    return <div className="BarChart" id={this.props.docId}></div>;
  }
}
