/**
 * DeepPheDb.js - DEPRECATED
 *
 * This file is kept for backwards compatibility but now delegates to sqlite_client.js
 * All new code should import directly from sqlite_client.js
 */

import { fetchPatientDatabase as fetchPatientDatabaseSqlite } from "./sqlite_client";

const fetchPatientDatabase = fetchPatientDatabaseSqlite;

export { fetchPatientDatabase };
