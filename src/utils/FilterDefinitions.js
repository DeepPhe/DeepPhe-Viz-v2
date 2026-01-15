const addGuiInfo = (obj, definition) => {
  const group = definition.guiOptions.displayGroup;
  const priority = definition.guiOptions.displayPriority;
  const displayName = definition.guiOptions.displayName;
  const name = definition.fieldName;
  if (obj.hasOwnProperty(definition.guiOptions.displayGroup)) {
    obj[group].push({
      displayName: displayName,
      group: group,
      priority: priority,
      definitionName: name,
    });
  } else {
    obj[group] = [
      {
        displayName: displayName,
        group: group,
        priority: priority,
        definitionName: name,
      },
    ];
  }
  return obj;
};

const sortGuiInfo = (guiInfo) => {
  const sorted = {};
  Object.keys(guiInfo).forEach((key) => {
    //sort by priority and then displayName
    sorted[key] = guiInfo[key].sort((a, b) => {
      if (a.priority < b.priority) return -1;
      if (a.priority > b.priority) return 1;
      if (a.displayName < b.displayName) return -1;
      if (a.displayName > b.displayName) return 1;
      return 0;
    });
  });
  //apply rules
  return sorted;
};

const filterTheDefinitionsByName = (filterDefinitions, definitionsToKeep) => {
  //for each filterDefintion, if the name matches a name in the definitionnstoKeep array, keep it
  return filterDefinitions.filter((definition) => {
    return definitionsToKeep.includes(definition.fieldName);
  });
};

const setPatientCountsByCategory = (definitions, patientArrays, uniquePatientIds) => {
  return new Promise((resolve, reject) => {
    definitions.forEach((definition) => {
      const patientsWithKnownValuesInFilterSet = new Set();
      definition.categoricalRange = [];
      definition.patientCountsByCategory = [];
      const fieldName = definition.fieldName.toLowerCase();
      for (const key in patientArrays) {
        if (key.toLowerCase().startsWith(fieldName)) {
          definition.categoricalRange.push(key);
          definition.patientCountsByCategory.push({
            category: key,
            count: patientArrays[key].length,
            patients: [...patientArrays[key]],
          });
          patientArrays[key].map((id) => {
            patientsWithKnownValuesInFilterSet.add(id);
          });
          //sort categories alphabetically
        }
      }
      definition.patientCountsByCategory.sort((a, b) => {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return 0;
      });
      definition.categoricalRange.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
      const patientsWithUnknownValues = [];
      definition.selectedCategoricalRange = definition.categoricalRange;
      uniquePatientIds.forEach((id) => {
        if (!patientsWithKnownValuesInFilterSet.has(id)) {
          patientsWithUnknownValues.push(id);
        }
      });

      if (patientsWithUnknownValues.length > 0) {
        definition.categoricalRange.push("?");
        definition.patientCountsByCategory.push({
          category: "?",
          count: patientsWithUnknownValues.length,
          patients: patientsWithUnknownValues,
        });
      }

      definition.checkboxes = [];
      definition.categoricalRange.forEach((name) => {
        definition.checkboxes.push({ name: name, checked: true });
      });

      resolve(definitions);
    });
  });
};

const rollupStage = (definition) => {
  let newDefinition = { ...definition };
  let newRanges = new Set();
  const regex = /\[ABC\]/g;
  newDefinition.categoricalRange.forEach((range) => {
    const matches = range.match(regex);
    if (matches) {
      const lastMatchIndex = range.lastIndexOf(matches[matches.length - 1]);
      newRanges.add(range.substring(0, lastMatchIndex));
    }
  });
  return newRanges;
};

