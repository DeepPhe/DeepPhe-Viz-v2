import React, {useEffect, useMemo, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import PatientFirstEncounterAgePerStageChart from "./PatientFirstEncounterAgePerStageChart";
import PatientCountPerStageChart from "./PatientCountPerStageChart";
import {styled} from "@material-ui/core";
import DerivedChart from "./DerivedChart";
import CohortFilter from "./CohortFilter";

const TopCharts = () => {


    const [patientsAndStagesInfo, setPatientsAndStagesInfo] = useState({});
    const [selectedStage, setSelectedStage] = useState("All Stages");

    const [isLoading, setIsLoading] = useState(true);

    const maxAge = useMemo(
        () => {
            if (Object.keys(patientsAndStagesInfo).length !== 0) {
                const ages = patientsAndStagesInfo.stagesInfo.map(el => el.patients.map(el2 => el2.firstEncounterAge)).flat()
                return ages.toSorted().toReversed().at()
            } else {
                return 0
            }
        },
        [patientsAndStagesInfo]
    )
    const minAge = useMemo(
        () => {
            if (Object.keys(patientsAndStagesInfo).length !== 0) {
                const ages = patientsAndStagesInfo.stagesInfo.map(el => el.patients.map(el2 => el2.firstEncounterAge)).flat()
                return ages.toSorted().at()
            } else {
                return 1000
            }
        },
        [patientsAndStagesInfo]
    )


    const Button = styled('button')({

    });


    useEffect(() => {
        reset();
    }, [])

    function reset() {
        const fetchData = async () => {
            return new Promise(function (resolve, reject) {
                fetch('http://localhost:3001/api/cohortData').then(function (response) {
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
                const newPatientsAndStagesInfo = {patients: json.patients, stagesInfo: json.stagesInfo}
                setPatientsAndStagesInfo(newPatientsAndStagesInfo)
                setIsLoading(false)

            })
        })
    }

    function clickMe() {
        reset();
    }

    if (isLoading) {
        return <div>Data is coming soon...</div>
    } else {
        return (
            <>
                <Grid container direction="row" justifyContent="center" align="center" spacing={10}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {/*<CohortFilter></CohortFilter>*/}
                    </Grid>
                </Grid>
                <Grid container direction="row" justifyContent="center" align="center" spacing={10}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Button id={"reset_button"} onClick={clickMe}>Reset Filters</Button>
                    </Grid>
                </Grid>
                <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                    <Grid item xs={10} sm={5} md={5} lg={5} xl={5}>
                        <Card id={"chart1"}>
                            <CardHeader className={'basicCardHeader'}>Patient Age of First Encounter Per
                                Stage</CardHeader>
                            <CardBody className={'basicCard'}>
                                <PatientFirstEncounterAgePerStageChart
                                    loading={isLoading}
                                    patientsAndStagesInfo={patientsAndStagesInfo}
                                    patientsAndStagesInfoSetter={setPatientsAndStagesInfo}
                                    minAge={minAge}
                                    maxAge={maxAge}
                                    docId={"pfe-chart"}/>
                            </CardBody>
                        </Card>
                    </Grid>
                    <Grid item xs={10} sm={5} md={5} lg={5} xl={5}>
                        <Card id={"chart2"}>
                            <CardHeader className={'basicCardHeader'}>Cases Matching Inclusion Criteria</CardHeader>
                            <CardBody className={'basicCard'}>
                                <PatientCountPerStageChart
                                    loading={isLoading}
                                    patientsAndStagesInfo={patientsAndStagesInfo}
                                    patientsAndStagesInfoSetter={setPatientsAndStagesInfo}
                                    minAge={minAge}
                                    maxAge={maxAge}
                                    selectedStage={selectedStage}
                                    selectedStageSetter={setSelectedStage}
                                    docId={"pcps-chart"}/>
                            </CardBody>
                        </Card>
                    </Grid>
                </Grid>
                <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                    <Grid item xs={10} sm={10} md={10} lg={10} xl={10}>
                        <Card id={"chart3"}>
                            <CardHeader className={'basicCardHeader'}>Case Details Given Age and Inclusion Criteria</CardHeader>
                            <CardBody >
                                <DerivedChart
                                    loading={isLoading}
                                    patientsAndStagesInfo={patientsAndStagesInfo}
                                    patientsAndStagesInfoSetter={setPatientsAndStagesInfo}
                                    minAge={minAge}
                                    maxAge={maxAge}

                                    />
                            </CardBody>
                        </Card>
                    </Grid>
                </Grid>
            </>);
    }
}

export default TopCharts;
