import {DATASOURCE} from "./PersonObjectGetterConst";
import * as jsonReader from "./jsonReader";

export function getNewPatientObject(patientId) {
    if (DATASOURCE === "JSON") {
        return jsonReader.getNewPatientJsonFromFile(patientId);
    }
}
