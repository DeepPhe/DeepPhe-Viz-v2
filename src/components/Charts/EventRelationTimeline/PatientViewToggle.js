/**
 * Filters the EventRelationTimeline.js based on selected patients in the PatientDocumentTimeline.js
 * @param {Array} patients - Array of selected patient IDs
 * @param {Array} allEvents - All events in the ER timeline
 * @returns {Array} Filtered events
 */

export function filterTimelineByPatients(patients, allEvents) {
  return allEvents.filter((event) => patients.includes(event.patientId));
}
