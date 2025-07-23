import React from "react";
import Patient from "./Patient.js";
import { useLocation } from "react-router-dom";

function PatientLayout(props) {
  const location = useLocation();
  const db = location.state?.db;

  return (
    <React.Fragment>
      <div id={"patients-charts"}>
        <Patient db={db} />
      </div>
    </React.Fragment>
  );
}

export default PatientLayout;
