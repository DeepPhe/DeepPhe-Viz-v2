/**
 * SQLite Client - Direct SQLite Database Access
 *
 * This module replaces IndexedDB (idb) with direct SQLite access using sql.js.
 * It provides a unified interface for querying patient, cancer, and tumor data
 * from the SQLite database without the intermediate IndexedDB layer.
 */

import initSqlJs from "sql.js";

// Singleton instance
let sqliteDbInstance = null;
let sqliteInitPromise = null;

/**
 * Initialize and load the SQLite database
 * @returns {Promise<Database>} The SQLite database instance
 */
const initSqliteDb = async () => {
  if (sqliteDbInstance) {
    return sqliteDbInstance;
  }

  if (sqliteInitPromise) {
    return sqliteInitPromise;
  }

  sqliteInitPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const dbPath = `${process.env.PUBLIC_URL}/demopatients.sqlite`;
      const response = await fetch(dbPath);
      const buffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));

      sqliteDbInstance = db;
      console.log("SQLite database loaded successfully");
      return db;
    } catch (error) {
      console.error("Error loading SQLite database:", error);
      sqliteInitPromise = null;
      throw error;
    }
  })();

  return sqliteInitPromise;
};

/**
 * Get the SQLite database instance
 * @returns {Promise<Database>} The SQLite database instance
 */
const getDb = async () => {
  return await initSqliteDb();
};

/**
 * Close the SQLite database
 */
const closeDb = () => {
  if (sqliteDbInstance) {
    sqliteDbInstance.close();
    sqliteDbInstance = null;
    sqliteInitPromise = null;
  }
};

/**
 * Execute a SQL query and return results as array of objects
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of result objects
 */
const executeQuery = async (query, params = []) => {
  const db = await getDb();
  const results = db.exec(query, params);

  if (results.length === 0) {
    return [];
  }

  const { columns, values } = results[0];
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
};

/**
 * Get all cancer attributes for a specific patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Array of cancer attribute records
 */
const getCancerAttributesByPatient = async (patientId) => {
  const query = `
    SELECT patientid, cancerid, cancer_type, attribid, attribval, confidence
    FROM cancer_attributes
    WHERE patientid = ?
  `;
  return executeQuery(query, [patientId]);
};

/**
 * Get all tumor attributes for a specific patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Array of tumor attribute records
 */
const getTumorAttributesByPatient = async (patientId) => {
  const query = `
    SELECT patientid,
           CANCER_ID,
           TUMOR_ID,
           tumor_type,
           attribute_name,
           attribute_value,
           attribute_status,
           confidence
    FROM tumor_attributes
    WHERE patientid = ?
  `;
  const results = await executeQuery(query, [patientId]);

  // Map column names to expected format
  return results.map((row) => ({
    patientid: row.patientid,
    CANCER_ID: row.CANCER_ID,
    tumorid: row.TUMOR_ID,
    tumor_type: row.tumor_type,
    attribid: row.attribute_name,
    attribval: row.attribute_value,
    attribute_status: row.attribute_status,
    confidence: row.confidence,
  }));
};

/**
 * Get all cancer attributes
 * @returns {Promise<Array>} Array of all cancer attribute records
 */
const getAllCancerAttributes = async () => {
  const query = `
    SELECT patientid, cancerid, cancer_type, attribid, attribval, confidence
    FROM cancer_attributes
  `;
  return executeQuery(query);
};

/**
 * Get all tumor attributes
 * @returns {Promise<Array>} Array of all tumor attribute records
 */
const getAllTumorAttributes = async () => {
  const query = `
    SELECT patientid,
           CANCER_ID,
           TUMOR_ID,
           tumor_type,
           attribute_name,
           attribute_value,
           attribute_status,
           confidence
    FROM tumor_attributes
  `;
  const results = await executeQuery(query);

  // Map column names to expected format
  return results.map((row) => ({
    patientid: row.patientid,
    CANCER_ID: row.CANCER_ID,
    tumorid: row.TUMOR_ID,
    tumor_type: row.tumor_type,
    attribid: row.attribute_name,
    attribval: row.attribute_value,
    attribute_status: row.attribute_status,
    confidence: row.confidence,
  }));
};

/**
 * Get calculated DX data (OMAP)
 * @returns {Promise<Array>} Array of DX data with expanded patient IDs
 */
