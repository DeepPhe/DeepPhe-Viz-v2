import React from "react";
import * as d3 from "d3v4";
import * as Cohort from '../../cohort.js'

export default class PatientCountPerStageChart extends React.Component {
    state = {
        loaded: false,

        width: 0,
        height: 350
    };


    // fetchData = async () => {
    //     return new Promise(function (resolve, reject) {
    //         fetch('http://localhost:3001/api/cohortData').then(function (response) {
    //             if (response) {
    //                 resolve(response);
    //             } else {
    //                 reject('User not logged in');
    //             }
    //         });
    //
    //     });
    //
    // }
    showChart = (that) => {
        function showPatientCountPerStageChart(that) {
            const id = that.props.docId;
            let selectedStages = [];
            that.props.patientsAndStagesInfo.patients.forEach((patient) => {
                    if (patient.stages.length > 0) {
                        if (patient.stages[0] === "Stage_2A") {
                            selectedStages.push("Stage IIA")
                        }
                        if (patient.stages[0] === "Stage_1B") {
                            selectedStages.push("Stage IB")
                        }
                        if (patient.stages[0] === "Stage_2B") {
                            selectedStages.push("Stage IIB")
                        }
                        if (patient.stages[0] === "Stage_3A") {
                            selectedStages.push("Stage IIIA")
                        }
                        if (patient.stages[0] === "Stage_3B") {
                            selectedStages.push("Stage IIIB")
                        }
                        if (patient.stages[0] === "Stage_4A") {
                            selectedStages.push("Stage IVA")
                        }
                        if (patient.stages[0] === "Stage_4A") {
                            selectedStages.push("Stage IVB")
                        }
                    }
                }
            )
            let data = JSON.parse(JSON.stringify(that.props.patientsAndStagesInfo.stagesInfo))
            for (let i = data.length - 1; i >= 0; i--) {
                if (!selectedStages.includes(data[i].stage)) {
                    data.splice(i, 1);
                }
            }
            //fix stages...
            let patientsCounts = {};
            // Calculate and add the box plot data to each stagesInfo object
            data.forEach(function (stagesInfo) {
                // Add to patientsCounts object for later use (modify the Y label)
                if (typeof patientsCounts[stagesInfo.stage] === "undefined") {
                    patientsCounts[stagesInfo.stage] = stagesInfo.patientsCount;
                }
            });

            // set the dimensions and margins of the graph
            const svgWidth = that.state.width;
            const svgHeight = that.state.height;
            // svgPadding.top is used to position the chart title
            // svgPadding.left is the space for Y axis labels
            const svgPadding = {top: 0, right: 15, bottom: 15, left: 63};
            const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
            const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
            // Gap between svg top and chart top, nothing to do with svgPadding.top
            const chartTopMargin = 15;

            // All stages found in data
            let allStages = data.map(function (d) {
                return d.stage;
            });

            // By default only show the top level stages if has data
            // otherwise show sub stages directly
            // Here the data is already sorted by stage name in dataProcessor
            let defaultStagesData = [];
            data.forEach(function (d) {
                if (Cohort.orderedCancerStages.indexOf(d.stage) !== -1) {
                    defaultStagesData.push(d);
                }
            });

            // let defaultStagesData = data.filter(function (d) {
            //     if (Cohort.orderedCancerStages.indexOf(d.stage) !== -1) {
            //         return d.stage;
            //     }
            //     //return null; //trying to get rid of a warning
            // });

            let xCount = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) {
                    return d.patientsCount;
                })])
                .range([0, chartWidth]);

            let y = d3.scaleBand()
                .domain(defaultStagesData.map(function (d) {
                    return d.stage;
                }))
                .range([0, chartHeight - chartTopMargin]) // top to bottom: stages by patients count in ascending order
                .padding(0.32); // blank space between bands

            if (!d3.select("#" + id + " svg").empty()) {
                d3.select("#" + id + " svg")._groups[0][0].remove();
            }
            let svg = d3.select("#" + id).append("svg")
                //d3.select("#" + svgContainerId).append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

            let stagesChartGrp = svg.append("g")
                .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")").attr("id", "stagesChartGroup");

            // Chart title
            // svg.append("text")
            //     .attr("class", "stages_chart_title")
            //     .attr("transform", function (d) {
            //         // Works together with "dominant-baseline:text-before-edge;"" in CSS
            //         // to position the text based on upper left corner
            //         return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
            //     })
            //     .text("Patient Count Per Stage");

            // Render the boxplots before rendering the Y axis
            // so the Y axis vertical line covers the bar border
            renderDistribution(defaultStagesData);
            // renderYAxis() is based ont the y.domain(), so no argument
            renderYAxis();

            // Show only integer numbers for the ticks when the max count is less than 10
            // otherwise use the default ticks
            let xCountAxis;
            if (xCount.domain()[1] >= 10) {
                xCountAxis = d3.axisBottom(xCount);
            } else {
                let xCountTickValues = [];
                for (let i = 0; i <= xCount.domain()[1]; i++) {
                    xCountTickValues.push(i);
                }
                xCountAxis = d3.axisBottom(xCount).tickValues(xCountTickValues).tickSize(0).tickFormat(d3.format("d"));
            }

            //var axis = d3.axisBottom;  removing to get rid of a warning


            // Add patients count top X axis
            stagesChartGrp.append("g")
                .attr("transform", "translate(0, " + (chartHeight - chartTopMargin) + ")")
                .attr("class", "count_axis")

                .call(xCountAxis)
                // Append axis label
                .append("text")
                .attr("class", "count_axis_label")
                .attr("x", chartWidth)
                .attr("y", -3)
                .text("Number of patients");


            // Render all stage bars and boxplots
            function renderDistribution(data) {
                // Bar chart of patients counts
                stagesChartGrp.append("g").selectAll(".stage_bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", function (d) {
                        // Distiguish the top stages, sub stages, and unknown stage using different bg and border colors
                        if (d.stage !== "Stage Unknown") {
                            return "stage_bar " + ((Cohort.topLevelStages.indexOf(d.stage) !== -1) ? "top_stage_bar " : "sub_stage_bar ") + d.stage.replace(" ", "_");
                        } else {
                            return "stage_bar unknown_stage_bar " + d.stage.replace(" ", "_");
                        }

                        // if (d.state === that.props.selectedStage) {
                        //     let css = "clicked_bar";
                        //     d.classed(css, true);
                        // }

                    })
                    .attr("transform", function (d) {
                        return "translate(0, " + y(d.stage) + ")";
                    })
                    .attr("height", y.bandwidth())
                    .on("click", function (d) {
                        let clickedBar = d3.select(this);
                        let css = "clicked_bar";

                        // Toggle
                        if (!clickedBar.classed(css)) {

                            // Remove previouly added css class
                            svg.selectAll(".stage_bar").classed(css, false);
                            // Highlight the clicked box and show corresponding patients
                            clickedBar.classed(css, true);

                            // Update patientsByStage
                            //Cohort.setPatientsByStage(d.patients);


                            //that.state.patients = d.patients;
                            that.props.selectedStageSetter(clickedBar._groups[0][0].__data__.stage);
                            that.props.patientsAndStagesInfoSetter({patients: d.patients, stagesInfo: data});


                            // let targetPatients = Cohort.getTargetPatients(that.state.patients, that.state.patients);

                            //showDerivedChart(targetPatients, d.stage, Cohort.currentFirstEncounterAgeRange);

                        } else {
                            // When clicked again, remove highlight and show all patients
                            clickedBar.classed(css, false);

                            // Updafte patientsByStage
                            // allPatients is the patient data saved in memory
                            //Cohort.setPatientsByStage(Cohort.allPatients);

                            //let targetPatients = Cohort.getTargetPatients(Cohort.patientsByStage, that.state.patients);

                            //showDerivedChart(targetPatients, Cohort.allStagesLabel, Cohort.currentFirstEncounterAgeRange);
                        }
                    })
                    .transition()
                    .duration(Cohort.transitionDuration)
                    .attr("width", function (d) {
                        return xCount(d.patientsCount);
                    });
            }

            // Render Y axis
            function renderYAxis() {

                stagesChartGrp.append("g")
                    .attr("transform", "translate(0, 0)")
                    .attr("id", "patient_count_chart_y_axis")
                    .call(d3.axisLeft(y))
                    // Add custom id to each tick group
                    .selectAll(".tick")
                    .attr("class", function (d) {
                        // Distiguish the top stage and sub stage labels using different colors
                        return "tick " + ((Cohort.topLevelStages.indexOf(d) !== -1) ? "top_stage" : "sub_stage");
                    })
                    // Now modify the label text to add patients count
                    .selectAll("text")
                    .text(function (d) {
                        return d + " (" + patientsCounts[d] + ")";
                    });

                // Only add click event to top level stages
                svg.selectAll(".top_stage > text").on("click", function (d) {

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
                    let sortedDisplayStages = Cohort.sortByProvidedOrder(displayStages, Cohort.orderedCancerStages);

                    // Also update the y.domain()
                    y.domain(sortedDisplayStages);

                    // Now for UI updates
                    svg.selectAll("#patient_count_chart_y_axis").remove();

                    function reposition() {
                        // Repoition the existing stage bars and resize height
                        svg.selectAll(".stage_bar")
                            .transition()
                            .duration(Cohort.transitionDuration)
                            .attr("transform", function (d) {
                                return "translate(0, " + y(d.stage) + ")";
                            })
                            .attr("height", y.bandwidth());

                        // Reposition the single pateint groups
                        svg.selectAll(".single_patient_group")
                            .transition()
                            .duration(Cohort.transitionDuration)
                            .attr("transform", function (d) {
                                return "translate(0, " + (y(d.stage) + y.bandwidth() / 2) + ")";
                            });
                    }

                    if (addedSubStages.length > 0) {
                        let updatedData = [];
                        data.forEach(function (d) {
                            if (addedSubStages.indexOf(d.stage) !== -1) {
                                updatedData.push(d);
                            }
                        });

                        // Reposition the exisiting stages BEFORE adding new sub stages
                        reposition();

                        // The last thing is to add new sub stages
                        renderDistribution(updatedData);

                        // // Add sub stage bars and boxplots
                        // if (addedSubStages.length > 0) {
                        //     let updatedData = data.filter(function (d) {
                        //         if (addedSubStages.indexOf(d.stage) !== -1) {
                        //             return d.stage;
                        //         }
                        //         //return null; //trying to get rid of a warning
                        //     });
                        //
                        //
                        // }
                    }

                    // Or remove sub stage bars and boxplots
                    if (removedSubStages.length > 0) {
                        removedSubStages.forEach(function (stage) {
                            // Can't get the transition work here with reposition
                            svg.selectAll("." + stage.replace(" ", "_"))
                                .remove();
                        });

                        // Reposition the rest of stages AFTER removing target sub stages
                        reposition();
                    }

                    // Re-render Y axis after the bars/boxplots so the vertical line covers the bar border
                    renderYAxis();
                });
            }


        }

        showPatientCountPerStageChart(that);
    }

    updateDimensions = () => {
        this.setState({width: document.getElementById('chart2').clientWidth, height: 350});
    };


    componentDidMount() {
        const that = this;
        this.state.width = document.getElementById('chart2').clientWidth;
        this.state.height = 350;
        window.addEventListener('resize', this.updateDimensions);
        this.showChart(that);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log("PatientCountPerStageChart componentDidUpdate...")
        //
        // const patientsChangedExternally = JSON.stringify(prevprops.patients) !== JSON.stringify(this.props.patients);
        // const stagesInfoChangedExternally = JSON.stringify(prevprops.stagesInfo) !== JSON.stringify(this.props.stagesInfo);
        // const patientsChangedInternally = JSON.stringify(prevState.patients) !== JSON.stringify(this.state.patients);
        // const stagesInfoChangedInternally = JSON.stringify(prevState.stagesInfo) !== JSON.stringify(this.state.stagesInfo);
        //
        // const stateChangedExternally = patientsChangedExternally || stagesInfoChangedExternally;
        // const stateChangedInternally = patientsChangedInternally || stagesInfoChangedInternally;
        // const sizeChange = prevState.width !== this.state.width;
        //
        // if (stateChangedExternally) {
        //     if (patientsChangedExternally) {
        //         this.state.patients = JSON.parse(JSON.stringify(this.props.patients));
        //     }
        //     if (stagesInfoChangedExternally) {
        //         this.state.stagesInfo = JSON.parse(JSON.stringify(this.props.stagesInfo));
        //     }
        // }
        //
        // if (stateChangedInternally) {
        //     if (patientsChangedInternally) {
        //         this.props.patients = JSON.parse(JSON.stringify(this.state.patients));
        //     }
        //     if (stagesInfoChangedInternally) {
        //         this.props.stagesInfo = JSON.parse(JSON.stringify(this.state.stagesInfo));
        //     }
        // }
        // //if (internalChange || externalChange || sizeChange) {
        // console.log("PatientCountPerStageChart updating...")

        if (JSON.stringify(prevProps.patientsAndStagesInfo) !==
            JSON.stringify(this.props.patientsAndStagesInfo)) {
            const that = this;
            this.showChart(that);
        }
        // }

    }

    render() {
        return (
            <div className="BarChart" id='pcps-chart'>

            </div>
        );
    }


}