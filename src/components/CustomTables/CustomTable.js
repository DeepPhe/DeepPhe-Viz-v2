import React from "react";
import { withRouter } from "react-router-dom";

class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ptId: null,
      ptName: null,
      ptAgeB: null,
      ptAgeE: null,
    };
  }

  processResponse = (response) => {
    let arr = response.patients;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]["patientId"] === this.props.match.params.patientId) {
        let item = arr[i];
        this.setState({
          ptId: item["patientId"],
          ptName: item["patientName"],
          ptAgeB: item["firstEncounterAge"],
          ptAgeE: item["lastEncounterAge"],
        });
        break;
      }
    }
  };

  componentDidMount() {
    const fetchData = async () => {
      return new Promise(function (resolve, reject) {
        fetch("http://localhost:3001/api/cohortData").then(function (response) {
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
    return (
      <div className="Table" id="table">
        <table className="table">
          <thead>
            <tr>
              <th className="th">{"ID"}</th>
              <th className="th">{"Name"}</th>
              <th className="th">{"Age of first encounter"}</th>
              <th className="th">{"Age of last encounter"}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{this.state.ptId}</td>
              <td>{this.state.ptName}</td>
              <td>{this.state.ptAgeB}</td>
              <td>{this.state.ptAgeE}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(CustomTable);
