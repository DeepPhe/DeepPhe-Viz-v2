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
      "Complete Remission": "CR",
      "Disease Controlled": "DC",
      "Disease Sequela": "DS",
      "Extranodal Involvement": "ENI",
      "Localized Disease": "LD",
      "No Evidence of Metastatic Disease": "NEMD",
      "Partial Remission": "PR",
      "Pathologic Complete Response": "pCR",
      "Progressive Disease": "PD",
      "Recovered from Adverse Event without Sequelae": "RFAwS",
      "Aortopulmonary Window Lymph Node": "LI-AWLN",
      "Axillary Lymph Node": "LI-ALN",
      "Femoral Lymph Node": "LI-FLN",
      "Internal Mammary Lymph Node": "LI-IMLN",
      "Intramammary Lymph Node": "LI-ITLN",
      "Lymph Node": "LI-LN",
      "Mediastinal Lymph Node": "LI-MLN",
      "Paratracheal Lymph Node": "LI-PTLN",
      "Regional Lymph Node": "LI-RLN",
      "Sentinel Lymph Node": "LI-SLN", // Gene mappings:
      "Breast Cancer Type 1 Susceptibility Protein": "BRCA1",
      "Cadherin-1": "CDH1",
      "CDH1 Gene": "CDH1",
      "DNA Repair Protein XRCC1": "XRCC1",
      "ERBB2 Gene": "ERBB2",
      "Oncogene ErbB2": "ERBB2",
      "Oncogene MAX": "MAX",
      "TUSC2 wt Allele": "TUSC2",
      "XRCC1 wt Allele": "XRCC1wt",
      // Grade mappings (removing the "" prefix):
      "Grade 1": "1",
      "Grade 2": "2",
      "Grade 3": "3",
      "Grade 4": "4",
      "High Grade": "High",
      "Intermediate Grade": "Intermediate",
      "Low Grade": "Low",
      "Moderately Differentiated": "Mod Diff",
      "Poorly Differentiated": "Poor Diff",
      "Well Differentiated": "Well Diff",
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
