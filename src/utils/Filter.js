import { filterAttribIds, getPatientIdsWithAllAttributes } from "./db/Queries";
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

const initializeFilterDefinitions = (filterDefinitions) => {
  return initFilterDefinitions(filterDefinitions);
};

export { fetchFilterDefinitions, initializeFilterDefinitions };

getPatientIdsWithAllAttributes(db).then((allAttributesArray) => {
  console.log("All attributes array:", allAttributesArray);
  //write allAttributesArray to a file

  //
  filterAttribIds(allAttributesArray, ["T Stage", "N Stage", "M Stage"]).then((tnmArray) => {
    debugger;
    setGlobalPatientCountsForCategories2(definitions, tnmArray);
  });
});

const getPatientsInFilter = (definition, patientArrays, matchesOnly) => {
  const getPatientsForArrayName = (name) => {
    return patientArrays[definition.fieldName.toLowerCase() + "." + name.toLowerCase()];
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
      if (!matchesOnly) {
        arr = definition.categoricalRange;
      } else {
        arr = definition.selectedCategoricalRange;
      }
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

const updateFilterCountsAndGetMatches = () => {
  return new Promise((resolve, reject) => {
    let matchesArray = [];

    const filterDefinitions = this.state.filterDefinitions;
    this.state.filterDefinitions.forEach((definition) => {
      const fieldName = definition.fieldName;
      //sum globalPatientCountsForCategories
      let numPatientsInFilter = 0;
      definition.globalPatientCountsForCategories.forEach((category) => {
        numPatientsInFilter += category.count;
      });

      const patientsInFilter = this.getPatientsInFilter(definition, this.state.patientArrays, true);
      matchesArray.push(patientsInFilter);
      definition.patientsMeetingThisFilterOnly = numPatientsInFilter;
      //console.log("Patients meeting " + fieldName + " only: " + patientsInFilter.length);
      const idx = filterDefinitions.findIndex((a) => a.fieldName === fieldName);
      this.setState({
        filterDefinitions: {
          ...filterDefinitions,
          [idx]: {
            ...filterDefinitions[idx],
            patientsMeetingThisFilterOnly: numPatientsInFilter,
          },
        },
      });
    });
    this.setState(
      {
        filterDefinitions: filterDefinitions,
      },
      () => {
        resolve(matchesArray);
      }
    );
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

const updatePatientsMeetingEntireSetOfFilters = (patientsMeetingAllFilters) => {
  return new Promise((resolve, reject) => {
    const filterDefinitions = this.state.filterDefinitions;
    filterDefinitions.forEach((definition) => {
      this.getPatientsMeetingEntireSetOfFiltersForFilter(
        definition,
        patientsMeetingAllFilters
      ).then((patientsMeetingEntireSetOfFilters) => {
        definition.patientsMeetingEntireSetOfFilters = patientsMeetingEntireSetOfFilters;
      });
    });
    this.setState(
      {
        filterDefinitions: filterDefinitions,
      },
      () => {
        resolve(true);
      }
    );
  });
};

const updatePatientsMatchingAllFilters = () => {
  return new Promise((resolve, reject) => {
    this.updateFilterCountsAndGetMatches().then((matchesArray) => {
      const patientsMeetingAllFilters = fastIntersection(...matchesArray);
      this.updatePatientsMeetingEntireSetOfFilters(patientsMeetingAllFilters).then(() => {
        this.setState(
          {
            patientsMeetingAllFilters: patientsMeetingAllFilters,
            patientsMeetingAllFiltersUpToDate: true,
            filterDefinitionLoading: false,
          },
          () => {
            resolve(true);
          }
        );
      });
    });
  });
};

export default { fetchFilterDefinitionPromise, updatePatientsMatchingAllFilters };
