import * as d3 from "d3v4";
import React from "react";
import ToggleSwitch from "../CustomButtons/ToggleSwitch";
import {snakeCase} from "lodash";
import './CohortFilter.css';
import Grid from "@material-ui/core/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import {ChangeResult} from "multi-range-slider-react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import $ from 'jquery';
import DiscreteList from "./subcomponents/DiscreteList";
import CategoricalRangeSelector from "./subcomponents/CategoricalRangeSelector";
import NumericRangeSelector from "./subcomponents/NumericRangeSelector";
import BooleanList from "./subcomponents/BooleanList";

const filterTopics = [
    'Diagnosis', 'Stage', 'Age at Dx', 'Metastasis', 'Agents', 'Comorbidity',
];

const ageRangeLookup = new Object;
ageRangeLookup[0] = "0-10";
ageRangeLookup[1] = "10-20";
ageRangeLookup[2] = "20-30";
ageRangeLookup[3] = "30-40";
ageRangeLookup[4] = "40-50";
ageRangeLookup[5] = "50-60";
ageRangeLookup[6] = "60-70";
ageRangeLookup[7] = "70-80";
ageRangeLookup[8] = "80-90";
ageRangeLookup[9] = "90-100";
ageRangeLookup[10] = "100-110";
ageRangeLookup[11] = "110-120";

const stageRangeLookup = new Object;
stageRangeLookup[0] = "0";
stageRangeLookup[1] = "I";
stageRangeLookup[2] = "II";
stageRangeLookup[3] = "III";
stageRangeLookup[4] = "IV";
stageRangeLookup[5] = "V";
stageRangeLookup[6] = "VI";
stageRangeLookup[7] = "VII";

