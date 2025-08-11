import React from "react";
import PropTypes from "prop-types";
import "./PatientDemographics.css";

function PatientDemographics({ patientId }) {
  // Your existing component rendering code
  return (
    <div className="patient-demographics-container">
      <h2>Patient Demographics</h2>
      <div className="patient-id-section">
        <h3>Patient ID: {patientId || "Unknown"}</h3>
      </div>
      {/* Rest of your component with optional chaining to handle missing fields */}
    </div>
  );
}

PatientDemographics.propTypes = {
  patientId: PropTypes.string.isRequired,
};

export default PatientDemographics;
