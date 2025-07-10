export function appendMentionsToTSV(tsvString, conceptsPerDocument) {

    // Split TSV text into lines
    const lines = tsvString.trim().split('\n');

    // Extract headers
    const headers = lines[0].split('\t').map(h => h.trim());

    // Parse rows into objects
    const rows = lines.slice(1).map(line => {
        const values = line.split('\t');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index]?.trim() ?? '';
        });
        return row;
    });

    // Add note_id and concept_id from conceptsPerDocument
    let rowIndex = 0;

    Object.entries(conceptsPerDocument).forEach(([note_id, conceptIds]) => {
        conceptIds.forEach(concept_id => {
            if (rowIndex < rows.length) {
                rows[rowIndex].note_id = note_id;
                rows[rowIndex].concept_id = concept_id.id;
                rowIndex++;
            }
        });
    });

    // Convert back to TSV
    return [
        headers.join('\t'),
        ...rows.map(row => headers.map(h => row[h] ?? '').join('\t'))
    ].join('\n');

}
