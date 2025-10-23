import { getNewPatientJsonFromFile } from "./jsonReader";

function createEpisodeTimeline(patientId) {
  function formatDate(dateString) {
    // Extract first 8 characters (YYYYMMDD)
    const dateValue = dateString.substring(0, 8);

    // Extract year, month, and day
    const year = dateValue.substring(0, 4);
    const month = dateValue.substring(4, 6);
    const day = dateValue.substring(6, 8);

    // Format as YYYY/MM/DD
    return `${year}/${month}/${day}`;
  }

  const getReportJson = (json) => {
    return json["documents"].map((doc) => {
      return {
        id: doc.id,
        date: doc.date,
        type: doc.type,
        episode: doc.episode || "Unknown",
        name: doc.name || "No Name",
      };
    });
  };

  const getTypeCounts = (reportData) => {
    //count the number of reports by type
    const typeCounts = {};
    reportData.forEach((report) => {
      if (typeCounts[report.type]) {
        typeCounts[report.type]++;
      } else {
        typeCounts[report.type] = 1;
      }
    });
    return typeCounts;
  };

  const getEpisodeTypes = (reportData) => {
    //get the unique episode types from the report data
    const episodes = new Set();
    reportData.forEach((report) => {
      episodes.add(report.episode);
    });
    return Array.from(episodes);
  };

  const getEpisodeCounts = (reportData) => {
    //count the number of reports by episode
    const episodeCounts = {};
    reportData.forEach((report) => {
      if (episodeCounts[report.episode]) {
        episodeCounts[report.episode]++;
      } else {
        episodeCounts[report.episode] = 1;
      }
    });
    return episodeCounts;
  };

  const getReportTypes = (reportData) => {
    //get the unique report types from the report data
    const reportTypes = new Set();
    reportData.forEach((report) => {
      reportTypes.add(report.type);
    });
    return Array.from(reportTypes);
  };

  const getEpisodeDates = (reportData) => {
    const episodeDates = {};
    reportData.forEach((report) => {
      const formattedDate = formatDate(report.date);
      if (!episodeDates[report.episode]) {
        episodeDates[report.episode] = [];
      }
      episodeDates[report.episode].push(formattedDate);
    });
    return episodeDates;
  };

  const getMaxSameDateCountPerType = (reportData) => {
    //find the maximum number of reports per type that happened on the same date
    const maxCounts = {};
    reportData.forEach((report) => {
      const date = formatDate(report.date);
      if (!maxCounts[report.type]) {
        maxCounts[report.type] = {};
      }
      if (!maxCounts[report.type][date]) {
        maxCounts[report.type][date] = 0;
      }
      maxCounts[report.type][date]++;
    });
    //find the maximum count for each type
    const maxVerticalCountsPerType = {};
    for (const type in maxCounts) {
      maxVerticalCountsPerType[type] = Math.max(...Object.values(maxCounts[type]));
    }
    return maxVerticalCountsPerType;
  };

  /**
   * "reportsGroupedByDateAndTypeObj": {
   *     "2010/02/15": {
   *       "Clinical note": [
   *         {
   *           "id": "fake_patient5_doc10_NOTE_1590032769",
   *           "date": "2010/02/15",
   *           "type": "Clinical note",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2010/02/07": {
   *       "Surgical pathology report": [
   *         {
   *           "id": "fake_patient5_doc9_SP_-51247919",
   *           "date": "2010/02/07",
   *           "type": "Surgical pathology report",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2010/02/06": {
   *       "Radiology report": [
   *         {
   *           "id": "fake_patient5_doc8_RAD_-536271957",
   *           "date": "2010/02/06",
   *           "type": "Radiology report",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2010/02/05": {
   *       "Clinical note": [
   *         {
   *           "id": "fake_patient5_doc7_NOTE_-781370300",
   *           "date": "2010/02/05",
   *           "type": "Clinical note",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2009/10/01": {
   *       "Clinical note": [
   *         {
   *           "id": "fake_patient5_doc6_NOTE_2015302953",
   *           "date": "2009/10/01",
   *           "type": "Clinical note",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2009/09/02": {
   *       "Surgical pathology report": [
   *         {
   *           "id": "fake_patient5_doc5_SP_-1762744257",
   *           "date": "2009/09/02",
   *           "type": "Surgical pathology report",
   *           "episode": "Diagnostic"
   *         }
   *       ]
   *     },
   *     "2009/06/30": {
   *       "Clinical note": [
   *         {
   *           "id": "fake_patient5_doc4_NOTE_367559967",
   *           "date": "2009/06/30",
   *           "type": "Clinical note",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2009/05/10": {
   *       "Clinical note": [
   *         {
   *           "id": "fake_patient5_doc3_NOTE_-1818572823",
   *           "date": "2009/05/10",
   *           "type": "Clinical note",
   *           "episode": "Unknown"
   *         }
   *       ]
   *     },
   *     "2009/05/05": {
   *       "Surgical pathology report": [
   *         {
   *           "id": "fake_patient5_doc2_SP_654927331",
   *           "date": "2009/05/05",
   *           "type": "Surgical pathology report",
   *           "episode": "Pre-diagnostic"
   *         }
   *       ],
   *       "Radiology report": [
   *         {
   *           "id": "fake_patient5_doc1_RAD_-896054553",
   *           "date": "2009/05/05",
   *           "type": "Radiology report",
   *           "episode": "Pre-diagnostic"
   *         }
   *       ]
   *     }
   *   },
   */

  const getReportsGroupedByDateAndType = (reportData) => {
    const reportsGroupedByDateAndTypeObj = {};

    reportData.forEach((report) => {
      const date = report.date;
      if (!reportsGroupedByDateAndTypeObj[date]) {
        reportsGroupedByDateAndTypeObj[date] = {};
      }
      if (!reportsGroupedByDateAndTypeObj[date][report.type]) {
        reportsGroupedByDateAndTypeObj[date][report.type] = [];
      }
      reportsGroupedByDateAndTypeObj[date][report.type].push(report);
    });

    return reportsGroupedByDateAndTypeObj;
  };

  const getDemographics = (json) => {
    const obj = {};

    obj.patientId = patientId;
    obj.patientName = "martha van zandt";
    obj.birthDate = "1965-07-23";
    obj.lastEncounterAge = "55";
    obj.firstEncounterAge = "54";
    obj.lastEncounterDate = "2020-09-03";
    obj.firstEncounterDate = "2019-10-12";
    obj.gender = "F";
    return obj;
  };

  return new Promise((resolve, reject) => {
    if (!patientId) {
      reject(new Error("Patient ID is required"));
    } else {
      getNewPatientJsonFromFile(patientId).then((json) => {
        const obj = {};
        obj.patientInfo = getDemographics(json);
        obj.reportData = getReportJson(json);
        obj.typeCounts = getTypeCounts(obj.reportData);
        obj.episodes = getEpisodeTypes(obj.reportData);
        obj.episodeCounts = getEpisodeCounts(obj.reportData);
        obj.reportTypes = getReportTypes(obj.reportData);
        obj.episodeDates = getEpisodeDates(obj.reportData);
        obj.maxVerticalCountsPerType = getMaxSameDateCountPerType(obj.reportData);
        obj.reportsGroupedByDateAndTypeObj = getReportsGroupedByDateAndType(obj.reportData);

        resolve({ timeline: obj, fullJson: json });
      });
    }
  });
}

export default createEpisodeTimeline;
