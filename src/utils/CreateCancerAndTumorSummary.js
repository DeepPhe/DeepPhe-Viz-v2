import { getNewPatientJsonFromFile } from "./jsonReader";

export default function createCancerAndTumorSummary(patientId) {
  const factsToIgnore = [
    "HER2/Neu Status",
    "Progesterone Receptor Status",
    "Estrogen Receptor Status",
    "Course",
    "Lymph Involvement",
    "Treatments",
    "Behavior",
    "Tissue",
    "Quadrant",
    "Topography, minor",
    "Topography, major",
    "Test Results",
    "Procedures",
    "T Stage",
    "N Stage",
    "M Stage",
  ];

  function getTnm(cancerJson) {
    const tnmLabels = ["T Stage", "N Stage", "M Stage"];
    const result = [];
    const resultTypeData = {};
    resultTypeData.data = {};
    cancerJson.attributes.forEach((attribute) => {
      if (tnmLabels.includes(attribute.name)) {
        const obj = [];
        const letter = attribute.name.substring(0, 1).toUpperCase();

        attribute.values.map((tnm) => {
          obj.push({
            id: tnm.id,
            name: tnm.classUri,
            prettyName: tnm.classUri,
            value: tnm.value,
          });
        });
        resultTypeData.data[letter] = obj;
        resultTypeData.type = "";
      }
    });
    result.push(resultTypeData);
    return result;
  }

  function getTumors(cancerJson) {
    return cancerJson.tumors.map((tumor) => ({
      id: tumor.id,
      type: tumor.id,
      data: tumor.attributes.map((attribute) => {
        if (!factsToIgnore.includes(attribute.name)) {
          return {
            category: attribute.name,
            categoryClass: attribute.name,
            facts: attribute.values.map((fact) => ({
              id: fact.id,
              name: fact.classUri,
              prettyName: fact.value,
              value: fact.value,
            })),
          };
        }
      }),
    }));
  }

  function getTableViewData(cancerJson) {
    return [];
  }

  function getCollatedCancerFacts(cancerJson) {
    const collatedFacts = [];

    cancerJson.attributes.forEach((attribute) => {
      const category = attribute.name;
      const categoryName = attribute.name;
      const facts = attribute.values.map((fact) => ({
        id: fact.id,
        name: fact.classUri,
        prettyName: fact.value,
        value: fact.value,
      }));
      if (factsToIgnore.includes(category)) {
        return;
      }
      collatedFacts.push({ category, categoryName, facts });
    });
    return collatedFacts;
  }

  function getCancers(json) {
    return json.cancers.map((cancer) => ({
      cancerId: cancer.id,
      title: cancer.id,
      tnm: getTnm(cancer),
      tumors: {
        tumors: getTumors(cancer),
        listViewData: getTumors(cancer),
        tableViewData: getTableViewData(cancer),
      },

      collatedCancerFacts: getCollatedCancerFacts(cancer),
    }));
  }

  return new Promise((resolve, reject) => {
    if (!patientId) {
      reject(new Error("Patient ID is required"));
    } else {
      getNewPatientJsonFromFile(patientId).then((json) => {
        const obj = getCancers(json);
        resolve(obj);
      });
    }
  });
}