const getCalculatedDxData = async () => {
  const query = `SELECT COL, VAL, PERSON_IDS
                 FROM calculated_dx_data`;
  const rawResults = await executeQuery(query);

  // Map column names
  const mappedResults = rawResults.map((row) => ({
    attribid: row.COL,
    attribval: row.VAL,
    PERSON_IDS: row.PERSON_IDS,
  }));

  return processOmapData(mappedResults);
};

/**
 * Get calculated patient data (OMAP)
 * @returns {Promise<Array>} Array of patient data with expanded patient IDs
 */
const getCalculatedPatientData = async () => {
  const query = `SELECT COL, VAL, PERSON_IDS
                 FROM calculated_patient_data`;
  const rawResults = await executeQuery(query);

  // Map column names
  const mappedResults = rawResults.map((row) => ({
    attribid: row.COL,
    attribval: row.VAL,
    PERSON_IDS: row.PERSON_IDS,
  }));

  return processOmapData(mappedResults);
};

/**
 * Process OMAP data - expand comma-separated patient IDs
 * @param {Array} rawResults - Raw query results
 * @returns {Array} Processed results with patientids as arrays
 */
const processOmapData = (rawResults) => {
  const result = [];

  for (const row of rawResults) {
    let { attribid, attribval, PERSON_IDS } = row;

    // Parse the comma-separated patient IDs
    const patientIds = PERSON_IDS.split(",").map((id) => id.trim());

    // Special handling for age_at_dx - preserve ranges for display
    if (attribid.toLowerCase() === "age_at_dx") {
      // Normalize age ranges to consistent format
      // "50-59" stays "50-59", "50s" becomes "50-59", single numbers become ranges
      const firstNumber = attribval.match(/\d+/);
      if (firstNumber) {
        const startAge = parseInt(firstNumber[0]);

        // For ages 90+, use "90+" format
        if (startAge >= 90) {
          attribval = "90+";
        } else if (attribval.includes("-")) {
          // Already a range (e.g., "50-59"), keep it as is
          attribval = attribval;
        } else {
          // Convert single number or "50s" format to range "50-59"
          const endAge = startAge + 9;
          attribval = `${startAge}-${endAge}`;
        }
      }
    }

    // Split patient IDs into chunks to avoid performance issues
    const chunkSize = 5000;
    for (let i = 0; i < patientIds.length; i += chunkSize) {
      const chunk = patientIds.slice(i, i + chunkSize);
      result.push({
        patientids: chunk,
        attribid,
        attribval: String(attribval),
      });
    }
  }

  return result;
};

/**
 * Get all patient IDs with their attributes combined from all sources
 * This replaces the IDB query functionality
 * @returns {Promise<Object>} Object mapping "attribid.attribval" to patient ID arrays
 */
const getPatientIdsWithAllAttributes = async () => {
  const combinedResults = {};

  // Get cancer attributes
  const cancerAttributes = await getAllCancerAttributes();
  cancerAttributes.forEach((item) => {
    const rowName = `${item.attribid}.${item.attribval}`;
    if (!combinedResults[rowName]) {
      combinedResults[rowName] = [];
    }
    if (!combinedResults[rowName].includes(item.patientid)) {
      combinedResults[rowName].push(item.patientid);
    }
  });

  // Get DX data
  const dxData = await getCalculatedDxData();
  dxData.forEach((item) => {
    const rowName = `${item.attribid}.${item.attribval}`;
    if (!combinedResults[rowName]) {
      combinedResults[rowName] = [];
    }

    // Create a Set to ensure uniqueness
    const uniquePatients = new Set([...combinedResults[rowName], ...item.patientids]);
    combinedResults[rowName] = [...uniquePatients];
  });

  // Get patient data
  const patientData = await getCalculatedPatientData();
  patientData.forEach((item) => {
    const rowName = `${item.attribid}.${item.attribval}`;
    if (!combinedResults[rowName]) {
      combinedResults[rowName] = [];
    }

    // Create a Set to ensure uniqueness
    const uniquePatients = new Set([...combinedResults[rowName], ...item.patientids]);
    combinedResults[rowName] = [...uniquePatients];
  });

  return combinedResults;
};

/**
 * Get unique patient IDs from all sources
 * @returns {Promise<Array>} Array of unique patient IDs
 */
