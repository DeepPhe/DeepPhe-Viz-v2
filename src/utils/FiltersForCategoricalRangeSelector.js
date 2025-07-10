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
      return includes && patientsMatchingAllFilters.has(patient);
    });
  });
};

export { getPatientsMatchingSingleFilter, getPatientsinThisFilterMatchingAllOtherFilters };
