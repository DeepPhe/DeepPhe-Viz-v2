import * as d3 from "d3v4";
import React from "react";
import ToggleSwitch from "../CustomButtons/ToggleSwitch";
import { snakeCase } from "lodash";
import "./CohortFilter.css";
import Grid from "@material-ui/core/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import "rc-slider/assets/index.css";
import $ from "jquery";
import DiscreteList from "./subcomponents/DiscreteList";
import CategoricalRangeSelector from "./subcomponents/CategoricalRangeSelector";
import NumericRangeSelector from "./subcomponents/NumericRangeSelector";
import BooleanList from "./subcomponents/BooleanList";

const filterTopics = ["Diagnosis", "Stage", "Age at Dx", "Metastasis", "Agents", "Comorbidity"];

export default class CohortFilter extends React.Component {
  state = {
    loading: true,
    biomarkerData: null,
    filterDefinitions: null,
    only: filterTopics.map(snakeCase),
    filterData: null,
    cohortSize: null,
    isLoading: true,
    selectedStages: null,
    selectedAges: null,
    stagePresent: null,
    ageAtDx: null,
    metastisis_present: null,
    metastisis_unknown: null,
    agents: [],
    comorbidity: [],
    diagnosis: [],
  };

  reset = () => {
    const that = this;
    const fetchData = async () => {
      return new Promise(function (resolve, reject) {
        fetch("http://localhost:3001/api/filter/definitions").then(function (response) {
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
        that.setState({ filterDefinitions: json });
        that.setState({ loading: false });
        that.updateDimensions();
      });
    });
  };

  updateDimensions = () => {
    const newWidth = document.getElementById("biomarkers").clientWidth;
    //  this.setState({width: newWidth, height: 350});
    let it = d3.select(".biomarkers_overview_chart");
    // it._groups[0][0].setAttribute("width", newWidth)
  };

  componentDidMount() {
    let cohortSize = [
      {
        value: 5,
        description: "5",
        color: "blue",
      },
      {
        value: 95,
        description: "",
        color: "lightgray",
      },
    ];

    let filterDatas = new Array(filterTopics.length);

    filterTopics.forEach((topic, i) => {
      filterDatas[i] = [
        {
          value: Math.random(20),
          description: "",
          color: "blue",
        },
        {
          value: Math.random(20),
          description: "",
          color: "lightblue",
        },
        {
          value: Math.random(20),
          description: "",
          color: "lightgray",
        },
      ];
    });

    this.setState({ filterData: filterDatas, cohortSize: cohortSize, isLoading: false }, () => {
      this.show("new_control_svg");
    });
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.filterDefinitions !== this.state.filterDefinitions) {
      this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
        console.log(e.fieldName);
      });
    }
  }

  show = (svgContainerId) => {
    console.log("calling reset");
    this.reset();
    if (!d3.select("#" + svgContainerId).empty()) {
      d3.select("#" + svgContainerId)._groups[0][0].remove();
    }
    const svgWidth = "100%"; //Math.max(300, this.state.width);
    const svgHeight = "100%";
    const chart = d3
      .select(".new_control_group")
      .append("svg")
      .attr("id", svgContainerId)
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    let innerChart = chart.append("g");
  };

  toggleActivityEnabled =
    (activity) =>
    ({ enabled }) => {
      const selector =
        "#" +
        activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() +
        "-overlay-row";
      if (enabled) {
        $(selector).removeClass("overlay-row");
      } else {
        $(selector).addClass("overlay-row");
      }
    };

  CohortPercentHSBar = (props) => {
    return (
      <HSBar
        //showTextIn
        max={100}
        height={47.3}
        data={this.state.cohortSize}
      />
    );
  };
  
  render() {
    if (this.state.loading) return <div>Data is coming soon...</div>;
    else
      return (
        <React.Fragment>
          <div id="NewControl">
            <h3></h3>
            <Grid
              className={"cohort-size-bar-container"}
              container
              direction="row"
              justifyContent="center"
              align="center"
            >
              <Grid className={"no_padding_grid cohort-size-label-container"} item md={1}>
                <span className={"cohort-size-label"}>Cohort Size</span>
              </Grid>
              <Grid className={"cohort-size-label-container"} item md={6}>
                <this.CohortPercentHSBar />
              </Grid>
              <Grid className={"cohort-size-label-container"} item md={1} />
            </Grid>
            <Grid container direction="row" justifyContent="center" align="center">
              <Grid className="switch_list no_padding_grid" item md={1}>
                {/*{filterTopics.map((activity, index) => (*/}
                {this.state.filterDefinitions.searchFilterDefinition.map(
                  (filterDefinition, index) => (
                    <ToggleSwitch
                      wantsDivs={true}
                      key={index}
                      label={filterDefinition.fieldName}
                      theme="graphite-small"
                      enabled={true}
                      onStateChanged={this.toggleActivityEnabled({ filterDefinition })}
                    />
                  )
                )}
              </Grid>
              <Grid item md={6} className="filter-inner-container no_padding_grid">
                {this.state.filterDefinitions.searchFilterDefinition.map(
                  (filterDefinition, index) =>
                    (() => {
                      switch (filterDefinition.class) {
                        case "discreteList":
                          return <DiscreteList definition={filterDefinition} />;

                        case "categoricalRangeSelector":
                          return <CategoricalRangeSelector definition={filterDefinition} />;

                        case "numericRangeSelector":
                          return <NumericRangeSelector definition={filterDefinition} />;

                        case "booleanList":
                          return <BooleanList definition={filterDefinition} />;
                      }
                    })()
                )}
              </Grid>
              <Grid className={"no_padding_grid"} item md={1}>
                {filterTopics.map((activity, index) => (
                  <HSBar height={47.3} data={this.state.filterData[index]} />
                ))}
              </Grid>
            </Grid>
          </div>
        </React.Fragment>
      );
  }
}
