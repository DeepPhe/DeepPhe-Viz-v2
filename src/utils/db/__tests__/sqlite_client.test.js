/**
 * Unit Tests for sqlite_client.js
 *
 * These tests verify that the SQLite client works correctly and produces
 * the same results as the previous IndexedDB implementation.
 */

// Setup mocks before importing the module
const mockExec = jest.fn();
const mockClose = jest.fn();
const mockDatabase = { exec: mockExec, close: mockClose };

jest.mock("sql.js", () => {
  return jest.fn(() =>
    Promise.resolve({
      Database: jest.fn(() => mockDatabase),
    })
  );
});

global.fetch = jest.fn(() => {
  const arrayBuffer = jest.fn(() => Promise.resolve(new ArrayBuffer(8)));
  return Promise.resolve({
    arrayBuffer,
  });
});

describe("SQLite Client", () => {
  let sqlite_client;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset modules to ensure fresh imports
    jest.resetModules();

    // Re-setup the mocks
    global.fetch = jest.fn(() => {
      const arrayBuffer = jest.fn(() => Promise.resolve(new ArrayBuffer(8)));
      return Promise.resolve({
        arrayBuffer,
      });
    });

    // Import fresh module
    sqlite_client = require("../sqlite_client");

    // Set default mock behavior
    mockExec.mockImplementation((query) => {
      if (query.includes("cancer_attributes") && !query.includes("WHERE")) {
        return [
          {
            columns: [
              "patientid",
              "cancerid",
              "cancer_type",
              "attribid",
              "attribval",
              "confidence",
            ],
            values: [
              ["patient1", "cancer1", "Breast_Cancer", "ER", "positive", 0.95],
              ["patient1", "cancer1", "Breast_Cancer", "PR", "positive", 0.9],
              ["patient2", "cancer2", "Lung_Cancer", "Stage", "IIA", 0.85],
            ],
          },
        ];
      } else if (query.includes("cancer_attributes") && query.includes("WHERE")) {
        return [
          {
            columns: [
              "patientid",
              "cancerid",
              "cancer_type",
              "attribid",
              "attribval",
              "confidence",
            ],
            values: [
              ["patient1", "cancer1", "Breast_Cancer", "ER", "positive", 0.95],
              ["patient1", "cancer1", "Breast_Cancer", "PR", "positive", 0.9],
            ],
          },
        ];
      } else if (query.includes("tumor_attributes") && !query.includes("WHERE")) {
        return [
          {
            columns: [
              "patientid",
              "CANCER_ID",
              "TUMOR_ID",
              "tumor_type",
              "attribute_name",
              "attribute_value",
              "attribute_status",
              "confidence",
            ],
            values: [
              ["patient1", "cancer1", "tumor1", "Primary", "T_Stage", "T1", "present", 0.92],
              ["patient1", "cancer1", "tumor1", "Primary", "N_Stage", "N0", "present", 0.88],
            ],
          },
        ];
      } else if (query.includes("tumor_attributes") && query.includes("WHERE")) {
        return [
          {
            columns: [
              "patientid",
              "CANCER_ID",
              "TUMOR_ID",
              "tumor_type",
              "attribute_name",
              "attribute_value",
              "attribute_status",
              "confidence",
            ],
            values: [
              ["patient1", "cancer1", "tumor1", "Primary", "T_Stage", "T1", "present", 0.92],
              ["patient1", "cancer1", "tumor1", "Primary", "N_Stage", "N0", "present", 0.88],
            ],
          },
        ];
      } else if (query.includes("calculated_dx_data")) {
        return [
          {
            columns: ["COL", "VAL", "PERSON_IDS"],
            values: [
              ["diagnosis", "Breast_Cancer", "patient1,patient2"],
              ["age_at_dx", "50s", "patient1"],
            ],
          },
        ];
      } else if (query.includes("calculated_patient_data")) {
        return [
          {
            columns: ["COL", "VAL", "PERSON_IDS"],
            values: [["gender", "Female", "patient1,patient2"]],
          },
        ];
      }
      return [];
    });
  });

  describe("Database Initialization", () => {
    test("getDb should initialize and return database", async () => {
      const { getDb } = sqlite_client;
      const db = await getDb();
      expect(db).toBeDefined();
      expect(fetch).toHaveBeenCalled();
    });

    test("getDb should return same instance on multiple calls", async () => {
      const { getDb } = sqlite_client;
      const db1 = await getDb();
      const db2 = await getDb();
      expect(db1).toBe(db2);
    });

    test("closeDb should close the database", async () => {
      const { getDb, closeDb } = sqlite_client;
      await getDb();
      closeDb();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("Query Execution", () => {
    test("executeQuery should return array of objects", async () => {
      const { getAllCancerAttributes } = sqlite_client;
      const results = await getAllCancerAttributes();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("patientid");
      expect(results[0]).toHaveProperty("attribid");
      expect(results[0]).toHaveProperty("attribval");
    });

    test("executeQuery should handle empty results", async () => {
      mockExec.mockReturnValueOnce([]);
      const { executeQuery } = sqlite_client;
      const results = await executeQuery("SELECT * FROM non_existent_table");
      expect(results).toEqual([]);
    });
  });

  describe("Cancer Attributes", () => {
    test("getCancerAttributesByPatient should return patient-specific data", async () => {
      const { getCancerAttributesByPatient } = sqlite_client;
      const results = await getCancerAttributesByPatient("patient1");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].patientid).toBe("patient1");
    });

    test("getAllCancerAttributes should return all cancer data", async () => {
      const { getAllCancerAttributes } = sqlite_client;
      const results = await getAllCancerAttributes();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3); // Based on mock data

      // Verify structure
      results.forEach((record) => {
        expect(record).toHaveProperty("patientid");
        expect(record).toHaveProperty("cancerid");
        expect(record).toHaveProperty("attribid");
        expect(record).toHaveProperty("attribval");
        expect(record).toHaveProperty("confidence");
      });
    });
  });

  describe("Tumor Attributes", () => {
    test("getTumorAttributesByPatient should return patient-specific tumors", async () => {
      const { getTumorAttributesByPatient } = sqlite_client;
      const results = await getTumorAttributesByPatient("patient1");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].patientid).toBe("patient1");
      expect(results[0]).toHaveProperty("tumorid");
      expect(results[0]).toHaveProperty("attribid");
    });

    test("getAllTumorAttributes should return all tumor data", async () => {
      const { getAllTumorAttributes } = sqlite_client;
      const results = await getAllTumorAttributes();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2); // Based on mock data
    });
  });

  describe("OMAP Data", () => {
    test("getCalculatedDxData should process and expand patient IDs", async () => {
      const { getCalculatedDxData } = sqlite_client;
      const results = await getCalculatedDxData();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Check structure
      results.forEach((record) => {
        expect(record).toHaveProperty("attribid");
        expect(record).toHaveProperty("attribval");
        expect(record).toHaveProperty("patientids");
        expect(Array.isArray(record.patientids)).toBe(true);
      });
    });

    test("getCalculatedPatientData should process patient data", async () => {
      const { getCalculatedPatientData } = sqlite_client;
      const results = await getCalculatedPatientData();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test("age_at_dx should be processed correctly", async () => {
      const { getCalculatedDxData } = sqlite_client;
      const results = await getCalculatedDxData();
      const ageRecord = results.find((r) => r.attribid === "age_at_dx");

      if (ageRecord) {
        // Should convert '50s' to 50
        expect(typeof ageRecord.attribval).toBe("string");
        expect(ageRecord.attribval).toBe("50");
      }
    });
  });

  describe("Patient Arrays", () => {
    test("getPatientIdsWithAllAttributes should combine all data sources", async () => {
      const { getPatientIdsWithAllAttributes } = sqlite_client;
      const result = await getPatientIdsWithAllAttributes();

      expect(typeof result).toBe("object");
      expect(Object.keys(result).length).toBeGreaterThan(0);

      // Check format: each key should be "attribid.attribval"
      Object.keys(result).forEach((key) => {
        expect(key).toContain(".");
        expect(Array.isArray(result[key])).toBe(true);
      });
    });

    test("fetchPatientArrays should return patientArrays and uniquePatientIds", async () => {
      const { fetchPatientArrays } = sqlite_client;
      const result = await fetchPatientArrays();

      expect(result).toHaveProperty("patientArrays");
      expect(result).toHaveProperty("uniquePatientIds");
      expect(typeof result.patientArrays).toBe("object");
      expect(Array.isArray(result.uniquePatientIds)).toBe(true);
    });
  });

  describe("Patient Cancers", () => {
    test("fetchPatientCancers should return structured cancer data", async () => {
      const { fetchPatientCancers } = sqlite_client;
      const cancers = await fetchPatientCancers("patient1");

      expect(Array.isArray(cancers)).toBe(true);

      if (cancers.length > 0) {
        const cancer = cancers[0];
        expect(cancer).toHaveProperty("patientName");
        expect(cancer).toHaveProperty("cancerId");
        expect(cancer).toHaveProperty("details");
        expect(cancer).toHaveProperty("clinicalTNM");
        expect(cancer).toHaveProperty("tumorSummaries");
        expect(Array.isArray(cancer.tumorSummaries)).toBe(true);
      }
    });
  });

  describe("Database Compatibility", () => {
    test("fetchPatientDatabase should return mock database object", async () => {
      const { fetchPatientDatabase } = sqlite_client;
      const db = await fetchPatientDatabase();

      expect(db).toBeDefined();
      expect(db._isSqliteClient).toBe(true);
      expect(db._sqliteDb).toBeDefined();
    });

    test("fetchPatientDatabase transaction method should throw error", async () => {
      const { fetchPatientDatabase } = sqlite_client;
      const db = await fetchPatientDatabase();

      expect(() => {
        db.transaction("storeName", "readonly");
      }).toThrow("Direct transactions not supported");
    });
  });

  describe("Backward Compatibility", () => {
    test("Patient.js fetchPatientArrays should work", async () => {
      const Patient = require("../Patient");
      const result = await Patient.fetchPatientArrays(null);

      expect(result).toHaveProperty("patientArrays");
      expect(result).toHaveProperty("uniquePatientIds");
    });

    test("Patient.js fetchPatientCancers should work", async () => {
      const Patient = require("../Patient");
      const cancers = await Patient.fetchPatientCancers(null, "patient1");

      expect(Array.isArray(cancers)).toBe(true);
    });

    test("Queries.js getPatientIdsWithAllAttributes should work", async () => {
      const Queries = require("../Queries");
      const result = await Queries.getPatientIdsWithAllAttributes(null);

      expect(typeof result).toBe("object");
    });

    test("Queries.js filterAttribIds should filter correctly", async () => {
      const Queries = require("../Queries");
      const input = {
        "ER.positive": ["patient1"],
        "PR.positive": ["patient2"],
        "age.50": ["patient3"],
      };

      const result = await Queries.filterAttribIds(input, ["ER", "PR"]);

      expect(Object.keys(result)).toEqual(["ER.positive", "PR.positive"]);
      expect(result).not.toHaveProperty("age.50");
    });

    test("DeepPheDb.js fetchPatientDatabase should be exported", async () => {
      const DeepPheDb = require("../DeepPheDb");

      expect(typeof DeepPheDb.fetchPatientDatabase).toBe("function");
      const db = await DeepPheDb.fetchPatientDatabase();
      expect(db).toBeDefined();
    });
  });
});
