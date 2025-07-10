import * as d3 from "d3v4";
import * as $ from "jquery";
import React from "react";

export default class DiagnosisChart extends React.Component {

    state = {
        diagnosisData: null,
        width: 0,
        height: 0,
        loading: true
    }


    updateDiagnosisData = async () => {
        const that = this;
        const fetchData = async () => {
            const patientIds = that.props.patientsAndStagesInfo.patients.map(patient => patient.patientId)
            return new Promise(function (resolve, reject) {
                fetch('http://localhost:3001/api/diagnosis/' + patientIds.join('+')).then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject('User not logged in');
                    }
                });
            });
        }
        return new Promise(function (resolve, reject) {
            fetchData().then(function (response) {
                response.json().then(function (json) {
                        that.setState({diagnosisData: json});
                        resolve(json)
                    }
                )
            })
        })
    }

    reset = async () => {
        await this.updateDiagnosisData().then(() => {

                this.state.loading = false;
                this.showDiagnosisChart("diagnosis")
                this.updateDimensions()
            }
        )
    }

    updateDimensions = () => {
        this.setState({width: document.getElementById('diagnosis').clientWidth, height: 350});
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
        this.reset()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const internalUpdate = JSON.stringify(prevProps.patientsAndStagesInfo) !==JSON.stringify(this.props.patientsAndStagesInfo) ||
            JSON.stringify(prevState.diagnosisData) !==JSON.stringify(this.state.diagnosisData)

        const sizeChange = prevState.width !==this.state.width;
        if ((internalUpdate || sizeChange) && !this.state.loading) {
            this.showDiagnosisChart("diagnosis")
            this.updateDiagnosisData()
        }

    }

    highlightTargetPatients = (patientsArr) => {
        // this.state.patients.forEach(function (patient) {
        //     $("#" + patient).addClass("highlighted_target_patient_in_diagnosis");
        // });
    }

    showDiagnosisChart = (svgContainerId) => {
        const that = this;

        const data = this.state.diagnosisData;
        d3.select("#" + svgContainerId).selectAll("*").remove();
        const diagnosisDotRadius = 4;
        const highlightedDotRadius = 5;
        const overviewDotRadius = 1.5;
        const svgPadding = {top: 10, right: 10, bottom: 10, left: 140};
        const gapBetweenYAxisAndXAxis = 20;
        const chartTopMargin = 40;
        const xAxisHeight = 20;
        // 15 is the line height of each Y axis label
        const yAxisHeight = data.diagnosisGroups.length * 15;
        const overviewHeight = data.diagnosisGroups.length * overviewDotRadius * 3;

        const svgHeight = xAxisHeight + yAxisHeight + chartTopMargin + overviewHeight + gapBetweenYAxisAndXAxis * 2;
        // const chartWidth = svgWidth - svgPadding.left - svgPadding.right;

        const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom - overviewHeight - gapBetweenYAxisAndXAxis;

        let svg = d3.select("#" + svgContainerId).append("svg")
            .attr("class", "diagnosis_chart") // Used for CSS styling
            .attr("width", that.state.width)
            .attr("height", svgHeight);

        let diagnosisChartGrp = svg.append("g")
            .attr("class", "diagnosis_chart_group")
            .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

        const dotColor = "rgb(107, 174, 214)";
        const highlightedDotColor = "rgb(230, 85, 13)";

        let xDomain = [];

        let diagnosisDots = [];
        // let chartWidth = () => {
        //
        //     return Math.max(500, svg._groups[0][0].getBBox().width);
        // }
        data.data.forEach(function (d) {

            xDomain.push(d.patient);

            d.diagnosisGroups.forEach(function (diagGrp) {
                let dot = {};
                dot.patientId = d.patient;
                dot.diagnosisGroups = diagGrp;

                diagnosisDots.push(dot);
            });
        });

        const overviewWidth = that.state.width - svgPadding.left - svgPadding.right - gapBetweenYAxisAndXAxis;
        let widthPerPatient = 50; //(that.state.width - gapBetweenYAxisAndXAxis * 2) / (xDomain.length - 1);
        let patientsNumDisplay = 20;

        // Show the first patientsNumDisplay patients by default
        let defaultPatients = xDomain.slice(0, patientsNumDisplay);

        // Set the ranges
        let x = d3.scalePoint()
            .domain(defaultPatients)
            .range([gapBetweenYAxisAndXAxis, overviewWidth]);

        let overviewX = d3.scalePoint()
            .domain(xDomain)
            .range([gapBetweenYAxisAndXAxis, overviewWidth]);

        let y = d3.scalePoint()
            .domain(data.diagnosisGroups)
            .range([0, chartHeight - chartTopMargin - svgPadding.bottom - gapBetweenYAxisAndXAxis]);

        let overviewY = d3.scalePoint()
            .domain(data.diagnosisGroups)
            .range([0, overviewHeight]);

        // Replace all spaces, commas, and () with underscores
        let diagnosis2Class = function (diagnosis) {
            return diagnosis.replace(/ |,|\(|\)|/g, "_");
        };

        // Chart title
        svg.append("text")
            .attr("class", "diagnosis_chart_title")
            .attr("transform", function (d) {
                return "translate(" + that.state.width / 2 + ", " + svgPadding.top + ")";

            })
            .text("Diagnosis");

        // Patient diagnosis dots
        diagnosisChartGrp.selectAll(".diagnosis_dot")
            .data(diagnosisDots.filter(function (obj) {
                // By default only show the dots of patients in the x.domain()
                return x.domain().indexOf(obj.patientId) !== -1
            }))
            .enter().append("circle")
            .attr("class", function (d) {
                return "diagnosis_dot " + d.patientId;
            })
            .attr("cx", function (d, i) {
                return x(d.patientId);
            })
            .attr("cy", function (d) {
                return y(d.diagnosisGroups);
            })
            .attr("r", diagnosisDotRadius)
            .attr("fill", dotColor);


        // Add the x Axis
        diagnosisChartGrp.append("g")
            .attr("transform", "translate(0," + (chartHeight - chartTopMargin - svgPadding.bottom) + ")")
            .attr("class", "diagnosis_x_axis");

        createXAxis();

        // Will be reused when moving slider
        function createXAxis() {
            diagnosisChartGrp.append("g")
                .attr("transform", "translate(0," + (chartHeight - chartTopMargin - svgPadding.bottom) + ")")
                .attr("class", "diagnosis_x_axis")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "diagnosis_x_label")
                .on("mouseover", function (d) {
                    // Highlight all dots of this patient
                    d3.selectAll("." + d)
                        .attr("r", highlightedDotRadius)
                        .attr("fill", highlightedDotColor);

                    // Insert instead of append() guideline so it gets covered by dots
                    d3.select(".diagnosis_chart_group").insert("line", ":first-child")
                        .attr("class", "diagnosis_guideline")
                        .attr("x1", x(d))
                        .attr("y1", 0)
                        .attr("x2", x(d))
                        .attr("y2", chartHeight - chartTopMargin);

                    // Also highlight the corresponding Y labels
                    data.patients[d].forEach(function (diagnosis) {
                        $("." + diagnosis2Class(diagnosis)).addClass("highlighted_diagnosis_label");
                    });
                })
                .on("mouseout", function (d) {
                    // Reset dot size and color
                    d3.selectAll("." + d)
                        .attr("r", diagnosisDotRadius)
                        .attr("fill", dotColor);

                    // Remove added guideline
                    d3.selectAll(".diagnosis_guideline").remove();

                    // Also dehighlight the corresponding Y labels
                    data.patients[d].forEach(function (diagnosis) {
                        $("." + diagnosis2Class(diagnosis)).removeClass("highlighted_diagnosis_label");
                    });
                });
        }

        // Add the y Axis
        diagnosisChartGrp.append("g")
            .call(d3.axisLeft(y))
            // Now add class to the label text
            .selectAll("text")
            .attr("class", function (d) {
                return diagnosis2Class(d);
            })
            // Replace underscore with white space
            .text(function (d) {
                return d;
            });

        // Only show the slider when there are more patients than patientsNumDisplay
        if (xDomain.length > patientsNumDisplay) {
            createSlider();
        }

        function createSlider() {

            // Overview area with slider
            let overview = svg.append("g")
                .attr("class", "overview")
                .attr("transform", "translate(" + svgPadding.left + "," + (svgPadding.top + chartHeight + gapBetweenYAxisAndXAxis) + ")");

            overview.selectAll(".overview_diagnosis_dot")
                .data(diagnosisDots)
                .enter().append("g").append("circle")
                .attr('class', 'overview_diagnosis_dot')
                .attr("cx", function (d) {
                    return overviewX(d.patientId);
                })
                .attr("cy", function (d) {
                    return overviewY(d.diagnosisGroups);
                })
                .attr("r", overviewDotRadius)
                .attr("fill", dotColor);

            // Add overview step slider
            let sliderWidth = widthPerPatient * (patientsNumDisplay - 1) + 2 * overviewDotRadius;

            // Highlight the target patients in target patients list by default
            that.highlightTargetPatients(defaultPatients);

            let drag = d3.drag()
                .on("drag", dragged);

            overview.append("rect")
                .attr("class", "slider")
                .attr("x", gapBetweenYAxisAndXAxis - overviewDotRadius)
                .attr("y", -overviewDotRadius) // take care of the radius
                .attr("width", sliderWidth)
                .attr("height", overviewHeight + 2 * overviewDotRadius)
                .attr("pointer-events", "all")
                .attr("cursor", "ew-resize")
                .call(drag);

            function dragged(d) {

                let dragX = d3.event.x;

                // Restrict start and end point of the slider
                const beginX = 0;
                // endX is always the x position of the first patient dot in the slider
                // when the slider is moved to the very end
                const endX = overviewX(xDomain[xDomain.length - patientsNumDisplay]) - overviewDotRadius * 2;

                if (dragX < beginX) {
                    dragX = beginX;
                }

                if (dragX > endX) {
                    dragX = endX;
                }

                // Now we need to know the start and end index of the domain array
                let startIndex = Math.floor(dragX / widthPerPatient);

                // Step Slider
                let midPoint = (overviewX(xDomain[startIndex]) + overviewX(xDomain[startIndex + 1])) / 2;

                let targetIndex = null;
                if (dragX < midPoint) {
                    targetIndex = startIndex;
                } else {
                    targetIndex = startIndex + 1;
                    targetIndex = startIndex + 1;
                }

                let endIndex = targetIndex + patientsNumDisplay;

                // Move the slider rect to new position
                let newX = overviewX(xDomain[targetIndex]) - overviewDotRadius;

                d3.select(this).attr("x", newX);

                // Element of endIndex is not included
                let newXDomain = xDomain.slice(targetIndex, endIndex);

                // Update x domain
                x.domain(newXDomain);

                // Remove and recreate the x axis
                diagnosisChartGrp.selectAll(".diagnosis_x_axis").remove();
                createXAxis();

                let newDiagnosisDots = diagnosisDots.filter(function (obj) {
                    return newXDomain.indexOf(obj.patientId) !== -1
                });

                // Remove all old dots
                diagnosisChartGrp.selectAll(".diagnosis_dot").remove();

                // Recreate and position the new dots
                diagnosisChartGrp.selectAll(".diagnosis_dot")
                    .data(newDiagnosisDots)
                    .enter().append("circle")
                    .attr("class", function (d) {
                        return "diagnosis_dot " + d.patientId;
                    })
                    .attr("cx", function (d) {
                        return x(d.patientId);
                    })
                    .attr("cy", function (d) {
                        return y(d.diagnosisGroups);
                    })
                    .attr("r", 4)
                    .attr("fill", dotColor);

                // Also highlight the target patients in the patient list
                $(".target_patient").removeClass("highlighted_target_patient_in_diagnosis");
                that.highlightTargetPatients(newXDomain);
            };
        }
    }

    render() {
        return (

                    <div id="diagnosis"></div>

        )
    }
}