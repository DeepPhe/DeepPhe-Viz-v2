import { fastIntersection } from "./arrayHelpers";
import { initFilterDefinitions } from "./FilterDefinitions";
import filterPatients from "./FilterPatients";

const getSeries = () => {
  return [
    {
      dataKey: "Patients Meeting All Filters",
      label: "Patients Meeting All Filters",
      color: "#003594",
      stack: "total",
    },
    {
      dataKey: "Patients Meeting This Filter Only",
      label: "Patients Meeting This Filter Only",
      color: "#FFB81C",
      stack: "total",
    },
    {
      dataKey: "Patients Not Meeting This Filter",
      label: "Patients Not Meeting This Filter",
      color: "rgba(178,178,178,0.8)",
      stack: "total",
    },
  ];
};

const getDataset = (thisFilter, categoricalRange, selectedCategoricalRange) => {
  return categoricalRange.map((category, catIdx) => {
    const categoryEnabled = selectedCategoricalRange.includes(category);
    let patientsMeetingAllFilters =
      thisFilter.patientsInThisFilterAndMatchingThisFilterAndMatchingAllOtherFiltersByCategory[
        catIdx
      ];
    let patientsMeetingThisFilterOnly =
      thisFilter.patientsInThisFilterAndMatchingThisFilterAndNotMatchingAllOtherFiltersByCategory[
        catIdx
      ];
    let patientsNotMeetingThisFilter =
      thisFilter.patientsInThisFilterAndNotMatchingThisFilterByCategory[catIdx];

    if (!categoryEnabled) {
      patientsNotMeetingThisFilter += patientsMeetingThisFilterOnly + patientsMeetingAllFilters;
      patientsMeetingThisFilterOnly = 0;
      patientsMeetingAllFilters = 0;
    }
    return {
      category: category,
      "Patients Meeting All Filters": patientsMeetingAllFilters,
      "Patients Meeting This Filter Only": patientsMeetingThisFilterOnly,
      "Patients Not Meeting This Filter": patientsNotMeetingThisFilter,
    };
  });
};

const fetchFilterDefinitions = () => {
  return new Promise(function (resolve, reject) {
    fetch("/SearchFilterDefinition.json")
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          reject(`Failed to load filter definitions: ${response.status}`);
        }
      })
      .then(function (json) {
        resolve(json["searchFilterDefinition"]);
      })
      .catch(function (error) {
        console.error("Error loading filter definitions:", error);
        reject(error);
      });
  });
};

const initializeFilterDefinitions = (filterDefinitions, patientArrays, uniquePatientIds) => {
  return initFilterDefinitions(filterDefinitions, patientArrays, uniquePatientIds);
};

// getPatientIdsWithAllAttributes(db).then((allAttributesArray) => {
//   console.log("All attributes array:", allAttributesArray);
//   //write allAttributesArray to a file
//
//   //
//   filterAttribIds(allAttributesArray, ["T Stage", "N Stage", "M Stage"]).then((tnmArray) => {
//     debugger;
//     setpatientCountsByCategory2(definitions, tnmArray);
//   });
// });

const getPatientsInFilter = (definition, patientArrays, matchesOnly) => {
  const getPatientsForArrayName = (name) => {
    const arrayRow = name;
    return patientArrays[arrayRow];
  };
  let matchingPatients = [];
  let matchingPatientsByCategory = [];

  let arr;
  arr = definition.categoricalRange;
  arr.forEach((range) => {
    const pats = getPatientsForArrayName(range);
    if (definition.selectedCategoricalRange.includes(range) || !definition.enabled) {
      matchingPatients = matchingPatients.concat(pats);
      matchingPatientsByCategory.push(pats);
    } else {
      matchingPatientsByCategory.push([]);
    }
  });
  definition.patientsMeetingThisFilterOnly = matchingPatientsByCategory;

  return [matchingPatients];
};
const updateFilterData = () => {};
const extractUniquePatientIds = (patientArrays) => {
  const uniquePatientIds = new Set();

  for (const arrayName in patientArrays) {
    if (patientArrays.hasOwnProperty(arrayName)) {
      const patients = patientArrays[arrayName];
      patients.forEach((patientId) => {
        uniquePatientIds.add(patientId);
      });
    }
  }

  return Array.from(uniquePatientIds);
};
const updateFilterCountsAndGetMatches = (filterDefinitions, patientArrays) => {
  return new Promise((resolve, reject) => {
    // const allArray = extractUniquePatientIds(patientArrays);
    // let matchesArray = [];
    // filterDefinitions.forEach((definition) => {
    //   let numPatientsInFilter = 0;
    //   definition.patientCountsByCategory.forEach((category) => {
    //     numPatientsInFilter += category.count;
    //   });
    //   let patientsInFilter = [];
    //   if (definition.enabled) {
    //     patientsInFilter = getPatientsInFilter(definition, patientArrays, true);
    //   } else {
    //     patientsInFilter = [...allArray];
    //   }
    //   matchesArray.push(...patientsInFilter);
    //   //console.log("Patients meeting " + fieldName + " only: " + patientsInFilter.length);
    // });
    // //create an array with all patientids from patientArrays
    //
    // matchesArray.push(allArray);
    filterPatients(filterDefinitions, patientArrays).then((matchesArray) => {
      //console.log("filterDefinitions", filterDefinitions);
    });
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

export {
  updatePatientsMatchingAllFilters,
  fetchFilterDefinitions,
  initializeFilterDefinitions,
  getSeries,
  getDataset,
};
