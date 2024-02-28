import React from "react";
import "./CohortFilter.css";
import HSBar from "react-horizontal-stacked-bar-chart";
import "rc-slider/assets/index.css";
import $ from "jquery";
import { fastIntersection, flattenObject } from "../../../utils/arrayHelpers.js";
import FilterListItem from "./subcomponents/FilterListItem";
import Filter from "./subcomponents/Filter.js";
import Grid from "@mui/material/Grid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import List from "@mui/material/List";
import * as d3 from "d3";

export default class CohortFilter extends React.Component {
  state = {
    filterDefinitionLoading: true,
    patientArraysLoading: true,
    biomarkerData: null,
    handlingDragEnd: false,
    cohortSize: null,
    isLoading: true,
    selectedStages: null,
    selectedAges: null,
    stagePresent: null,
    ageAtDx: null,
    metastisis_present: null,
    metastisis_unknown: null,
    fieldNames: null,
    agents: [],
    comorbidity: [],
    diagnosis: [],
    patientsMeetingAllFilters: [],
    patientsMeetingAllFiltersUpToDate: false,
    patientArrays: null,
    patientArraysNotFlat: null,
    filters: {},
  };
  updateFilterDefinition;

  constructor(props) {
    super(props);
    this.filterChangedState.bind(this);
    // this.moveListItem = this.moveListItem.bind(this);
    // this.handleDragEnd = this.handleDragEnd.bind(this);
  }