const getAbbrevCategories = (categories) => {
  function abbreviateLabel(label) {
    const mapping = {
      "Stage.": "N/S", // Remove the "Stage." prefix
      "Stage.Stage 0": "0",
      "Stage.Stage 0A": "0A",
      "Stage.Stage 0B": "0B",
      "Stage.Stage 0C": "0C",
      "Stage.Stage I": "I",
      "Stage.Stage IA": "IA",
      "Stage.Stage IB": "IB",
      "Stage.Stage IC": "IC",
      "Stage.Stage Is": "IS",
      "Stage.Stage II": "II",
      "Stage.Stage IIA": "IIA",
      "Stage.Stage IIB": "IIB",
      "Stage.Stage IIC": "IIC",
      "Stage.Stage III": "III",
      "Stage.Stage IIIA": "IIIA",
      "Stage.Stage IIIB": "IIIB",
      "Stage.Stage IIIC": "IIIC",
      "Stage.Stage IV": "IV",
      "Stage.Stage IVA": "IVA",
      "Stage.Stage IVB": "IVB",
      "Stage.Stage IVC": "IVC",
      "T Stage.": "N/S", // Remove the "T Stage." prefix
      "T Stage.T0": "T0",
      "T Stage.T1": "T1",
      "T Stage.PT1a": "PT1a",
      "T Stage.PT1c": "PT1c", // Correct mapping
      "T Stage.T1a": "T1a",
      "T Stage.T1b": "T1b",
      "T Stage.T1c": "T1c",
      "T Stage.T2": "T2",
      "T Stage.T2a": "T2a",
      "T Stage.T2b": "T2b",
      "T Stage.T3": "T3",
      "T Stage.T4": "T4",
      "T Stage.T4a": "T4a",
      "T Stage.T4b": "T4b",
      "T Stage.T4c": "T4c",
      "N Stage.": "N/S", // Remove the "N Stage." prefix
      "N Stage.N0": "N0",
      "N Stage.N1": "N1",
      "N Stage.N1a": "N1a",
      "N Stage.N1b": "N1b",
      "N Stage.N1mi": "N1mi",
      "N Stage.N2a": "N2a",
      "N Stage.N2": "N2",
      "N Stage.N2b": "N2b",
      "N Stage.N3a": "N3a",
      "N Stage.PN0": "PN0",
      "N Stage.PN1a": "PN1a",
      "N Stage.N3c": "N3c",
      "M Stage.": "N/S", // Remove the "M Stage." prefix
      "M Stage.M0": "M0",

      "CANCER.B": "Br",
      "CANCER.L": "Lu",
      "CANCER.O": "Ov", // Remove the "CANCER." prefix
      "Course.": "N/S", // Remove the "Course." prefix
      "AGE_AT_DX.": "N/S", // Remove the "AGE_AT_DX." prefix
      "AGE_AT_DX.30": "30",
      "AGE_AT_DX.40": "40",
      "AGE_AT_DX.50": "50",
      "AGE_AT_DX.60": "60",
      "AGE_AT_DX.70": "70",
      "AGE_AT_DX.80": "80",
      "Course.Complete Remission": "CR",
      "Course.Disease Controlled": "DC",
      "Course.Disease Sequela": "DS",
      "Course.Extranodal Involvement": "ENI",
      "Course.Localized Disease": "LD",
      "Course.No Evidence of Metastatic Disease": "NEMD",
      "Course.Partial Remission": "PR",
      "Course.Pathologic Complete Response": "pCR",
      "Course.Progressive Disease": "PD",
      "Course.Recovered from Adverse Event without Sequelae": "RFAwS",
      "Course.Remission": "Rem",
      "Course.Residual Disease": "RD",
      "Course.Stable Disease": "SD",
      "Lymph Involvement.": "N/S",
      "Lymph Involvement.Aortopulmonary Window Lymph Node": "AWLN",
      "Lymph Involvement.Axillary Lymph Node": "ALN",
      "Lymph Involvement.Femoral Lymph Node": "FLN",
      "Lymph Involvement.Internal Mammary Lymph Node": "IMLN",
      "Lymph Involvement.Intramammary Lymph Node": "ITLN",
      "Lymph Involvement.Lymph Node": "LN",
      "Lymph Involvement.Mediastinal Lymph Node": "MLN",
      "Lymph Involvement.Paratracheal Lymph Node": "PTLN", // Correct mapping
      "Lymph Involvement.Regional Lymph Node": "RLN",
      "Lymph Involvement.Sentinel Lymph Node": "SLN", // Gene mappings:
      "Laterality.": "N/S", // Remove the "Laterality." prefix
      "Laterality.Left": "L",
      "Laterality.Right": "R",
      "Laterality.Bilateral": "B",
      "GENDER.F": "F",
      "Genes.": "N/S", // Remove the "Genes." prefix
      "Genes.Breast Cancer Type 1 Susceptibility Protein": "BRCA1",
      "Genes.Cadherin-1": "Cadh1",
      "Genes.CDH1 Gene": "CDH1",
      "Genes.DNA Repair Protein XRCC1": "XRCC1",
      "Genes.ERBB2 Gene": "ERBB2",
      "Genes.Oncogene ErbB2": "ErbB2",
      "Genes.Oncogene MAX": "MAX",
      "Genes.TUSC2 wt Allele": "TUSC2wA",
      "Genes.XRCC1 wt Allele": "XRCC1wA", // Grade mappings (removing the "" prefix):
      "Grade.": "N/S", // Remove the "Grade." prefix
      "Grade.Grade 1": "1",
      "Grade.Grade 2": "2",
      "Grade.Grade 3": "3",
      "Grade.Grade 4": "4",
      "Grade.High Grade": "High",
      "Grade.Intermediate Grade": "Int",
      "Grade.Low Grade": "Low",
      "Grade.Moderately Differentiated": "ModDiff",
      "Grade.Poorly Differentiated": "PoorDiff",
      "Grade.Well Differentiated": "WellDiff",
      "Topography, major.C22": "C22",
      "Topography, major.C34": "C34",
      "Topography, major.C41": "C41",
      "Topography, major.C50": "C50",
      "Topography, major.C56": "C56",
      "Topography, major.C71": "C71",
      "Topography, major.C77": "C77",
      "Topography, minor.0": "0",
      "Topography, minor.1": "1",
      "Topography, minor.2": "2",
      "Topography, minor.3": "3",
      "Topography, minor.4": "4",
      "Topography, minor.5": "5",
      "Topography, minor.6": "6",
      "Topography, minor.7": "7",
      "Metastatic Site.": "N/S",
      "Metastatic Site.Bone": "Bone",
      "Metastatic Site.Axilla": "Axilla",
      "Metastatic Site.Axillary Lymph Node": "ALN",
      "Metastatic Site.Rib": "Rib",
      "Metastatic Site.Thoracic Spine": "T.Spine", // Remove the "T Stage." prefix
      "Location.": "N/S", // Remove the "Location." prefix
      "Location.Breast": "Breast",
      "Location.Duct": "Duct",
      "Location.Lung": "Lung",
      "Location.Ovary": "Ov",
      "Location.Bone": "Bone",
      "Location.Lymph Node": "Lymph Node",
      "Location.Liver": "Liver",
      "Location.Pancreas": "Pancreas",
      "Location.Skin": "Skin",
      "Location.Brain": "Brain",
      "Location.Brainstem": "Brainstem",
      "Location.Central Nervous System": "CNS",
      "Location.Gastrointestinal Tract": "GI",
      "Location.Axillary Lymph Node": "Ax. LN",
      "Location.Upper Inner Quadrant": "UIQ",
      "Location.Upper Outer Quadrant": "UOQ",
      "Location.Lower Inner Quadrant": "LIQ",
      "Location.Lower Outer Quadrant": "LOQ",
      "Location.Upper Outer Quadrant of Breast": "UOQ B",
      "Location.Upper-Outer Quadrant of the Breast": "UOQ B",
      "Location.Lower-Outer Quadrant of the Breast": "LOQ B",
      "Location.Lower-Inner Quadrant of Breast": "LIQ B",
      "Location.Upper-Inner Quadrant of the Breast": "UIQ B",
      "Location.Lower Lobe of the Left Lung": "LLL Lung",
      "Location.Lower Lobe of the Right Lung": "LRL Lung",
      "Location.Upper Lobe of the Left Lung": "ULL Lung",
      "Location.Upper Lobe of the Right Lung": "URL Lung",
      "Location.Lumbar Vertebra": "LV",
      "Location.Axilla": "Axilla",
      "Location.Thoracic Spine": "T.Spine",
      "ETHNICITY.Not Hispanic or Latino": "Not HorL",
      "RACE.Asian": "Asian",
      "RACE.Black": "Black",
      "RACE.White": "White",
    };

    // Add the stage mappings to mappings
    const combinedMappings = { ...mapping };

    // Return the abbreviation if the label exists in the combined mapping.
    if (combinedMappings[label]) {
      return combinedMappings[label];
    }

    // // For unknown labels: generate an abbreviation by taking the first letter of each word.
    // const words = label.split(" ").filter((word) => word.length > 0);
    // if (words.length > 1) {
    //   return words.map((word) => word[0].toUpperCase()).join("");
    // } else if (words.length === 1) {
    //   return label.slice(0, 3).toUpperCase();
    // }

    // Fallback: return the label as-is.
    //does the label have a period?
    // if (label.includes(".")) {
    //   return label.split(".")[1];
    // }
    return label;
  }

  function abbreviateLabels(categories) {
    return categories.map(abbreviateLabel);
  }

  // Example usage:
  return abbreviateLabels(categories);
};
const initFilterDefinitions = (filterDefinitions, patientArrays, uniquePatientIds) => {
  return new Promise((resolve, reject) => {
    let filterGuiInfo = {};
    let definitions = filterTheDefinitionsByName(filterDefinitions, [
      "T Stage",
      "N Stage",
      "M Stage",
      "Stage",
      "Grade",
      "Lymph Involvement",
      "Course",
      "Genes",
      "Cancer",
      "Age_at_DX",
      "Laterality",
      "Location",
      "Topography, major",
      // "Topography, minor",
      "Metastatic Site",
      "Histology",
      "Gender", // Add your new attribute here
      "Ethnicity",
      "Race",
    ]);
    setPatientCountsByCategory(definitions, patientArrays, uniquePatientIds).then((definitions) => {
      definitions.forEach((definition) => {
        definition.enabled = true;
        if (definition.fieldName.startsWith("Stage")) {
          const newStages = rollupStage(definition);
          //console.log(newStages);
        }
        definition.abbrevCategories = getAbbrevCategories(definition.categoricalRange);
        definition.patientsMeetingThisFilterOnly = [];
        if (definition.class === "categoricalRangeSelector") {
          definition.categoricalRange = [...definition.selectedCategoricalRange];
        } else if (definition.class === "valueSelector") {
          // Add this block
          definition.selectedValue = "";
        }
        filterGuiInfo = addGuiInfo(filterGuiInfo, definition);

        // definition.numberOfPossiblePatientsForThisFilter =
        //   definition.patientCountsByCategory.reduce((acc, currentItem) => {
        //     return acc + currentItem.count;
        //   });
      });
      const sortedGuiInfo = sortGuiInfo(filterGuiInfo);
      resolve([definitions, filterGuiInfo]);
    });
  });
};
export { initFilterDefinitions };
