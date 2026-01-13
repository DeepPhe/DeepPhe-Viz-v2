import { deleteDB, openDB } from "idb";
import initSqlJs from "sql.js";
import {
  CANCER_ATTRIBUTES_STORE,
  DEEPPHE_DB,
  OMAP_DX_STORE,
  OMAP_PATIENT_STORE,
  TUMOR_ATTRIBUTES_STORE,
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

const loadSqliteDatabase = async () => {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const dbPath = `${process.env.PUBLIC_URL}/demopatients.sqlite`;
  const response = await fetch(dbPath);
  const buffer = await response.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  return db;
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

const loadDataForStore = async (sqliteDb, idbDb, storeName) => {
  let query;
  let parsedData = [];

  switch (storeName) {
    case CANCER_ATTRIBUTES_STORE:
      query =
        "SELECT patientid, cancerid, cancer_type, attribid, attribval, confidence FROM cancer_attributes";
      break;
    case TUMOR_ATTRIBUTES_STORE:
      query =
        "SELECT patientid, CANCER_ID, TUMOR_ID, tumor_type, attribute_name, attribute_value, attribute_status, confidence FROM tumor_attributes";
      break;
    case OMAP_DX_STORE:
      query = "SELECT COL, VAL, PERSON_IDS FROM calculated_dx_data";
      break;
    case OMAP_PATIENT_STORE:
      query = "SELECT COL, VAL, PERSON_IDS FROM calculated_patient_data";
      break;
    default:
      throw new Error(`Unknown store: ${storeName}`);
  }

  const results = sqliteDb.exec(query);

  if (results.length > 0) {
    const values = results[0].values;

    if (storeName === OMAP_DX_STORE || storeName === OMAP_PATIENT_STORE) {
      // Special handling for OMAP data
      parsedData = processOmapResults(values);
    } else if (storeName === CANCER_ATTRIBUTES_STORE) {
      // Process cancer attributes
      parsedData = values.map((row) => ({
        patientid: row[0],
        cancerid: row[1],
        cancer_type: row[2],
        attribid: row[3],
        attribval: row[4],
        confidence: row[5],
      }));
    } else if (storeName === TUMOR_ATTRIBUTES_STORE) {
      // Process tumor attributes - using the actual column names from the database
      parsedData = values.map((row) => ({
        patientid: row[0],
        CANCER_ID: row[1],
        tumorid: row[2], // Map TUMOR_ID to tumorid for consistency
        tumor_type: row[3],
        attribid: row[4], // Map attribute_name to attribid
        attribval: row[5], // Map attribute_value to attribval
        attribute_status: row[6],
        confidence: row[7],
      }));
    }
  }

  return storeData(idbDb, storeName, parsedData);
};

// Function to process OMAP data from SQLite results
const processOmapResults = (values) => {
  const result = [];

  for (const row of values) {
    const attribid = row[0]; // COL
    let attribval = row[1]; // VAL
    const personIds = row[2]; // PERSON_IDS

    // Parse the comma-separated patient IDs
    const patientIds = personIds.split(",").map((id) => id.trim());

    // Special handling for age_at_dx
    if (attribid.toLowerCase() === "age_at_dx") {
      attribval = parseInt(attribval.substring(0, attribval.length - 1) + "0");
      if (attribval > 90) {
        attribval = 90;
      }
    }

    // Split patient IDs into chunks to avoid performance issues
    const chunkSize = 5000;
    for (let i = 0; i < patientIds.length; i += chunkSize) {
      const chunk = patientIds.slice(i, i + chunkSize);
      result.push({ patientids: chunk, attribid, attribval });
    }
  }

  return result;
};

// Load all data from SQLite database into IndexedDB stores
const loadData = async (idbDb) => {
  //console.log("Loading data from SQLite database");

  // Load the SQLite database
  const sqliteDb = await loadSqliteDatabase();

  return Promise.all([
    loadDataForStore(sqliteDb, idbDb, OMAP_DX_STORE),
    loadDataForStore(sqliteDb, idbDb, OMAP_PATIENT_STORE),
    loadDataForStore(sqliteDb, idbDb, CANCER_ATTRIBUTES_STORE),
    loadDataForStore(sqliteDb, idbDb, TUMOR_ATTRIBUTES_STORE),
  ]).then((data) => {
    //console.log("All data loaded successfully from SQLite database");
    sqliteDb.close();
    return data;
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
