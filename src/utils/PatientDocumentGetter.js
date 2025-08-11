import { DATASOURCE } from "./PersonObjectGetterConst";
import { JsonPatientDocument } from "./JsonPatientDocument";

function getPatientDocument(currDocId, patientObject) {
  if (DATASOURCE === "JSON") {
    return new JsonPatientDocument(currDocId, patientObject);
    // return getPatientDocumentJson(currDocId, patientObject);
  }
}

export { getPatientDocument };
