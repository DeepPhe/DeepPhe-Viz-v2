import { getPatientIdsWithAllAttributes } from "./Queries";

import {
  CANCER_ATTRIBUTES_MAP,
  CANCER_ATTRIBUTES_STORE,
  TUMOR_ATTRIBUTES_MAP,
  TUMOR_ATTRIBUTES_STORE,
} from "./DbConsts";

const fetchPatientCancers = async (db, patientid) => {
  if (!db) {
    return { patientArrays: {} };
  }

  const tx = db.transaction(CANCER_ATTRIBUTES_STORE, "readonly");
  const store = tx.objectStore(CANCER_ATTRIBUTES_STORE);
  const index = store.index("by_patientid");
  const patientCancers = await index.getAll(patientid);
  await tx.done;

  const tumorTx = db.transaction(TUMOR_ATTRIBUTES_STORE, "readonly");
  const tumorStore = tumorTx.objectStore(TUMOR_ATTRIBUTES_STORE);
  const tumorIndex = tumorStore.index("by_patientid");
  const patientTumors = await tumorIndex.getAll(patientid);
  await tumorTx.done;

  const cancersByPatient = patientCancers.reduce((acc, record) => {
    const patientName = record[CANCER_ATTRIBUTES_MAP.PATIENT_NAME];
    const cancerId = record[CANCER_ATTRIBUTES_MAP.CANCER_ID];
    const attributeName = record[CANCER_ATTRIBUTES_MAP.ATTRIBUTE_NAME];
    const attributeValue = record[CANCER_ATTRIBUTES_MAP.ATTRIBUTE_VALUE];

    if (!acc[patientName]) {
      acc[patientName] = {};
    }
    if (!acc[patientName][cancerId]) {
      acc[patientName][cancerId] = {
        cancerId: cancerId,
        details: {},
        clinicalTNM: {},
        tumorSummaries: [], // Placeholder for tumor data
      };
    }

    const cancer = acc[patientName][cancerId];
    const tnmMatch = attributeName.match(/([TNM]) Stage/);

    if (tnmMatch) {
      cancer.clinicalTNM[tnmMatch[1]] = attributeValue;
    } else {
      cancer.details[attributeName] = attributeValue;
    }

    /*
    tumorSummaries: [
          {
            title: "Ductal_Breast_Carcinoma_In_Situ",
            fields: {
              Location: "Breast",
              Laterality: "Right",
              Quadrant: "Upper_inner_Quadrant",
              "Histologic Type": "Ductal_Breast_Carcinoma_In_Situ",
              Behavior: "3",
              Stage: "IIA",
              Grade: "9",
              Extent: "Invasive_Lesion",
              T: "T1",
              N: "N2",
              M: "M0",
              "Tumor Type": "PrimaryTumor",
              ER: "positive",
              PR: "positive",
              HER2: "negative",
            },
          }, // ...more summaries if needed
     */

    return acc;
  }, {});

  const tumors = {};
  patientTumors.forEach((tumorRow) => {
    const patientId = tumorRow[TUMOR_ATTRIBUTES_MAP.PATIENT_NAME];
    const cancerId = tumorRow[TUMOR_ATTRIBUTES_MAP.CANCER_ID];
    const tumorId = tumorRow[TUMOR_ATTRIBUTES_MAP.TUMOR_ID];
    const tumorType = tumorRow[TUMOR_ATTRIBUTES_MAP.TUMOR_TYPE];
    const tumorAttributeName = tumorRow[TUMOR_ATTRIBUTES_MAP.ATTRIBUTE_NAME];
    const tumorAttributeValue = tumorRow[TUMOR_ATTRIBUTES_MAP.ATTRIBUTE_VALUE];
    const tumorAttributeStatus = tumorRow[TUMOR_ATTRIBUTES_MAP.ATTRIBUTE_STATUS];

    if (!tumors[patientId]) {
      tumors[patientId] = {};
    }

    if (!tumors[patientId][cancerId]) {
      tumors[patientId][cancerId] = {};
    }

    if (!tumors[patientId][cancerId][tumorId]) {
      tumors[patientId][cancerId][tumorId] = {
        title: tumorId,
        tumorType: tumorType,
        fields: {},
      };
    }

    const tumor = tumors[patientId][cancerId][tumorId];
    tumor.fields[tumorAttributeName] = tumorAttributeValue;
  });

  Object.keys(tumors).forEach((patientId) => {
    Object.keys(tumors[patientId]).forEach((cancerId) => {
      Object.keys(tumors[patientId][cancerId]).forEach((tumorId) => {
        cancersByPatient[patientId][cancerId].tumorSummaries.push(
          tumors[patientId][cancerId][tumorId]
        );
      });
    });
  });

  // Convert the nested object structure to the array format expected by the UI
  const cancers = [];
  Object.keys(cancersByPatient).forEach((patientName) => {
    const patientData = cancersByPatient[patientName];
    Object.keys(patientData).forEach((cancerId) => {
      const cancerDetails = patientData[cancerId] || {};
      cancers.push({
        patientName: patientName,
        cancerId: cancerId,
        details: cancerDetails.details,
        clinicalTNM: cancerDetails.clinicalTNM,
        tumorSummaries: cancerDetails.tumorSummaries,
      });
    });
  });

  return cancers;
};

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
  //console.log(definitions);
};

export { fetchPatientArrays, fetchPatientCancers };