const getAllUniquePatientIds = async () => {
  const patientArrays = await getPatientIdsWithAllAttributes();
  const uniquePatientIDs = new Set();

  Object.keys(patientArrays).forEach((key) => {
    patientArrays[key].forEach((patientID) => {
      uniquePatientIDs.add(patientID);
    });
  });

  return [...uniquePatientIDs];
};

/**
 * Fetch patient arrays - main entry point replacing fetchPatientArrays from Patient.js
 * @returns {Promise<Object>} Object with patientArrays and uniquePatientIds
 */
const fetchPatientArrays = async () => {
  const patientArrays = await getPatientIdsWithAllAttributes();
  const uniquePatientIds = await getAllUniquePatientIds();

  return {
    patientArrays,
    uniquePatientIds,
  };
};

/**
 * Fetch patient cancers with tumor details
 * This replaces fetchPatientCancers from Patient.js
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Array of cancer objects with tumor summaries
 */
const fetchPatientCancers = async (patientId) => {
  const patientCancers = await getCancerAttributesByPatient(patientId);
  const patientTumors = await getTumorAttributesByPatient(patientId);

  const cancersByPatient = patientCancers.reduce((acc, record) => {
    const patientName = record.patientid;
    const cancerId = record.cancerid;
    const attributeName = record.attribid;
    const attributeValue = record.attribval;

    if (!acc[patientName]) {
      acc[patientName] = {};
    }
    if (!acc[patientName][cancerId]) {
      acc[patientName][cancerId] = {
        cancerId: cancerId,
        details: {},
        clinicalTNM: {},
        tumorSummaries: [],
      };
    }

    const cancer = acc[patientName][cancerId];
    const tnmMatch = attributeName.match(/([TNM]) Stage/);

    if (tnmMatch) {
      cancer.clinicalTNM[tnmMatch[1]] = attributeValue;
    } else {
      cancer.details[attributeName] = attributeValue;
    }

    return acc;
  }, {});

  // Process tumors
  const tumors = {};
  patientTumors.forEach((tumorRow) => {
    const patientName = tumorRow.patientid;
    const cancerId = tumorRow.CANCER_ID;
    const tumorId = tumorRow.tumorid;
    const tumorType = tumorRow.tumor_type;
    const tumorAttributeName = tumorRow.attribid;
    const tumorAttributeValue = tumorRow.attribval;

    if (!tumors[patientName]) {
      tumors[patientName] = {};
    }

    if (!tumors[patientName][cancerId]) {
      tumors[patientName][cancerId] = {};
    }

    if (!tumors[patientName][cancerId][tumorId]) {
      tumors[patientName][cancerId][tumorId] = {
        title: tumorId,
        tumorType: tumorType,
        fields: {},
      };
    }

    const tumor = tumors[patientName][cancerId][tumorId];
    tumor.fields[tumorAttributeName] = tumorAttributeValue;
  });

  // Attach tumors to cancers
  Object.keys(tumors).forEach((patientName) => {
    Object.keys(tumors[patientName]).forEach((cancerId) => {
      Object.keys(tumors[patientName][cancerId]).forEach((tumorId) => {
        if (cancersByPatient[patientName] && cancersByPatient[patientName][cancerId]) {
          cancersByPatient[patientName][cancerId].tumorSummaries.push(
            tumors[patientName][cancerId][tumorId]
          );
        }
      });
    });
  });

  // Convert to array format
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

/**
 * Mock database object that mimics the IndexedDB interface
 * This allows existing code to work with minimal changes
 * @returns {Promise<Object>} Mock DB object with query methods
 */
const fetchPatientDatabase = async () => {
  await initSqliteDb();

  // Return a mock object that provides the same interface as IDB
  return {
    // For compatibility with existing code
    _isSqliteClient: true,
    _sqliteDb: sqliteDbInstance,

    // Mock transaction method - not used in new implementation
    transaction: (storeName, mode) => {
      throw new Error(
        "Direct transactions not supported. Use sqlite_client query methods instead."
      );
    },
  };
};

export {
  getDb,
  closeDb,
  executeQuery,
  getCancerAttributesByPatient,
  getTumorAttributesByPatient,
  getAllCancerAttributes,
  getAllTumorAttributes,
  getCalculatedDxData,
  getCalculatedPatientData,
  getPatientIdsWithAllAttributes,
  getAllUniquePatientIds,
  fetchPatientArrays,
  fetchPatientCancers,
  fetchPatientDatabase,
};
