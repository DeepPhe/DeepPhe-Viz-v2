import * as FiltersForCategoricalRangeSelector from "./FiltersForCategoricalRangeSelector";

const filterPatients = (patients, uniquePatientIds, definitions, wantLogs) => {
  return new Promise((resolve, reject) => {
    if (wantLogs) console.log("filterPatients", patients, uniquePatientIds, definitions);
    const getPatientsMatchingSingleFilterPromise = (definition) => {
      return new Promise((resolve, reject) => {
        if (wantLogs) console.log("getPatientsMatchingSingleFilter", definition);
        resolve(
          //add these to a lookup object
          FiltersForCategoricalRangeSelector.getPatientsMatchingSingleFilter(definition, patients)
        );
      });
    };

    const getFilterArrayPromises = () => {
      return definitions.map((filter) => {
        if (filter.enabled) {
          return getPatientsMatchingSingleFilterPromise(filter);
        } else {
          return new Promise((resolve, reject) => {
            resolve(uniquePatientIds);
          });
        }
      });
    };

    // Flatten filterArrays if they contain nested arrays
    const getFilterArrayLookupObjectPromises = (filterArrays) => {
      return filterArrays.map((filterArray) => {
        return new Promise((resolve) => {
          const filterArrayLookupObject = {};
          // Check if filterArray is nested and flatten if needed
          const flatArray = Array.isArray(filterArray[0]) ? filterArray.flat() : filterArray;

          flatArray.forEach((patient) => {
            // Ensure patient is a scalar value, not an array
            if (!Array.isArray(patient)) {
              filterArrayLookupObject[patient] = true;
            }
          });
          resolve(filterArrayLookupObject);
        });
      });
    };

    let timerStart = performance.now();
    const filterArrays = Promise.all(getFilterArrayPromises());
    let timerEnd = performance.now();
    console.log("Filter arrays created in", timerEnd - timerStart, "ms");
    const patientsMatchingAllFilters = new Set();
    filterArrays.then((filterArrays) => {
      console.log(filterArrays);
      timerStart = performance.now();
      Promise.all(getFilterArrayLookupObjectPromises(filterArrays)).then(
        (filterArrayLookupObjects) => {
          timerEnd = performance.now();
          console.log("Filter lookup objects created in", timerEnd - timerStart, "ms");
          // Check if each patient is in ALL filter arrays
          uniquePatientIds.forEach((patientId) => {
            let inAllFilters = true;

            // Must be in every filter to be included
            for (const obj of filterArrayLookupObjects) {
              if (!obj[patientId]) {
                debugger;
                inAllFilters = false;
                break;
              }
            }

            if (inAllFilters) {
              patientsMatchingAllFilters.add(patientId); // correct method is 'add', not 'append'
            }
          });

          if (wantLogs)
            console.log(
              `patientsMatchingAllFilters: ${patientsMatchingAllFilters} (${patientsMatchingAllFilters.length})`
            );
          const filterData = definitions.map((filter, filterIdx) => {
            if (filter.enabled) {
              debugger;
              const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters =
                Array.from(
                  new Set(
                    FiltersForCategoricalRangeSelector.getPatientsinThisFilterMatchingAllOtherFilters(
                      filterArrays[filterIdx],
                      patientsMatchingAllFilters,
                      true
                    ).flat()
                  )
                );
              let nextLookup = {};
              patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters.forEach(
                (patient) => {
                  nextLookup[patient] = true;
                }
              );
              const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory =
                filter.patientCountsByCategory.map((item, idx) => {
                  return item.patients.filter((patient) => nextLookup[patient]).length;
                });

              if (wantLogs)
                console.log(
                  `patientsInThisFilterMatchingAllOtherFilters: ${patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters} (${patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters.length})`
                );
              const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters =
                Array.from(
                  new Set(
                    FiltersForCategoricalRangeSelector.getPatientsinThisFilterMatchingAllOtherFilters(
                      filterArrays[filterIdx],
                      patientsMatchingAllFilters,
                      false
                    ).flat()
                  )
                );
              nextLookup = {};
              patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters.forEach(
                (patient) => {
                  nextLookup[patient] = true;
                }
              );
              if (wantLogs)
                console.log(
                  `patientsInThisFileNotMatchingAllOtherFilters: ${patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters} (${patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters.length})`
                );

              const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory =
                filter.patientCountsByCategory.map((item, catIdx) => {
                  return item.patients.filter((patient) => nextLookup[patient]).length;
                });
              nextLookup = {};
              filterArrays[filterIdx].forEach((array) => {
                array.forEach((patient) => {
                  nextLookup[patient] = true;
                });
              });
              const patientsInThisFilterAndNotMatchingThisFilter = Array.from(
                filter.patientCountsByCategory
                  .map((item, catIdx) => {
                    const patientsMatchingThisFilter = filterArrays[filterIdx].flat();
                    return item.patients.filter((patient) => !nextLookup[patient]);
                  })
                  .flat()
              );
              nextLookup = {};
              patientsInThisFilterAndNotMatchingThisFilter.forEach((patient) => {
                nextLookup[patient] = true;
              });
              const patientsInThisFilterAndNotMatchingThisFilterByCategory =
                filter.patientCountsByCategory.map((item, idx) => {
                  return item.patients.filter((patient) => nextLookup[patient]).length;
                });
              return {
                filter: filter.fieldName,
                patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters:
                  patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters,
                patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory:
                  patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory,
                patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters:
                  patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters,
                patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory:
                  patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory,
                patientsInThisFilterAndNotMatchingThisFilter:
                  patientsInThisFilterAndNotMatchingThisFilter,
                patientsInThisFilterAndNotMatchingThisFilterByCategory:
                  patientsInThisFilterAndNotMatchingThisFilterByCategory,
              };
            } else {
              const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFilters = [];
              const patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory =
                [];
              const patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory =
                [];
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
                patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters:
                  patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFilters,
                patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory:
                  patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory,
                patientsInThisFilterAndNotMatchingThisFilter:
                  patientsInThisFilterAndNotMatchingThisFilter,
                patientsInThisFilterAndNotMatchingThisFilterByCategory:
                  patientsInThisFilterAndNotMatchingThisFilterByCategory,
              };
            }
          });
          resolve({
            filterData: filterData,
            patientsMatchingAllFilters: patientsMatchingAllFilters,
          });
        }
      );
    });
  });
};

export default filterPatients;
