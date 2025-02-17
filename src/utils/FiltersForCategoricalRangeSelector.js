const getPatientsInRange = (patientCountsByCategory, selectedCategoricalRange) => {
  return patientCountsByCategory.map((item, idx) => {
    if (selectedCategoricalRange.includes(item.category)) {
      return item.patients;
    } else {
      return [];
    }
  });
};

const getPatientsMatchingSingleFilter = (definition, patients) => {
  return getPatientsInRange(
    definition.patientCountsByCategory,
    definition.selectedCategoricalRange
  );
};

const getPatientsinThisFilterMatchingAllOtherFilters = (
  patientsInRange,
  patientsMatchingAllFilters,
  includes
) => {
  return patientsInRange.map((range) => {
    return range.filter((patient) => {
      if (includes) return patientsMatchingAllFilters.includes(patient);
      else return !patientsMatchingAllFilters.includes(patient);
    });
  });
};

export { getPatientsMatchingSingleFilter, getPatientsinThisFilterMatchingAllOtherFilters };
