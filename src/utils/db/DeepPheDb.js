import { deleteDB, openDB } from "idb";
import parsePipeSeparatedFile from "./DbFileReader";
import {
  CANCER_ATTRIBUTES_STORE,
  CANCER_ATTRIBUTES_TEXT_FILE,
  DEEPPHE_DB,
  OMAP_DX_STORE,
  OMAP_DX_TEXT_FILE,
  OMAP_PATIENT_STORE,
  OMAP_PATIENT_TEXT_FILE,
  TUMOR_ATTRIBUTES_STORE,
  TUMOR_ATTRIBUTES_TEXT_FILE,
} from "./DbConsts";

const initDB = async () => {
  try {
    await deleteDB(DEEPPHE_DB, {
      blocked() {
        console.error("Blocked from deleting database");
      },
    });
    return await openDB(DEEPPHE_DB, 1, {
      upgrade(db) {
        const cancerAttributeStore = db.createObjectStore(CANCER_ATTRIBUTES_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        cancerAttributeStore.createIndex("by_patientid", "patientid");
        cancerAttributeStore.createIndex("by_cancerid", "cancerid");

        const tumorAttributeSTore = db.createObjectStore(TUMOR_ATTRIBUTES_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        tumorAttributeSTore.createIndex("by_patientid", "patientid");
        tumorAttributeSTore.createIndex("by_tumorid", "tumorid");

        db.createObjectStore(OMAP_PATIENT_STORE, { keyPath: "id", autoIncrement: true });
        db.createObjectStore(OMAP_DX_STORE, { keyPath: "id", autoIncrement: true });
      },
    });
  } catch (error) {
    console.error("Error deleting or opening database:", error);
    throw error;
  }
};

const loadFileData = (filePath) => {
  const fullPath = `${process.env.PUBLIC_URL}/${filePath}`;
  return new Promise((resolve, reject) => {
    fetch(fullPath)
      .then((res) => resolve(res.text()))
      .catch((e) => {
        //console.log(e);
        reject(e);
      });
  });
};

const storeData = (db, storeName, data) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    //console.log("Storing {} of items in data store:", storeName, data.length);
    for (const item of data) {
      store.add(item);
    }
    tx.done
      .then(() => {
        //console.log(`Data loaded into ${storeName} store`);
        resolve();
      })
      .catch((error) => {
        //console.error(`Error storing data in ${storeName}:`, error);
        reject(error);
      });
  });
};

const loadDataForStore = (db, storeName, filePath) => {
  //console.log("Loading data for store:", storeName);
  return loadFileData(filePath).then((content) => {
    if (!content) {
      console.error(`Error loading file: ${filePath}`);
      return Promise.reject(new Error(`File content is empty for ${filePath}`));
    } else {
      let parsedData;

      if (storeName === OMAP_DX_STORE || storeName === OMAP_PATIENT_STORE) {
        // Special handling for OMAP data to exclude the first "id" column
        parsedData = parseOmapData(content);
      } else {
        // Regular parsing for other stores
        parsedData = parsePipeSeparatedFile(content, "|");
      }

      // Return the Promise from storeData
      return storeData(db, storeName, parsedData);
    }
  });
};

// Function to parse OMAP data without using the first column as "id"
const parseOmapData = (fileContent) => {
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim());
  const result = [];

  // Extract header row and parse column names
  if (lines.length === 0) return result;

  const headerRow = lines[0];
  const headers = headerRow.split("|").map((header) => header.trim());
  const patientIdCol = headers.indexOf("PERSON_IDS");
  const nameCol = headers.indexOf("COL");
  const attribValCol = headers.indexOf("VAL");

  // Process each data row (skip the header row)
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split("|");
    const patientIds = columns[patientIdCol].split(",").map((id) => id);
    const attribid = columns[nameCol].trim();
    let attribval = columns[attribValCol].trim();
    if (attribid.toLowerCase() === "age_at_dx") {
      attribval = parseInt(attribval.substring(0, attribval.length - 1) + "0");
      if (attribval > 90) {
        attribval = 90;
      }
    }

    const chunkSize = 5000; // Adjust chunk size as needed
    for (let i = 0; i < patientIds.length; i += chunkSize) {
      const chunk = patientIds.slice(i, i + chunkSize);
      result.push({ patientids: chunk, attribid, attribval });
    }
  }

  return result;
};

// Usage example:
// const csvPromises = loadCsvFilesFromPublicDb(['patients.csv', 'diagnoses.csv', 'treatments.csv']);
// Promise.all(csvPromises).then(dataArrays => {
//   // dataArrays contains the parsed contents of each CSV file
// });
const loadData = (db) => {
  //console.log("Loading data for all stores");
  // const csvData = loadCsvFilesFromPublicDb(CSV_FILE_NAMES);
  return new Promise((resolve, reject) => {
    Promise.all([
      loadDataForStore(db, OMAP_DX_STORE, OMAP_DX_TEXT_FILE),
      loadDataForStore(db, OMAP_PATIENT_STORE, OMAP_PATIENT_TEXT_FILE),
      loadDataForStore(db, CANCER_ATTRIBUTES_STORE, CANCER_ATTRIBUTES_TEXT_FILE),
      loadDataForStore(db, TUMOR_ATTRIBUTES_STORE, TUMOR_ATTRIBUTES_TEXT_FILE),
    ]).then((data) => {
      //console.log("All data loaded successfully");
      resolve(data);
    });
  });
};

const fetchPatientDatabase = () => {
  return new Promise((resolve, reject) => {
    if (false) {
      openDB(DEEPPHE_DB, 1, {}).then((db) => {
        if (db) {
          //console.log("Database opened successfully");
          resolve(db);
        } else {
          //console.error("Failed to open database");
          reject(new Error("Failed to open database"));
        }
      });
    } else {
      initDB()
        .then((db) => {
          loadData(db)
            .then(() => {
              resolve(db);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          //console.log("Database initialized and data loaded");
        });
    }
  });
};

export { fetchPatientDatabase };
