export function getNewPatientJsonFromFile(patientId) {
  return new Promise((resolve, reject) => {
    fetch(`../../../docs/${patientId}.json`).then((v) => {
      v.json().then((json) => {
        resolve(json);
      });
    });
  });
}
