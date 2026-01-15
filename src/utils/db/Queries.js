/**
 * Queries.js - DEPRECATED
 *
 * This file is kept for backwards compatibility but now delegates to sqlite_client.js
 * All new code should import directly from sqlite_client.js
 */

import { getPatientIdsWithAllAttributes as getPatientIdsWithAllAttributesSqlite } from "./sqlite_client";

const getPatientIdsWithAllAttributes = async (db) => {
  // db parameter is ignored, SQLite client manages its own connection
  return getPatientIdsWithAllAttributesSqlite();
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

const getNumberOfDistinctPatients = async (db) => {
  // For backwards compatibility, but using SQLite client
  const { getAllUniquePatientIds } = await import("./sqlite_client");
  const uniqueIds = await getAllUniquePatientIds();
  return uniqueIds.length;
};

export { getNumberOfDistinctPatients, getPatientIdsWithAllAttributes, filterAttribIds };
