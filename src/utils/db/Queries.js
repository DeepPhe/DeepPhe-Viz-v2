import { DEEPPHE_STORE } from "./DbConsts";

const getPatientIdsWithAllAttributes = (db) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DEEPPHE_STORE, "readonly");
    const store = tx.objectStore(DEEPPHE_STORE);
    store.getAll().then((allItems) => {
      resolve(
        allItems.reduce((acc, item) => {
          const rowName = `${item.attribid}.${item.attribval}`;
          if (!acc[rowName]) {
            acc[rowName] = [];
          }
          if (!acc[rowName].includes(item.patientid)) acc[rowName].push(item.patientid);
          return acc;
        }, {})
      );
    });
  });
};

const filterAttribIds = (acc, desiredAttribIds) => {
  return new Promise((resolve, reject) => {
    const filteredResult = {};
    Object.keys(acc).forEach((key) => {
      const [attribid] = key.split(".");
      if (desiredAttribIds.includes(attribid)) {
        filteredResult[key] = acc[key];
      }
    });
    resolve(filteredResult);
  });
};

const getNumberOfDistinctPatients = (db) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DEEPPHE_STORE, "readonly");
    const store = tx.objectStore(DEEPPHE_STORE);
    store.getAll().then((allItems) => {
      resolve(new Set(allItems.map((item) => item.patientid)).size);
    });
  });
};

export { getNumberOfDistinctPatients, getPatientIdsWithAllAttributes, filterAttribIds };