  reset = () => {
    const that = this;
    const fetchPatientArrays = async () => {
      return new Promise(function (resolve, reject) {
        fetch(
          "https://gist.githubusercontent.com/JohnLevander/d11ca4e6f43c6ec0d956567cb204c363/raw/53ffde5db9ddefbd1a07a3553a3224f17da610a9/query-results.js"
        ).then(function (response) {
          if (response) {
            resolve(response);
          } else {
            reject("User not logged in");
          }
        });
      });
    };
    const fetchFilterDefinition = async () => {
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

    const fetchPatientArraysPromise = new Promise((resolve, reject) =>
      fetchPatientArrays().then(function (response) {
        response.json().then(function (json) {
          that.setState(
            {
              patientArrays: flattenObject(json, ""),
              patientArraysNotFlat: json,
              patientArraysLoading: false,
            },
            () => {
              resolve(json);
            }
          );
        });
      })
    );

    const fetchFilterDefinitionPromise = new Promise((resolve, reject) => {
      fetchFilterDefinition().then(function (response) {
        response.json().then(function (json) {
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

          that.setState(
            {
              filterDefinitions: json,
              cohortSize: cohortSize,
              isLoading: false,
            },
            () => {
              resolve(json);
            }
          );
        });
      });
    });

    function initFilterData() {
      return new Promise((resolve, reject) => {
        const filterDefinitions = that.state.filterDefinitions.searchFilterDefinition;
        const patientArrays = that.state.patientArrays;
        let filters = {};
        filterDefinitions.forEach((definition, i) => {
          filters[definition.fieldName] = (
            <Filter
              definition={definition}
              patientArrays={patientArrays}
              fieldName={definition.fieldName}
            />
          );
        });
        that.setState({ filters: filters }, () => {
          resolve(true);
        });
      });
    }

    Promise.all([fetchPatientArraysPromise, fetchFilterDefinitionPromise]).then((promises) => {
      initFilterData().then(() => {
        that.updatePatientsMatchingAllFilters().then(() => {
          that.updateFilterData();
        });
      });
    });
  }; // end reset

  updateFilterData = () => {
    const that = this;
    const filterDefinitions = [...this.state.filterDefinitions.searchFilterDefinition];
    filterDefinitions.forEach((definition, i) => {
      //use the patientArrays to get the number of patients that meet the filter
      const numberOfPossiblePatientsForThisFilter =
        definition.numberOfPossiblePatientsForThisFilter;
      let patientsMeetingEntireSetOfFilters = that.state.patientsMeetingAllFilters.length;
      let matchingPatients = [];
      if (definition["selectedCategoricalRange"]) {
        definition.selectedCategoricalRange.forEach((range) => {
          const aryName = definition.fieldName.toLowerCase() + "." + range;
          const ary = that.state.patientArrays[aryName];
          matchingPatients = matchingPatients.concat(ary);
        });
      }
      definition.patientsMeetingThisFilterOnly = matchingPatients.length;

      const patientsMeetingThisFilterOnly = definition.patientsMeetingThisFilterOnly;
      //console.log(that.state.patientsMeetingAllFilters)
      //console.log(fieldName + ": \n\t" + "patientsMeetingEntireSetOfFilters: " + patientsMeetingEntireSetOfFilters + " \n\tpatientsMeetingThisFilterOnly: " + patientsMeetingThisFilterOnly + " \n\tnumberOfPossiblePatientsForThisFilter: " + numberOfPossiblePatientsForThisFilter);
      console.log(
        definition.fieldName +
          ": \n\t" +
          "patientsMeetingEntireSetOfFilters: " +
          patientsMeetingEntireSetOfFilters +
          " \n\tpatientsMeetingThisFilterOnly: " +
          patientsMeetingThisFilterOnly +
          " \n\tnumberOfPossiblePatientsForThisFilter: " +
          numberOfPossiblePatientsForThisFilter
      );
    });
    let cohortSize = [
      {
        value: this.state.patientsMeetingAllFilters.length,
        description: "",
        color: "blue",
      },
      {
        value: 7,
        description: "",
        color: "lightgray",
      },
    ];
    that.setState({
      filterDefinitions: { searchFilterDefinition: filterDefinitions },
      filterDefinitionLoading: false,
      cohortSize: cohortSize,
    });
  };

  updatePatientsMatchingAllFilters = () => {
    return new Promise((resolve, reject) => {
      let matches = {};

      for (const key in this.state.filters) {
        const filter = this.state.filters[key];
        if (filter.enabled) {
          matches[filter.fieldName] = filter.patientsMatchingThisFilter;
        } else {
          matches[filter.fieldName] = [];
        }
      }
      if (Object.keys(matches).length) {
        let arrayOfArraysOfPatientsMatchingEachFilter = [];
        for (const key in matches) {
          if (matches.hasOwnProperty(key)) {
            //console.log(`${key}: ${matches[key]}`);
            arrayOfArraysOfPatientsMatchingEachFilter.push(matches[key]);
          }
        }
        console.log(
          "Matches across all filters: " +
            fastIntersection(...arrayOfArraysOfPatientsMatchingEachFilter)
        );
        this.setState(
          {
            patientsMeetingAllFilters: fastIntersection(
              ...arrayOfArraysOfPatientsMatchingEachFilter
            ),
            patientsMeetingAllFiltersUpToDate: true,
          },
          () => {
            resolve(true);
          }
        );
      }
    });
  };

  CohortPercentHSBar = (props) => {
    return <HSBar showTextIn max={100} height={47.3} data={this.state.cohortSize} />;
  };

  filterChangedState = (definition) => {
    // this.state.filters[definition.fieldName].updateDefinition(definition);
    this.setState(
      {
        patientsMeetingAllFiltersUpToDate: false,
      },
      () => {
        this.updatePatientsMatchingAllFilters().then(() => {
          this.updateFilterData();
        });
      }
    );
  };

  componentDidMount() {
    this.reset();
    if (!d3.select("#" + "new_control_svg").empty()) {
      d3.select("#" + "new_control_svg")._groups[0][0].remove();
    }
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
    if (JSON.stringify(this.state.filters) !== JSON.stringify(nextState.filters)) {
      // nextState.filters.forEach((filter) => {
      //   if (filter.enabled) {
      //     filter.update();
      //   }
      // });
      // console.log("component should update!");
      return true;
    }
    return true;
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    console.log("component updated!");

    //need code to iterate of patientArrays, find the patientArrays that being with the fieldnames in the filterDefinitions,
    //then find the intersection of those arrays, and then update the cohort size bar

    //iterate over filterDefinitions
    //for each filterDefinition, find the patientArray that matches the fieldName

    // if (!this.state.isLoading && !this.state.filterDefinitionLoading && !this.state.patientArraysLoading) {
    //     if (!this.state.patientsMeetingAllFiltersUpToDate) {
    //         // this.updatePatientsMatchingAllFilters();
    //         // this.updateFilterData();
    //
    //     }
    // }

    // if (prevState.filterDefinitions !== this.state.filterDefinitions) {
    //     this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
    //         //console.log(e.fieldName)
    //     })
    //
    // }
  };

  toggleFilterEnabled = (activity) => {
    const selector =
      "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row";
    if (enabled) {
      $(selector).removeClass("overlay-row");
    } else {
      $(selector).addClass("overlay-row");
    }
  };

  filterAndFilterBar = ({ filter, index }) => {
    return new FilterListItem({
      filter: filter,
      index: index,
      moveListItem: this.moveListItem,
      filterChangedState: this.filterChangedState,
      toggleFilterEnabled: this.toggleFilterEnabled,
    });
  };

  moveListItem = (dragIndex, hoverIndex) => {
    const { items } = this.state;
    const dragitem = items[dragIndex];

    this.setState(
      update(this.state, {
        items: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragitem],
          ],
        },
      })
    );
    // You may pass the state to props
    console.log(this.state.items);
  };

  handleDragEnd = (result, that) => {
    if (!result.destination) {
      return;
    }
    that.setState({ handlingDragEnd: true }, () => {
      const removeAndInsert = (array, removeFrom, insertAt) => {
        const item = array.splice(removeFrom, 1);
        return [...array.slice(0, insertAt), item[0], ...array.slice(insertAt)];
      };
      console.log(
        "handleDragEnd - moving " +
          result.draggableId +
          " from " +
          result.source.index +
          " to " +
          result.destination.index
      );

      //filterDefinitions.findIndex((def, idx) => {if (def.fieldName == result.draggableId) return index})
      //  if (filterDefinition.fieldName === result.draggableId) {
      const filterDefinitions = removeAndInsert(
        [...that.state.filterDefinitions.searchFilterDefinition],
        result.source.index,
        result.destination.index
      );

      //}
      //});
      that.setState(
        {
          filterDefinitions: { searchFilterDefinition: filterDefinitions },
        },
        () => {
          that.setState({ handlingDragEnd: false });
        }
      );
    });

    // TODO: Update the state based on the result
  };

  render() {
    if (
      this.state.isLoading ||
      this.state.filterDefinitionLoading ||
      this.state.patientArraysLoading ||
      this.state.handlingDragEnd
    )
      return <div>Data is coming soon...</div>;
    else {
      let filtersArray = [];
      Object.keys(this.state.filters).forEach((key) => {
        filtersArray.push(this.state.filters[key]);
      });
      return (
        <React.Fragment>
          <div id="NewControl">
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
            <Grid
              container
              direction="row"
              display={"block"}
              item
              md={10}
              spacing={0}
              width={"100%"}
              justifyContent={"center"}
            >
              <DragDropContext onDragEnd={(result) => this.handleDragEnd(result, this)}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <List
                      justifyContent={"center"}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {filtersArray.map((filter, index) => (
                        <this.filterAndFilterBar
                          key={index}
                          filter={filter}
                          index={index}
                          moveListItem={this.moveListItem}
                          filterChangedState={this.filterChangedState}
                        />
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Grid>
          </div>
        </React.Fragment>
      );
    }
  }
}
