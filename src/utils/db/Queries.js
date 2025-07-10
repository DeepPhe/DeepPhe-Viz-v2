import {
  CANCER_ATTRIBUTES_STORE,
  OMAP_DX_STORE,
  OMAP_PATIENT_STORE,
  TUMOR_ATTRIBUTES_STORE,
} from "./DbConsts";

const getPatientIdsWithAllAttributes = (db) => {
  return new Promise((resolve, reject) => {
    // Create promises to get data from both stores
    const getData = (storeName) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        store
          .getAll()
          .then((items) => {
            resolve(items);
          })
          .catch((err) => {
            console.error(`Error fetching data from ${store}:`, err);
            reject(err);
          });
      });
    };

    // Execute both promises concurrently
    Promise.all([
      getData(CANCER_ATTRIBUTES_STORE),
      getData(TUMOR_ATTRIBUTES_STORE),
      getData(OMAP_DX_STORE),
      getData(OMAP_PATIENT_STORE),
    ])
      .then(([cancerAttributeItems, tumorAttributeItems, dxItems, omapItems]) => {
        // Initialize combined results
        const combinedResults = {};
        // Process DeepPhe data
        cancerAttributeItems.forEach((item) => {
          const rowName = `${item.attribid}.${item.attribval}`;
          if (!combinedResults[rowName]) {
            combinedResults[rowName] = [];
          }
          if (!combinedResults[rowName].includes(item.patientid)) {
            combinedResults[rowName].push(item.patientid);
          }
        });
        // Process OMAP data
        const omap = [dxItems, omapItems];
        omap.forEach((itemSet) => {
          itemSet.forEach((item) => {
            const rowName = `${item.attribid}.${item.attribval}`;
            if (!combinedResults[rowName]) {
              combinedResults[rowName] = [];
            }
            combinedResults[rowName].push(...item.patientids);
          });
        });

        resolve(combinedResults);
      })
      .catch((error) => {
        reject(error);
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
