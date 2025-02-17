import { getPatientIdsWithAllAttributes } from "./Queries";

const fetchPatientArrays = (db) => {
  return new Promise((resolve, reject) => {
    getPatientIdsWithAllAttributes(db).then((patientArr) => {
      const uniquePatientIDs = new Set();

      Object.keys(patientArr).forEach((key) => {
        patientArr[key].forEach((patientID) => {
          uniquePatientIDs.add(patientID);
        });
      });

      const uniquePatientIdsArray = [...uniquePatientIDs];
      resolve({
        patientArrays: patientArr,
        uniquePatientIds: uniquePatientIdsArray,
      });
    });
  });
};

const setpatientCountsByCategory2 = (definitions, patientArrays) => {
  //for each patientArray, get the first letter of the key
  //if the key is in the definitions.fieldName, then get the length of the array
  //set definitiions.patientCountsByCategory to be an array of objects
  //each object should contain a "category" and a "count" for the number of patients in that category
  definitions.forEach((definition) => {
    definition.categoricalRange = [];
    definition.patientCountsByCategory = [];
    const fieldName = definition.fieldName.toLowerCase();
    //could be t
    for (const key in patientArrays) {
      if (key.toLowerCase().startsWith(fieldName)) {
        definition.categoricalRange.push(key);
        definition.patientCountsByCategory.push({
          category: key,
          count: patientArrays[key].length,
        });
      }
    }
    definition.selectedCategoricalRange = definition.categoricalRange;
  });
  console.log(definitions);
};

export { fetchPatientArrays };
