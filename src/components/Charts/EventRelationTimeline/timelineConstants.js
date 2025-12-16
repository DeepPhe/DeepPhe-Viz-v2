// API ---------------------------------------------------------
export const BASE_URI = "http://localhost:3001/api";
export const TRANSITION_DURATION = 800;

// Domain mapping ----------------------------------------------
export const LANE_GROUPS = {
  behavior: "Stage, Grade",
  "disease stage qualifier": "Stage, Grade",
  "disease grade qualifier": "Stage, Grade",
  "temporal qualifier": "Stage, Grade",
  severity: "Stage, Grade",
  "pathologic tnm finding": "Stage, Grade",
  "generic tnm finding": "Stage, Grade",

  finding: "Finding",
  "clinical test result": "Finding",
  gene: "Finding",
  "gene product": "Finding",

  "disease or disorder": "Disease",
  neoplasm: "Disease",
  mass: "Disease",

  "pharmacologic substance": "Treatment",
  "chemo/immuno/hormone therapy regimen": "Treatment",
  "intervention or procedure": "Treatment",
  "imaging device": "Treatment",

  unknown: "Other",
};

// Layout -------------------------------------------------------
export const MARGINS = { top: 5, right: 20, bottom: 5, left: 200 };

export const ARROW = { width: 20, LabelGap: 5, labelPadding: 10 };

export const LEGEND = {
  height: 22,
  spacing: 2,
  anchorX: 40,
  anchorY: 6,
};

export const TEXT = {
  widthPerLetter: 12,
  marginLeft: 10,
  mainRowHeight: 10,
  overviewRowHeight: 3,
};

export const AGE_AREA = {
  height: 10,
  bottomPad: 10,
};

export const REPORT_RADIUS = {
  main: 5,
  overview: 1.5,
};

export const GAPS = {
  legendToMain: 5,
  pad: 25,
};

export const TIMELINE_PADDING_DAYS = 50;

// Marker toggle ------------------------------------------------
export const MARKER_TOGGLE_MAP = {
  "url(#rightCap)": "url(#selectedRightCap)",
  "url(#selectedRightCap)": "url(#rightCap)",
  "url(#leftCap)": "url(#selectedLeftCap)",
  "url(#selectedLeftCap)": "url(#leftCap)",
  "url(#verticalLineCap)": "url(#selectedVerticalLineCap)",
  "url(#selectedVerticalLineCap)": "url(#verticalLineCap)",
  "url(#rightArrow)": "url(#selectedRightArrow)",
  "url(#selectedRightArrow)": "url(#rightArrow)",
  "url(#leftArrow)": "url(#selectedLeftArrow)",
  "url(#selectedLeftArrow)": "url(#leftArrow)",
};
