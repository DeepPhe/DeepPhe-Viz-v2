import {PatientDocument} from "./PatientDocument";

export class JsonPatientDocument extends PatientDocument {
    #mentionsInDocument = []
    constructor(currDocId, patientObject) {
        super();
        this.patientDocument = patientObject.documents[currDocId];
        this.#mentionsInDocument = this.patientDocument?.mentions || [];
    }


    getMentionIdsInDocument = () => {
        return this.#mentionsInDocument
    }

    getConceptsInDocument = (concepts) => {
        const mentionIdSet = new Set(this.#mentionsInDocument.map(m => m.id));
        return concepts.filter((concept) =>
            concept.mentionIds?.some((id) => mentionIdSet.has(id))
        );
    }

    getDocumentText() {
        return this.patientDocument.text;
    }
}