import { fastIntersection } from "./arrayHelpers";
import { initFilterDefinitions } from "./FilterDefinitions";

const fetchFilterDefinitions = () => {
  return new Promise(function (resolve, reject) {
    fetch("http://localhost:3001/api/filter/definitions").then(function (response) {
      if (response) {
        response.json().then(function (json) {
          resolve(json["searchFilterDefinition"]);
        });
      } else {
        reject("User not logged in");
      }
    });
  });
};

const initializeFilterDefinitions = (filterDefinitions, patientArrays) => {
  return initFilterDefinitions(filterDefinitions, patientArrays);
};

// getPatientIdsWithAllAttributes(db).then((allAttributesArray) => {
//   console.log("All attributes array:", allAttributesArray);
//   //write allAttributesArray to a file
//
//   //
//   filterAttribIds(allAttributesArray, ["T Stage", "N Stage", "M Stage"]).then((tnmArray) => {
//     debugger;
//     setGlobalPatientCountsForCategories2(definitions, tnmArray);
//   });
// });

const getPatientsInFilter = (definition, patientArrays, matchesOnly) => {
  const getPatientsForArrayName = (name) => {
    const arrayRow = name;
    console.log("Array row:", arrayRow);
    return patientArrays[arrayRow];
  };
  let matchingPatients = [];
  switch (definition.class) {
    case "discreteList":
      break;
    case "checkboxList":
      definition.checkboxes.forEach((switchDefinition) => {
        // if (switchDefinition.checked || !matchesOnly) {
        //   matchingPatients = matchingPatients.concat(
        //     getPatientsForArrayName(switchDefinition.name)
        //   );
        // }
      });
      break;
    case "categoricalRangeSelector":
      let arr;
      arr = definition.selectedCategoricalRange;

      arr.forEach((range) => {
        matchingPatients = matchingPatients.concat(getPatientsForArrayName(range));
      });
      break;
    case "numericRangeSelector":
      break;
    case "booleanList":
      definition.switches.forEach((switchDefinition) => {
        if (switchDefinition.value || !matchesOnly) {
          matchingPatients = matchingPatients.concat(
            getPatientsForArrayName(switchDefinition.name)
          );
        }
      });
      break;
    default:
      console.log("Unknown filter type", definition.class);
  }
  return matchingPatients;
};
const updateFilterData = () => {};

const updateFilterCountsAndGetMatches = (filterDefinitions, patientArrays) => {
  return new Promise((resolve, reject) => {
    let matchesArray = [];
    filterDefinitions.forEach((definition) => {
      let numPatientsInFilter = 0;
      definition.globalPatientCountsForCategories.forEach((category) => {
        numPatientsInFilter += category.count;
      });

      const patientsInFilter = getPatientsInFilter(definition, patientArrays, true);
      matchesArray.push(patientsInFilter);
      definition.patientsMeetingThisFilterOnly = numPatientsInFilter;
      //console.log("Patients meeting " + fieldName + " only: " + patientsInFilter.length);
    });
    resolve(matchesArray);
  });
};

const getPatientsMeetingEntireSetOfFiltersForFilter = (definition, patientsMeetingAllFilters) => {
  return new Promise((resolve, reject) => {
    const patientsMatchingThisFilter = this.getPatientsInFilter(
      definition,
      this.state.patientArrays,
      true
    );
    resolve(
      (definition.patientsMeetingEntireSetOfFilters = patientsMeetingAllFilters.filter((patient) =>
        patientsMatchingThisFilter.includes(patient)
      ).length)
    );
  });
};

const updatePatientsMatchingAllFilters = (filterDefinitions, patientArrays) => {
  return new Promise((resolve, reject) => {
    updateFilterCountsAndGetMatches(filterDefinitions, patientArrays).then((matchesArray) => {
      const patientsMeetingAllFilters = fastIntersection(...matchesArray);

      resolve(patientsMeetingAllFilters);
    });
  });
};

export { updatePatientsMatchingAllFilters, fetchFilterDefinitions, initializeFilterDefinitions };
