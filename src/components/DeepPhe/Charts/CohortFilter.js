import React from "react";
import "./CohortFilter.css";
import HSBar from "react-horizontal-stacked-bar-chart";
import "rc-slider/assets/index.css";
import $ from "jquery";
import { fastIntersection, flattenObject } from "../../../utils/arrayHelpers.js";
import DpFilterListItem from "./subcomponents/DpFilterListItem";
import Grid from "@mui/material/Grid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import List from "@mui/material/List";
import * as d3 from "d3";
import ToggleSwitch from "../Buttons/ToggleSwitch";
import ListItem from "@mui/material/ListItem";
import DpFilterList from "./subcomponents/DpFilterList";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";

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
          let patientArr = flattenObject(json, "");
          patientArr["gender.m"] = ["fake_patient1", "fake_patient2"];
          patientArr["gender.f"] = [
            "fake_patient3",
            "fake_patient4",
            "fake_patient5",
            "fake_patient6",
            "fake_patient7",
          ];
          patientArr["city.la"] = ["fake_patient1", "fake_patient2", "fake_patient3"];
          patientArr["city.ny"] = [
            "fake_patient4",
            "fake_patient5",
            "fake_patient6",
            "fake_patient7",
          ];
          Object.keys(patientArr).forEach((key) => {
            const arr = patientArr[key];
            delete patientArr[key];
            patientArr[key.toLowerCase()] = arr;
          });
          that.setState(
            {
              patientArrays: patientArr,
              patientArraysNotFlat: json,
              patientArraysLoading: false,
            },
            () => {
              resolve(flattenObject(json, ""));
            }
          );
        });
      })
    );

    const fetchFilterDefinitionPromise = (patientArrays) => {
      return new Promise((resolve, reject) => {
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

            const addGuiInfo = (obj, definition) => {
              const group = definition.guiOptions.displayGroup;
              const priority = definition.guiOptions.displayPriority;
              const displayName = definition.guiOptions.displayName;
              const name = definition.fieldName;
              if (obj.hasOwnProperty(definition.guiOptions.displayGroup)) {
                obj[group].push({
                  displayName: displayName,
                  group: group,
                  priority: priority,
                  definitionName: name,
                });
              } else {
                obj[group] = [
                  {
                    displayName: displayName,
                    group: group,
                    priority: priority,
                    definitionName: name,
                  },
                ];
              }
              return obj;
            };

            const sortGuiInfo = (guiInfo) => {
              const sorted = {};
              Object.keys(guiInfo).forEach((key) => {
                //sort by priority and then displayName
                sorted[key] = guiInfo[key].sort((a, b) => {
                  if (a.priority < b.priority) return -1;
                  if (a.priority > b.priority) return 1;
                  if (a.displayName < b.displayName) return -1;
                  if (a.displayName > b.displayName) return 1;
                  return 0;
                });
              });
              //apply rules
              return sorted;
            };
            const definitions = json["searchFilterDefinition"];
            let filterGuiInfo = {};
            definitions.forEach((definition) => {
              if (definition.class === "categoricalRangeSelector") {
                definition.categoricalRange = [...definition.selectedCategoricalRange];
              }
              filterGuiInfo = addGuiInfo(filterGuiInfo, definition);
              definition.numberOfPossiblePatientsForThisFilter = that.getPatientsInFilter(
                definition,
                that.state.patientArrays,
                false
              ).length;
              definition.toggleFilterEnabled = that.toggleFilterEnabled;
              //set dilter def?
            });
            const sortedGuiInfo = sortGuiInfo(filterGuiInfo);
            that.setState(
              {
                filterGuiInfo: filterGuiInfo,
                filterGuiInfoKeys: Object.keys(filterGuiInfo),
                filterDefinitions: definitions,
                cohortSize: cohortSize,
                isLoading: false,
                basicEnabled: false,
              },
              () => {
                resolve(json);
              }
            );
          });
        });
      });
    };

    fetchPatientArraysPromise.then((patientArrays) =>
      fetchFilterDefinitionPromise(patientArrays).then(() => {
        that.updatePatientsMatchingAllFilters();
      })
    );
  }; // end reset

  getPatientsInFilter = (definition, patientArrays, matchesOnly) => {
    const getPatientsForArrayName = (name) => {
      return patientArrays[definition.fieldName.toLowerCase() + "." + name.toLowerCase()];
    };
    let matchingPatients = [];
    switch (definition.class) {
      case "discreteList":
        break;
      case "checkboxList":
        definition.checkboxes.forEach((switchDefinition) => {
          // if (switchDefinition.checked || !matchesOnly) {
          //   matchingPatients = matchingPatients.concat(
          //     getPatientsForArrayName(switchDefinition.name)
          //   );
          // }
        });
        break;
      case "categoricalRangeSelector":
        let arr;
        if (!matchesOnly) {
          arr = definition.categoricalRange;
        } else {
          arr = definition.selectedCategoricalRange;
        }
        arr.forEach((range) => {
          matchingPatients = matchingPatients.concat(getPatientsForArrayName(range));
        });
        break;
      case "numericRangeSelector":
        break;
      case "booleanList":
        definition.switches.forEach((switchDefinition) => {
          if (switchDefinition.value || !matchesOnly) {
            matchingPatients = matchingPatients.concat(
              getPatientsForArrayName(switchDefinition.name)
            );
          }
        });
        break;
      default:
        console.log("Unknown filter type", definition.class);
    }
    return matchingPatients;
  };
  updateFilterData = () => {};

  updateFilterCountsAndGetMatches = () => {
    return new Promise((resolve, reject) => {
      let matchesArray = [];

      const filterDefinitions = this.state.filterDefinitions;
      this.state.filterDefinitions.forEach((definition) => {
        const fieldName = definition.fieldName;
        const patientsInFilter = this.getPatientsInFilter(
          definition,
          this.state.patientArrays,
          true
        );
        matchesArray.push(patientsInFilter);
        definition.patientsMeetingThisFilterOnly = patientsInFilter.length;
        //console.log("Patients meeting " + fieldName + " only: " + patientsInFilter.length);
        const idx = filterDefinitions.findIndex((a) => a.fieldName === fieldName);
        this.setState({
          filterDefinitions: {
            ...filterDefinitions,
            [idx]: {
              ...filterDefinitions[idx],
              patientsMeetingThisFilterOnly: patientsInFilter.length,
            },
          },
        });
      });
      this.setState(
        {
          filterDefinitions: filterDefinitions,
        },
        () => {
          resolve(matchesArray);
        }
      );
    });
  };

  getPatientsMeetingEntireSetOfFiltersForFilter(definition, patientsMeetingAllFilters) {
    return new Promise((resolve, reject) => {
      const patientsMatchingThisFilter = this.getPatientsInFilter(
        definition,
        this.state.patientArrays,
        true
      );
      resolve(
        (definition.patientsMeetingEntireSetOfFilters = patientsMeetingAllFilters.filter(
          (patient) => patientsMatchingThisFilter.includes(patient)
        ).length)
      );
    });
  }

  updatePatientsMeetingEntireSetOfFilters = (patientsMeetingAllFilters) => {
    return new Promise((resolve, reject) => {
      const filterDefinitions = this.state.filterDefinitions;
      filterDefinitions.forEach((definition) => {
        this.getPatientsMeetingEntireSetOfFiltersForFilter(
          definition,
          patientsMeetingAllFilters
        ).then((patientsMeetingEntireSetOfFilters) => {
          definition.patientsMeetingEntireSetOfFilters = patientsMeetingEntireSetOfFilters;
        });
      });
      this.setState(
        {
          filterDefinitions: filterDefinitions,
        },
        () => {
          resolve(true);
        }
      );
    });
  };

  updatePatientsMatchingAllFilters = () => {
    return new Promise((resolve, reject) => {
      this.updateFilterCountsAndGetMatches().then((matchesArray) => {
        const patientsMeetingAllFilters = fastIntersection(...matchesArray);
        this.updatePatientsMeetingEntireSetOfFilters(patientsMeetingAllFilters).then(() => {
          //console.log("Patients meeting all filters: " + patientsMeetingAllFilters.length);
          const cohortSize = [
            {
              value: patientsMeetingAllFilters.length,
              description: "",
              color: "blue",
            },
            {
              value: 7,
              description: "",
              color: "lightgray",
            },
          ];
          this.setState(
            {
              patientsMeetingAllFilters: patientsMeetingAllFilters,
              patientsMeetingAllFiltersUpToDate: true,
              filterDefinitionLoading: false,
              cohortSize: cohortSize,
            },
            () => {
              resolve(true);
            }
          );
        });
      });
    });
  };

  CohortPercentHSBar = (props) => {
    return (
      <HSBar
        showTextIn
        max={100}
        height={47.3}
        color="blue"
        data={[
          {
            name: "",
            value: 7,
            description: "",
            color: "green",
          },
        ]}
      />
    );
  };

  filterChangedState = (definition) => {
    if (!this.state.isLoading) {
      this.setState(
        {
          filterDefinitions: this.state.filterDefinitions.map((def) => {
            if (def.fieldName === definition.fieldName) {
              return definition;
            } else {
              return def;
            }
          }),
          patientsMeetingAllFiltersUpToDate: false,
        },
        () => {
          this.updatePatientsMatchingAllFilters().then(() => {});
        }
      );
    }
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
    //if (JSON.stringify(this.state.filters) !== JSON.stringify(nextState.filters)) {
    // nextState.filters.forEach((filter) => {
    //   if (filter.enabled) {
    //     filter.update();
    //   }
    // });
    // console.log("component should update!");
    //   return true;
    //}
    return true;
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    if (
      this.state.isLoading ||
      this.state.filterDefinitionLoading ||
      this.state.patientArraysLoading ||
      this.state.handlingDragEnd
    ) {
    } else {
      if (this.state.basicEnabled) {
        document.getElementById("NewControl").style.display = "none";
        document.getElementById("NewBasicControl").style.display = "block";
      } else {
        document.getElementById("NewControl").style.display = "block";
        document.getElementById("NewBasicControl").style.display = "none";
      }
    }

    //console.log("component updated!");

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
    //     this.state.filterDefinitions.
    //     lterDefinition.forEach((e) => {
    //         //console.log(e.fieldName)
    //     })
    //
    // }
  };

  toggleFilterEnabled = (toggleInfo) => {
    const fieldName = toggleInfo.fieldName;
    const enabled = toggleInfo.enabled;
    const filterDefinitions = this.state.filterDefinitions;
    const selector = "#" + fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row";
    if (enabled) {
      $(selector).removeClass("overlay-row");
    } else {
      $(selector).addClass("overlay-row");
    }
    this.setState(
      {
        filterDefinitions: filterDefinitions.map((def) => {
          if (def.fieldName === fieldName) {
            return {
              ...def,
              enabled: toggleInfo.enabled,
            };
          } else {
            return def;
          }
        }),
      },
      () => {
        this.updatePatientsMatchingAllFilters().then(() => {});
      }
    );
  };

  moveListItem = (dragIndex, hoverIndex) => {
    const { items } = this.state;
    const dragitem = items[dragIndex];

    this.setState(
      update(this.state, {
        filterDefinitions: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragitem],
          ],
        },
      })
    );
    // You may pass the state to props
    //console.log(this.state.items);
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
        [...that.state.filterDefinitions],
        result.source.index,
        result.destination.index
      );

      //}
      //});
      that.setState(
        {
          filterDefinitions: filterDefinitions,
        },
        () => {
          that.setState({ handlingDragEnd: false });
        }
      );
    });

    // TODO: Update the state based on the result
  };
  handleToggleSwitch = (enabled) => {
    this.setState({ basicEnabled: enabled.enabled });
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
      let simpleInterface = [];
      // simpleInterface.push(this.state.filterDefinitions.findIndex((a) => a.fieldName === "gender"));
      simpleInterface.push(this.state.filterDefinitions.findIndex((a) => a.fieldName === "age"));
      simpleInterface.push(this.state.filterDefinitions.findIndex((a) => a.fieldName === "city"));
      const that = this;
      return (
        <React.Fragment>
          <Grid
            container
            direction="row"
            justifyContent="center"
            align="center"
            spacing={0}
            width={"100%"}
          >
            <List>
              {this.state.patientsMeetingAllFilters.map((patient) => (
                <ListItem key={patient} primaryText={patient} />
              ))}
            </List>
          </Grid>
          {/*<div id={"switcher"}>*/}
          {/*  <Grid*/}
          {/*    container*/}
          {/*    direction="row"*/}
          {/*    justifyContent="center"*/}
          {/*    align="center"*/}
          {/*    spacing={0}*/}
          {/*    width={"100%"}*/}
          {/*  >*/}
          {/*    <ToggleSwitch*/}
          {/*      key={134}*/}
          {/*      wantsdivs={0}*/}
          {/*      label={"Complete / Basic"}*/}
          {/*      theme="graphite-small"*/}
          {/*      enabled={this.state.basicEnabled}*/}
          {/*      onStateChanged={this.handleToggleSwitch}*/}
          {/*    />*/}
          {/*  </Grid>*/}
          {/*</div>*/}

          <div id={"NewBasicControl"}></div>

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
              {/*<Grid className={"cohort-size-label-container"} item md={6}>*/}
              {/*  <this.CohortPercentHSBar />*/}
              {/*</Grid>*/}
              <Grid className={"cohort-size-label-container"} item md={1} />
            </Grid>
            {/*<Grid*/}
            {/*  id={"filter-list-container"}*/}
            {/*  container*/}
            {/*  direction="row"*/}
            {/*  display={"flex"}*/}
            {/*  item*/}
            {/*  md={12}*/}
            {/*  spacing={0}*/}
            {/*  width={"100%"}*/}
            {/*>*/}
            {this.state.filterGuiInfoKeys.map((guiInfo, index) => (
              <DpFilterList
                key={index}
                guiInfo={guiInfo}
                filterGuiInfo={this.state.filterGuiInfo}
                filterGuiInfoKeys={this.state.filterGuiInfoKeys}
                filterDefinitions={this.state.filterDefinitions}
                filterChangedState={this.filterChangedState}
                moveListItem={this.moveListItem}
              />
            ))}
            {/*</Grid>*/}
          </div>
        </React.Fragment>
      );
    }
  }
}
