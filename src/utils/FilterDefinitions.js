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

const setpatientCountsByCategory = (definitions, patientArrays) => {
  return new Promise((resolve, reject) => {
    definitions.forEach((definition) => {
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
          //sort categories alphabetically
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
          definition.selectedCategoricalRange = definition.categoricalRange;
        }
      }
    });
    resolve(definitions);
  });
};
const getAbbrevCategories = (categories) => {
  function abbreviateLabel(label) {
    const mapping = {
      // Existing mappings:
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
      "Genes.Breast Cancer Type 1 Susceptibility Protein": "BRCA1",
      "Genes.Cadherin-1": "CDH1",
      "Genes.CDH1 Gene": "CDH1",
      "Genes.DNA Repair Protein XRCC1": "XRCC1",
      "Genes.ERBB2 Gene": "ERBB2",
      "Genes.Oncogene ErbB2": "ERBB2",
      "Genes.Oncogene MAX": "MAX",
      "Genes.TUSC2 wt Allele": "TUSC2",
      "Genes.XRCC1 wt Allele": "XRCC1wt", // Grade mappings (removing the "" prefix):
      "Grade.Grade 1": "1",
      "Grade.Grade 2": "2",
      "Grade.Grade 3": "3",
      "Grade.Grade 4": "4",
      "Grade.High Grade": "High",
      "Grade.Intermediate Grade": "Intermediate",
      "Grade.Low Grade": "Low",
      "Grade.Moderately Differentiated": "Mod Diff",
      "Grade.Poorly Differentiated": "Poor Diff",
      "Grade.Well Differentiated": "Well Diff",
    };

    // Return the abbreviation if the label exists in the mapping.
    if (mapping[label]) {
      return mapping[label];
    }

    // For unknown labels: generate an abbreviation by taking the first letter of each word.
    const words = label.split(" ").filter((word) => word.length > 0);
    if (words.length > 1) {
      return words.map((word) => word[0].toUpperCase()).join("");
    } else if (words.length === 1) {
      return label.slice(0, 3).toUpperCase();
    }

    // Fallback: return the label as-is.
    return label;
  }

  function abbreviateLabels(categories) {
    return categories.map(abbreviateLabel);
  }

  // Example usage:

  return abbreviateLabels(categories);
};
const initFilterDefinitions = (filterDefinitions, patientArrays) => {
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
      "Genes", // Add your new attribute here
    ]);
    setpatientCountsByCategory(definitions, patientArrays).then((definitions) => {
      definitions.forEach((definition) => {
        definition.enabled = true;
        definition.abbrevCategories = getAbbrevCategories(definition.categoricalRange);
        definition.patientsMeetingThisFilterOnly = [];
        if (definition.class === "categoricalRangeSelector") {
          definition.categoricalRange = [...definition.selectedCategoricalRange];
        } else if (definition.class === "valueSelector") {
          // Add this block
          definition.selectedValue = "";
        }
        filterGuiInfo = addGuiInfo(filterGuiInfo, definition);

        definition.numberOfPossiblePatientsForThisFilter =
          definition.patientCountsByCategory.reduce((acc, currentItem) => {
            return acc + currentItem.count;
          });
      });
      const sortedGuiInfo = sortGuiInfo(filterGuiInfo);
      resolve([definitions, filterGuiInfo]);
    });
  });
};
export { initFilterDefinitions };
