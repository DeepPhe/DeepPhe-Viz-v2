import { LANE_GROUPS } from "./timelineConstants";

export const fetchTXTData = async (getDpheGroupByConceptId, getNegatedByConceptId) => {
  try {
    const response = await fetch("/docs/Patient01_times.txt");
    if (!response.ok) throw new Error("Failed to load file");

    const text = await response.text();
    return parseTXT(text, getDpheGroupByConceptId, getNegatedByConceptId);
  } catch (error) {
    console.error("Error loading TSV:", error);
    return null;
  }
};

/**
 * Parse TXT into structured fields.
 * @param {string} txt - Raw text to parse
 * @param getDpheGroupByConceptId
 * @returns {Object} Parsed info about the patient and concepts
 */
export const parseTXT = (txt, getDpheGroupByConceptId, getNegatedByConceptId) => {
  const lines = txt.trim().split("\n");
  const headers = lines[0].split("\t").map((h) => h.trim());
  const dpheGroupCounts = {};
  const laneGroupCounts = {};

  /**
   * Creates a dataset with all relations, dpheCounts, and laneGroupCounts
   */
  const data = lines.slice(1).map((line) => {
    const values = line.split("\t");
    const obj = headers.reduce((acc, header, index) => {
      acc[header] = values[index]?.trim()?.replace(/^"|"$/g, "");
      return acc;
    }, {});

    // Get and assign dpheGroup
    const dpheGroup = getDpheGroupByConceptId(obj.ConceptID);
    obj.dpheGroup = dpheGroup;

    obj.negated = getNegatedByConceptId(obj.ConceptID);

    // Assign laneGroup and count occurrences
    if (dpheGroup) {
      dpheGroupCounts[dpheGroup] = (dpheGroupCounts[dpheGroup] || 0) + 1;
      const laneGroup = LANE_GROUPS[dpheGroup.toLowerCase()] || "Uncategorized";
      obj.laneGroup = laneGroup;
      laneGroupCounts[laneGroup] = (laneGroupCounts[laneGroup] || 0) + 1;
    }
    return obj;
  });

  data.dpheGroupCounts = dpheGroupCounts;
  data.laneGroupsCounts = laneGroupCounts;
  return data;
};
