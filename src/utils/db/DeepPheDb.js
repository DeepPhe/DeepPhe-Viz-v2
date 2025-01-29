import { deleteDB, openDB } from "idb";
import parsePipeSeparatedFile from "./DbFileReader";
import { DEEPPHE_DB, DEEPPHE_STORE, DEEPPHE_TXT_FILE } from "./DbConsts";

const initDB = async () => {
  try {
    await deleteDB(DEEPPHE_DB, {
      blocked() {
        console.error("Blocked from deleting database");
      },
    });
    return await openDB(DEEPPHE_DB, 1, {
      upgrade(db) {
        db.createObjectStore(DEEPPHE_STORE, { keyPath: "id", autoIncrement: true });
      },
    });
  } catch (error) {
    console.error("Error deleting or opening database:", error);
    throw error;
  }
};

const loadFileData = async () => {
  try {
    const response = await fetch(DEEPPHE_TXT_FILE);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
};

const storeData = async (db, data) => {
  const tx = db.transaction(DEEPPHE_STORE, "readwrite");
  const store = tx.objectStore(DEEPPHE_STORE);
  for (const item of data) {
    await store.add(item);
  }
  await tx.done;
};

const loadData = async (db) => {
  const fileContent = await loadFileData();
  if (fileContent) {
    const parsedData = parsePipeSeparatedFile(fileContent);
    await storeData(db, parsedData);
    console.log("Data successfully loaded into IndexedDB");
  }
};

const fetchPatientDatabase = () => {
  return new Promise((resolve, reject) => {
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
      });
  });
};
export { fetchPatientDatabase };
