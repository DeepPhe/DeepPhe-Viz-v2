import { useEffect } from "react";

export default function Filter(definition, patArrays) {
  const [patientsMatchingThisFilter, setPatientsMatchingThisFilter] = React.useState(0);
  const [filterDefinition, setFilterDefinition] = React.useState(definition);
  const [patientArrays, setPatientArrays] = React.useState(patArrays);

  useEffect(() => {}, []);
  const update = () => {
    let matches = {};
    let func = null;
    switch (filterDefinition.class) {
      case "discreteList":
        break;
      case "categoricalRangeSelector":
        func = getCategoricalRangeSelectorValues;
        break;
      case "numericRangeSelector":
        console.log("numericRangeSelector");
        break;
      case "booleanList":
        func = getBooleanListValues;
        break;
      default:
        console.log("Unknown filter type");
    }

    if (func !== null) {
      matches = {
        ...matches,
        ...func(filterDefinition),
      };
      setPatientsMatchingThisFilter(matches);
      console.log(matches);
    }
  };

  const getCategoricalRangeSelectorValues = (filterDefinition) => {
    let matches = {};
    let filterMatches = [];
    filterDefinition.selectedCategoricalRange.forEach((range) => {
      console.log(filterDefinition.fieldName.toLowerCase() + "." + range);
      const aryName = filterDefinition.fieldName.toLowerCase() + "." + range;
      const ary = patientArrays[aryName];
      filterMatches = [...new Set([...filterMatches, ...ary])];
    });
    matches[filterDefinition.fieldName.toLowerCase()] = filterMatches;
    return matches;
  };

  const getBooleanListValues = (filterDefinition) => {
    let matches = {};
    filterDefinition.switches.forEach((switchDefinition) => {
      if (switchDefinition.value) {
        const aryName = filterDefinition.fieldName.toLowerCase() + "." + switchDefinition.name;
        matches[aryName] = patientArrays[aryName];
      }
    });
    return matches;
  };
}
