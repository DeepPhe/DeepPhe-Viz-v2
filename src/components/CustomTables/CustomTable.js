import React from "react";
import { withRouter } from "../../utils/withRouter";
import "./CustomTable.css";

/***
 "PatientID": "fake_patient1",
 "Race": "white",
 "Gender": "female",
 "DateOfBirth": "04-01-1960",
 "CancerType": "BreastCancer",
 "AgeAtDiagnosis": 50,
 "AgeOfFirstEncounter": "04-01-2010"
 ***/
class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patientData: undefined,
      patientId: this.props.patientId,
    };
  }

  processResponse = (response) => {
    let arr = response;
    let patientData = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]["PatientID"] === this.state.patientId) {
        let item = arr[i];
        if (!patientData["PatientID"]) {
          patientData["PatientID"] = {
            PatientID: item["PatientID"],
            ptGender: item["Gender"],
            ptRace: item["Race"],
            ptDob: item["DateOfBirth"],
            Cancers: {},
          };
        }
        patientData["PatientID"]["Cancers"][i] = {
          ptCancerType: item["CancerType"],
          ptAgeAtDiagnosis: item["AgeAtDiagnosis"],
          ptAgeOfFirstEncounter: item["AgeOfFirstEncounter"],
          ptAgeOfLastEncounter: item["AgeOfLastEncounter"],
        };
      }
    }
    this.setState({
      patientData: patientData,
    });
  };

  componentDidMount() {
    const fetchData = async () => {
      return new Promise(function (resolve, reject) {
        fetch("/patient_demographics.json").then(function (response) {
          if (response) {
            resolve(response);
          } else {
            reject("User not logged in");
          }
        });
      });
    };
    fetchData().then((response) =>
      response.json().then((jsonResponse) => this.processResponse(jsonResponse))
    );
  }

  render() {
    if (this.state.patientData === undefined) {
      return <div className="loading">Loading...</div>;
    } else {
      return (
        <div className="Table" id="table">
          <table className="table">
            <thead>
              <tr>
                <th className="th">{"ID"}</th>
                <th className="th">{"Gender"}</th>
                <th className="th">{"DOB"}</th>
                <th className="th">{"Cancer Type"}</th>
                <th className="th">{"Age at Dx"}</th>
                <th className="th">{"Age at First Encounter"}</th>
                <th className="th">{"Age at Last Encounter"}</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(this.state.patientData.PatientID.Cancers).map((item, index) => {
                if (index > 0) {
                  // This will render a new row for each subsequent cancer.
                  // The first 3 columns are empty to align with the patient info columns.
                  return (
                    <tr key={item}>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptCancerType}</td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptAgeAtDiagnosis}</td>
                      <td>
                        {this.state.patientData.PatientID.Cancers[item].ptAgeOfFirstEncounter}
                      </td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptAgeOfLastEncounter}</td>
                    </tr>
                  );
                }
                // For the first cancer, render the cells in the same row as patient info.
                return (
                  <React.Fragment key={item}>
                    <tr key={item}>
                      <td>{this.state.patientData.PatientID.PatientID}</td>
                      <td>{this.state.patientData.PatientID.ptGender}</td>
                      <td>{this.state.patientData.PatientID.ptDob}</td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptCancerType}</td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptAgeAtDiagnosis}</td>
                      <td>
                        {this.state.patientData.PatientID.Cancers[item].ptAgeOfFirstEncounter}
                      </td>
                      <td>{this.state.patientData.PatientID.Cancers[item].ptAgeOfLastEncounter}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  }
}

export default withRouter(CustomTable);
