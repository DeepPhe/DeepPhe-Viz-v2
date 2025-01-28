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

const filterDefinitions = (filterDefinitions, definitionsToKeep) => {
  //for each filterDefintion, if the name matches a name in the definitionnstoKeep array, keep it
  return filterDefinitions.filter((definition) => {
    return definitionsToKeep.includes(definition.fieldName);
  });
};

const initFilterDefinitions = (filterDefinitions) => {
  return new Promise((resolve, reject) => {
    let filterGuiInfo = {};
    const definitions = filterDefinitions(filterDefinitions, ["T Stage", "N Stage", "M Stage"]);
    definitions.forEach((definition) => {
      if (definition.class === "categoricalRangeSelector") {
        definition.categoricalRange = [...definition.selectedCategoricalRange];
      }
      filterGuiInfo = addGuiInfo(filterGuiInfo, definition);

      //need to sum the members of each array
      definition.numberOfPossiblePatientsForThisFilter =
        definition.globalPatientCountsForCategories.reduce((acc, currentItem) => {
          return acc + currentItem.count;
        });
      definition.toggleFilterEnabled = that.toggleFilterEnabled;
    });
    const sortedGuiInfo = sortGuiInfo();
    resolve([filterDefinitions, filterGuiInfo]);
  });
};

export { initFilterDefinitions };
