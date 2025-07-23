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
            // Deduplicate items based on patientid
            const uniqueItems = [];
            //const patientIdSet = new Set();

            items.forEach((item) => {
              console.log(item);
              if (item.patientid || item.patientids) {
                // For objects with patientid property
                if (item.patientid) {
                  // patientIdSet.add(item.patientid);
                  uniqueItems.push(item);
                }
                // For objects with patientids array
                else if (item.patientids) {
                  // Deduplicate the patientids array itself
                  item.patientids = [...new Set(item.patientids)];
                  uniqueItems.push(item);
                }
                // Add other item types that don't have patient info
                else if (!item.patientid && !item.patientids) {
                  uniqueItems.push(item);
                }
              }
            });

            resolve(uniqueItems);
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
          console.log("cancerAttributeItems", item);
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

            // Handle case where patientids is a string or an array
            let patientIds = item.patientids;
            if (typeof patientIds === "string") {
              patientIds = patientIds.split(",");
            }

            // Create a Set from existing patients plus new ones to ensure uniqueness
            const uniquePatients = new Set([...combinedResults[rowName], ...patientIds]);
            combinedResults[rowName] = [...uniquePatients];
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
