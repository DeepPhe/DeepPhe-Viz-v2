import * as FiltersForCategoricalRangeSelector from "./FiltersForCategoricalRangeSelector";
import { fastIntersection } from "./arrayHelpers";

const FilterPatients = (patients, uniquePatientIds, definitions, wantLogs) => {
  return new Promise((resolve, reject) => {
    const getPatientsMatchingSingleFilter = (definition) => {
      return FiltersForCategoricalRangeSelector.getPatientsMatchingSingleFilter(
        definition,
        patients
      );
    };

    const filterArrays = definitions.map((filter) => {
      if (filter.enabled) {
        const patientsMatchingSingleFilter = getPatientsMatchingSingleFilter(filter);
        if (wantLogs) console.log(patientsMatchingSingleFilter);
        return patientsMatchingSingleFilter;
      } else {
        return uniquePatientIds;
      }
    });
    if (wantLogs)
      console.log(`patientsMatchingThisFilter: ${filterArrays} (${filterArrays.length})`);
    const filterArraysFlat = filterArrays.map((array) => {
      return array.flat();
    });
    const patientsMatchingAllFilters = fastIntersection(...filterArraysFlat).sort();
    if (wantLogs)
      console.log(
        `patientsMatchingAllFilters: ${patientsMatchingAllFilters} (${patientsMatchingAllFilters.length})`
      );
    const filterData = definitions.map((filter, filterIdx) => {
      if (filter.enabled) {
        const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters = Array.from(
          new Set(
            FiltersForCategoricalRangeSelector.getPatientsinThisFilterMatchingAllOtherFilters(
              filterArrays[filterIdx],
              patientsMatchingAllFilters,
              true
            ).flat()
          )
        ).sort();
        const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory =
          filter.patientCountsByCategory.map((item, idx) => {
            return item.patients.filter((patient) =>
              patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters.includes(patient)
            ).length;
          });

        if (wantLogs)
          console.log(
            `patientsInThisFilterMatchingAllOtherFilters: ${patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters} (${patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters.length})`
          );
        const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters = Array.from(
          new Set(
            FiltersForCategoricalRangeSelector.getPatientsinThisFilterMatchingAllOtherFilters(
              filterArrays[filterIdx],
              patientsMatchingAllFilters,
              false
            ).flat()
          )
        ).sort();
        if (wantLogs)
          console.log(
            `patientsInThisFileNotMatchingAllOtherFilters: ${patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters} (${patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters.length})`
          );
        const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory =
          filter.patientCountsByCategory.map((item, catIdx) => {
            return item.patients.filter((patient) =>
              patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters.includes(
                patient
              )
            ).length;
          });
        const patientsInThisFilterAndNotMatchingThisFilter = Array.from(
          filter.patientCountsByCategory
            .map((item, catIdx) => {
              const patientsMatchingThisFilter = filterArrays[filterIdx].flat();
              return item.patients.filter(
                (patient) => !patientsMatchingThisFilter.includes(patient)
              );
            })
            .flat()
        ).sort();
        const patientsInThisFilterAndNotMatchingThisFilterByCategory =
          filter.patientCountsByCategory.map((item, idx) => {
            return item.patients.filter((patient) =>
              patientsInThisFilterAndNotMatchingThisFilter.includes(patient)
            ).length;
          });
        return {
          filter: filter.fieldName,
          patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters:
            patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters,
          patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory:
            patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory,
          patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory:
            patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory,
          patientsInThisFilterAndNotMatchingThisFilter:
            patientsInThisFilterAndNotMatchingThisFilter,
          patientsInThisFilterAndNotMatchingThisFilterByCategory:
            patientsInThisFilterAndNotMatchingThisFilterByCategory,
        };
      } else {
        const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters = [];
        const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory = [];
        const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory = [];
        const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters = [];
        const patientsInThisFilterAndNotMatchingThisFilter = [];
        const patientsInThisFilterAndNotMatchingThisFilterByCategory =
          filter.patientCountsByCategory.map((item) => item.patients.length);
        return {
          filter: filter.fieldName,
          patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters:
            patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters,
          patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory:
            patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory,
          patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory:
            patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory,
          patientsInThisFilterAndNotMatchingThisFilter:
            patientsInThisFilterAndNotMatchingThisFilter,
          patientsInThisFilterAndNotMatchingThisFilterByCategory:
            patientsInThisFilterAndNotMatchingThisFilterByCategory,
        };
      }
    });
    resolve({ filterData: filterData, patientsMatchingAllFilters: patientsMatchingAllFilters });
  });
};

export default FilterPatients;
