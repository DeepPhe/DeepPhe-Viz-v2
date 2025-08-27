import React from "react";
import Grid from "@material-ui/core/Grid";
import DiagnosisChart from "./DiagnosisChart";
import BiomarkerOverview from "./BiomarkerOverview";
import PatientsWithBiomarkersFound from "./PatientsWithBiomarkersFound";


// const baseUri = "http://localhost:3001";
const baseGuiUri = "http://localhost:3000/deepphe";
// const transitionDuration = 800; // time in ms

export default class DerivedChart extends React.Component {
    state = {

        title: false,
    };


    // getCohortData = () => {
    //     const that = this;
    //     fetch(baseUri + '/api/cohortData').then(response => response.json()).then(cohortData => {
    //
    //         // that.setState({data: cohortData}, () => {
    //             let patientData = that.state.data.patients;
    //             patientData.sort((a, b) => a.firstEncounterAge.localeCompare(b.firstEncounterAge));
    //             let youngest = patientData[0].firstEncounterAge;
    //             let oldest = patientData[patientData.length - 1].firstEncounterAge;
    //             patientData.sort((a, b) => a.patientId.localeCompare(b.patientId));
    //             that.setState({title: "Patients (" + patientData.length + " Patients w/ First Encounter Age Between " + youngest + " and " + oldest + ")"});
    //             that.setState({patients: patientData});
    //      //   });
    //     })
    // }

    componentDidMount() {
        //  this.getCohortData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    
    }

    render() {
        return (
            <React.Fragment>
                <div id="patients">
                    <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
                            <ul id="patient_list">
                        {this.props.patientsAndStagesInfo.patients.map((patient, index) => (
                            <li key={index}>
                                <a  id={patient.patientId} className="target_patient"
                                   href={baseGuiUri + "/./patient/" + patient.patientId}
                                   target="_blank" rel="noopener noreferrer"
                                   style={{ color: "blue" }}>{patient.patientId}</a>({patient.firstEncounterAge})
                            </li>

                        ))}
                            </ul>
                        </Grid>


                    <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
                        <DiagnosisChart
                            loading={this.props.isLoading}
                            patientsAndStagesInfo={this.props.patientsAndStagesInfo}
                            patientsAndStagesInfoSetter={this.props.setPatientsAndStagesInfo}
                            minAge={this.props.minAge}
                            maxAge={this.props.maxAge}>
                        </DiagnosisChart>
                    </Grid>
                </Grid>
            </div>

                 <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                     <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                         <BiomarkerOverview
                             loading={this.props.isLoading}
                             patientsAndStagesInfo={this.props.patientsAndStagesInfo}
                             patientsAndStagesInfoSetter={this.props.patientsAndStagesInfoSetter}
                             minAge={this.props.minAge}
                             maxAge={this.props.maxAge}>
                         </BiomarkerOverview>
                     </Grid>
                     <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                         <PatientsWithBiomarkersFound
                             loading={this.props.isLoading}
                             patientsAndStagesInfo={this.props.patientsAndStagesInfo}
                             patientsAndStagesInfoSetter={this.props.patientsAndStagesInfoSetter}
                             minAge={this.props.minAge}
                             maxAge={this.props.maxAge}>
                         </PatientsWithBiomarkersFound>
                     </Grid>
                 </Grid>
            </React.Fragment>
        );

    }
}

