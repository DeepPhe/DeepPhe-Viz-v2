const getPatientDocumentJson = (currDocId, patientObject) => {
  // const safeDocIndex = Math.max(0, Math.min(currDoc, patientObject.documents.length - 1));
  // return patientObject.documents[currDocId];
};

const getConceptsPerDocumentRef = (patientObject) => {
  const map = {};
  patientObject.documents.forEach((doc) => {
    const mentionIdsInDoc = doc.mentions.map((m) => m.id);
    map[`main_${doc.name}`] = patientObject.concepts.filter((concept) =>
      concept.mentionIds?.some((id) => mentionIdsInDoc.includes(id))
    );
  });
  return map;
};

const hasDocuments = (patientObject) => {
  return patientObject?.documents?.length;
};

export { getPatientDocumentJson, getConceptsPerDocumentRef, hasDocuments };
