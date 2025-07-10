//import * as $ from "jquery";
//import {showBiomarkersOverviewChart, showPatientsWithBiomarkersChart} from "./components/Charts/DerivedChart";
// import DerivedChart, {
//     showBiomarkersOverviewChart,
//     showPatientsWithBiomarkersChart
// } from "./components/Charts/DerivedChart";
// Global settings
export const transitionDuration = 800; // time in ms


// Keep the pateints data in memory
export let allPatients = [];

export function setAllPatients(patients) {
    allPatients = patients
}

// Patients array based on the current stage chart selection
export let patientsByStage = [];

// export function setPatientsByStage(patients) {
//     patientsByStage = patients
// }
// // Patients array based on the current first encounter age chart selection
// export let patientsByFirstEncounterAge = [];
//
// export function setPatientsByFirstEncounterAge(patients) {
//     patientsByFirstEncounterAge = patients
// }
export const allStagesLabel = "All stages";

// Array that contains the current min age and max age based on age chart selection
export let currentFirstEncounterAgeRange = [];

//let baseUri = "http://localhost:3001/api";

// All stages in a sorted order
export const orderedCancerStages = [
    'Stage 0',
    // Stage I
    'Stage I',
    'Stage IA',
    'Stage IB',
    'Stage IC',
    // Stage II
    'Stage II',
    'Stage IIA',
    'Stage IIB',
    'Stage IIC',
    // Stage III
    'Stage III',
    'Stage IIIA',
    'Stage IIIB',
    'Stage IIIC',
    // Stage IV
    'Stage IV',
    'Stage IVA',
    'Stage IVB',
    'Stage IVC',
    // Stage Unknown
    'Stage Unknown'
];

// All top-level stages
export const topLevelStages = [
    'Stage 0',
    'Stage I',
    'Stage II',
    'Stage III',
    'Stage IV'
];


// Return the intersection of two patient arrays
export function getTargetPatients(patientsByStage, patientsByFirstEncounterAge) {
    // Create a list of IDs
    let patientsByStageIds = patientsByStage.map(function(obj) {
        return obj.patientId;
    });

    let patientsByFirstEncounterAgeIds = patientsByFirstEncounterAge.map(function(obj) {
        return obj.patientId;
    });

    // Find common patient Ids
    let targetPatientIds = patientsByStageIds.filter(function(id) {
        return patientsByFirstEncounterAgeIds.indexOf(id) > -1;
    });

    // Find the patient objects based on common patient IDs
    // No need to sort/order the targetPatients since it's already sorted in dataProcessor
    let targetPatients = patientsByStage.filter(function(obj) {
        return targetPatientIds.indexOf(obj.patientId) > -1;
    });

    return targetPatients;
}

// Same as the one in dataProcessor
export function sortByProvidedOrder(array, orderArr) {
    let orderMap = new Map();

    orderArr.forEach(function(item) {
        // Remember the index of each item in order array
        orderMap.set(item, orderArr.indexOf(item));
    });

    // Sort the original array by the item's index in the orderArr
    // It's very possible that items are in array may not be in orderArr
    // so we assign index starting from orderArr.length for those items
    let i = orderArr.length;
    let sortedArray = array.sort(function(a, b){
        if (!orderMap.has(a)) {
            orderMap.set(a, i++);
        }

        if (!orderMap.has(b)) {
            orderMap.set(b, i++);
        }

        return (orderMap.get(a) - orderMap.get(b));
    });

    return sortedArray;
}



// function getDiagnosis(patientIds) {
//     $.ajax({
//         url: baseUri + '/diagnosis/' + patientIds.join('+'),
//         method: 'GET',
//         async : true,
//         dataType : 'json'
//     })
//         .done(function(response) {
//             DerivedChart.showDiagnosisChart("diagnosis", response);
//         })
//         .fail(function () {
//             console.log("Ajax error - can't get patients diagnosis info");
//         });
// }