// const Root = props => (
//     <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
// );
// const Label = props => (
//     <Legend.Label {...props} sx={{ whiteSpace: 'nowrap' }} />
// );
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
        diagnosis: []
    }


    reset = () => {
        const that = this;
        const fetchData = async () => {
            return new Promise(function (resolve, reject) {
                fetch('http://localhost:3001/api/filter/definitions').then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject('User not logged in');
                    }
                });
            });
        }

        fetchData().then(function (response) {
            response.json().then(function (json) {
                that.setState({filterDefinitions: json});
                that.setState({loading: false})
                that.updateDimensions()
            })
        })
    }

    updateDimensions = () => {
        const newWidth = document.getElementById('biomarkers').clientWidth;
        //  this.setState({width: newWidth, height: 350});
        let it = d3.select(".biomarkers_overview_chart")
        // it._groups[0][0].setAttribute("width", newWidth)

    };
    //
    // handleDateChange = (e: ChangeResult) => {
    //
    //     console.log("date change:" + e);
    // };


    buildQuery = () => {
        const getStageValuesForRange = (min, max) => {
            let stageValues = []
            for (let i = min; i <= max; i++) {
                stageValues.push(stageRangeLookup[i])
            }
            return stageValues
        }

        const getAgeValuesForRange = (min, max) => {
            let ageValues = []
            for (let i = min; i <= max; i++) {
                ageValues.push(ageRangeLookup[i])
            }
            return ageValues
        }
        let query = new Object()
        if (this.state.selectedStages) {
            query.stages = getStageValuesForRange(this.state.selectedStages[0], this.state.selectedStages[1] - 1)
        }
        if (this.state.selectedAges) {
            query.ages = getAgeValuesForRange(this.state.selectedAges[0], this.state.selectedAges[1] - 2)
        }
        console.log("Stages: " + query.stages)
        console.log("Stages: " + query.ages)
        // this.props.onQueryChange(query)
    }


    componentDidMount() {
        let cohortSize = [{
            value: 5,
            description: "5",
            color: "blue"
        }, {
            value: 95,
            description: "",
            color: "lightgray"
        }]

        let filterDatas = new Array(filterTopics.length)

        filterTopics.forEach((topic, i) => {
            filterDatas[i] = [{
                value: Math.random(20),
                description: "",
                color: "blue"
            },
                {
                    value: Math.random(20),
                    description: "",
                    color: "lightblue"
                },
                {
                    value: Math.random(20),
                    description: "",
                    color: "lightgray"
                }]
        })

        this.setState({filterData: filterDatas, cohortSize: cohortSize, isLoading: false}, () => {
            this.show("new_control_svg");
        })
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    //given a filter word, return the index of the filter word in the filterTopics array
    getFilterIndex = (filterWord) => {
        for (let i = 0; i < filterTopics.length; i++) {
            if (filterTopics[i] === filterWord) {
                return i;
            }
        }
        return -1;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.filterDefinitions !== this.state.filterDefinitions) {
            this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
                console.log(e.fieldName)
            })

        }
    }

    onUpdate(vals) {
        console.log(vals);
    }

    show = (svgContainerId) => {
        console.log("calling reset")
        this.reset()
        if (!d3.select("#" + svgContainerId).empty()) {
            d3.select("#" + svgContainerId)._groups[0][0].remove();
        }
        const svgWidth = "100%"; //Math.max(300, this.state.width);
        const svgHeight = "100%";
        const chart = d3.select(".new_control_group").append("svg").attr("id", svgContainerId).attr("width", svgWidth).attr("height", svgHeight);
        let innerChart = chart.append("g")

    };



    // handleAgeChange = (e: ChangeResult) => {
    //     this.setState({selectedAges: e})
    //     this.buildQuery()
    // };
    //
    // handleRangeChange = (name, e: ChangeResult) => {
    //     this.setState({[name]: e})
    //     this.buildQuery()
    // };

    handleToggleSwitch = (switchId) => ({enabled}) => {
        console.log("Switch id: " + switchId + " enabled: " + enabled)
        this.setState({[switchId]: enabled})
    };

    toggleActivityEnabled = activity => ({enabled}) => {

        const selector = "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"
        if (enabled) {
            $(selector).removeClass("overlay-row")
        } else {
            $(selector).addClass("overlay-row")
        }


        // let {only} = this.state;
        //
        // if (enabled && !only.includes(activity)) {
        //     only.push(activity);
        //     return this.setState({only});
        // }
        //
        // if (!enabled && only.includes(activity)) {
        //     only = only.filter(item => item !== activity);
        //     return this.setState({only});
        // }
    }


    buildComponent = (props) => {
        return (<HSBar
            //showTextIn
            max={100}
            height={47.3}
            data={this.state.cohortSize}
        />);
    }
    CohortPercentHSBar = (props) => {
        return (<HSBar
            //showTextIn
            max={100}
            height={47.3}
            data={this.state.cohortSize}
        />);
    }




    CategoryRangeSelector = (filterdefinition) => {
        return (
            <div className={"category-range-selector"}>
                {/*<div className={"category-range-selector-title"}>{props.title}</div>*/}
                {/*<div className={"category-range-selector-items"}>*/}
                {/*    {props.items.map((item, index) => (*/}
                {/*        <div className={"category-range-selector-item"} key={index}>{item}</div>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
        )
    }

    NumericRangeSelector = (filterdefinition) => {
        return (
            <div className={"numeric-range-selector"}>
                {/*<div className={"numeric-range-selector-title"}>{props.title}</div>*/}
                {/*<div className={"numeric-range-selector-items"}>*/}
                {/*    {props.items.map((item, index) => (*/}
                {/*        <div className={"numeric-range-selector-item"} key={index}>{item}</div>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
        )
    }

    BooleanList = (filterdefinition) => {
        return (
            <div className={"boolean-list"}>
                {/*<div className={"boolean-list-title"}>{props.title}</div>*/}
                {/*<div className={"boolean-list-items"}>*/}
                {/*    {props.items.map((item, index) => (*/}
                {/*        <div className={"boolean-list-item"} key={index}>{item}</div>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
        )
    }

    render() {
        if (this.state.loading)
            return <div>Data is coming soon...</div>
        else
            return (
                <React.Fragment>
                    <div id="NewControl">
                        <h3></h3>
                        <Grid className={"cohort-size-bar-container"} container direction="row"
                              justifyContent="center" align="center">
                            <Grid className={"no_padding_grid cohort-size-label-container"} item md={1}>
                                <span className={"cohort-size-label"}>Cohort Size</span>
                            </Grid>
                            <Grid className={"cohort-size-label-container"} item md={6}>
                                <this.CohortPercentHSBar/>
                            </Grid>
                            <Grid className={"cohort-size-label-container"} item md={1}/>
                        </Grid>
                        <Grid container direction="row" justifyContent="center" align="center">

                            <Grid className="switch_list no_padding_grid" item md={1}>
                                {/*{filterTopics.map((activity, index) => (*/}
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (
                                    <ToggleSwitch wantsDivs={true} key={index} label={filterDefinition.fieldName}
                                                  theme="graphite-small"
                                                  enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled({filterDefinition})}/>

                                ))}
                            </Grid>
                            <Grid item md={6} className="filter-inner-container no_padding_grid">
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (
                                    (() => {
                                        switch (filterDefinition.class) {
                                            case "discreteList":
                                                return <DiscreteList definition={filterDefinition}/>;

                                            case "categoricalRangeSelector":
                                                return <CategoricalRangeSelector
                                                    definition={filterDefinition}/>;

                                            case "numericRangeSelector":
                                                return <NumericRangeSelector definition={filterDefinition}/>;

                                            case "booleanList":
                                                return <BooleanList definition={filterDefinition}/>;
                                        }
                                    })()
                                ))}
                                {/*<div id={"diagnosis-overlay-row"}>*/}
                                {/*    <div id={"diagnosis-row"} className={"row no-gutter"}>*/}
                                {/*        <span className={"box-for-word-filter blue-border-for-word-filter"}>DCIS</span>*/}
                                {/*        <span className={"box-for-word-filter blue-border-for-word-filter"}>LBC</span>*/}
                                {/*        <span className={"box-for-word-filter add-word-filter-plus blue-plus"}>+</span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<this.DiscreteList title={"Diagnosis"} items={["DCIS", "LBC"]}/>*/}
                                {/*<div id={"stage-overlay-row"}>*/}
                                {/*    <div id={"stage-row"} className={"row filter_center_rows"}>*/}
                                {/*        <div className={"slider-container"}>*/}
                                {/*            <Slider range min={0} max={5} defaultValue={[0, 4]}*/}
                                {/*                    onChange={this.handleStageChange}*/}
                                {/*                    draggableTrack={true} pushable={true} marks={{*/}
                                {/*                0: "0",*/}
                                {/*                1: "I",*/}
                                {/*                2: "II",*/}
                                {/*                3: "III",*/}
                                {/*                4: "VI"*/}
                                {/*            }} dots={false} step={1}/>*/}
                                {/*        </div>*/}

                                {/*        <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small"*/}
                                {/*                      enabled={true}*/}
                                {/*                      onStateChanged={this.toggleActivityEnabled("Unknown")}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div id={"age-at-dx-overlay-row"}>*/}
                                {/*    <div id={"age-at-dx-row"} className={"row filter_center_rows"}>*/}
                                {/*        <div className={"slider-container"}>*/}
                                {/*            <Slider range min={0} max={11} defaultValue={[0, 11]}*/}
                                {/*                    onChange={(e) => this.handleRangeChange("selectedAges", e)}*/}
                                {/*                    draggableTrack={true} pushable={true} marks={{*/}
                                {/*                0: "0",*/}
                                {/*                1: "10",*/}
                                {/*                2: "20",*/}
                                {/*                3: "30",*/}
                                {/*                4: "40",*/}
                                {/*                5: "50",*/}
                                {/*                6: "60",*/}
                                {/*                7: "70",*/}
                                {/*                8: "80",*/}
                                {/*                9: "90",*/}
                                {/*                10: "100"*/}
                                {/*            }} dots={false} step={1}/>*/}
                                {/*        </div>*/}

                                {/*        <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small"*/}
                                {/*                      enabled={true}*/}
                                {/*                      onStateChanged={this.toggleActivityEnabled("Unknown")}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div id={"metastasis-overlay-row"}>*/}
                                {/*    <div id={"metastasis-row"} className={"row filter_center_rows"}>*/}
                                {/*        <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small"*/}
                                {/*                      enabled={true}*/}
                                {/*                      onStateChanged={this.handleToggleSwitch("metastasis present")}/>*/}
                                {/*        <ToggleSwitch wantsDivs={false} label={"Unknown"} theme="graphite-small"*/}
                                {/*                      enabled={true}*/}
                                {/*                      onStateChanged={this.handleToggleSwitch("metastasis unknown")}/>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div id={"agents-overlay-row"}>*/}
                                {/*    <div id={"agents-row"} className={"row no-gutter"}>*/}
                                {/*    <span*/}
                                {/*        className={"box-for-word-filter red-border-for-word-filter"}>Bortezomib/Paclitaxel</span>*/}
                                {/*        <span*/}
                                {/*            className={"box-for-word-filter red-border-for-word-filter"}>CALGLUC/VIT-D/ZOLE</span>*/}
                                {/*        <span className={"box-for-word-filter add-word-filter-plus red-plus"}>+</span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div id={"comorbidity-overlay-row"}>*/}
                                {/*    <div id={"comorbidity-row"} className={"row no-gutter"}>*/}
                                {/*        <span*/}
                                {/*            className={"box-for-word-filter gray-border-for-word-filter"}>Diabetes</span>*/}
                                {/*        <span*/}
                                {/*            className={"box-for-word-filter gray-border-for-word-filter"}>Hypertension</span>*/}
                                {/*        <span className={"box-for-word-filter add-word-filter-plus gray-plus"}>+</span>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </Grid>
                            <Grid className={"no_padding_grid"} item md={1}>
                                {filterTopics.map((activity, index) => (
                                    <HSBar
                                        height={47.3}
                                        data={this.state.filterData[index]}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    </div>
                </React.Fragment>
            )
    }
}

