/**
 * Patient.js - DEPRECATED
 *
 * This file is kept for backwards compatibility but now delegates to sqlite_client.js
 * All new code should import directly from sqlite_client.js
 */

import {
  fetchPatientArrays as fetchPatientArraysSqlite,
  fetchPatientCancers as fetchPatientCancersSqlite,
} from "./sqlite_client";

const fetchPatientArrays = async (db) => {
  // db parameter is ignored, SQLite client manages its own connection
  return fetchPatientArraysSqlite();
};

const fetchPatientCancers = async (db, patientId) => {
  // db parameter is ignored, SQLite client manages its own connection
  return fetchPatientCancersSqlite(patientId);
};

export { fetchPatientArrays, fetchPatientCancers };
