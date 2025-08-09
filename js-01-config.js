// FILE: js-01-config.js
// Contient les objets de configuration, les données initiales et les variables d'état globales.

let adminConfig = {
    aircraftTypes: ['A400M', 'C130J', 'CN235', 'ALSR', 'Rafale', 'M2000', 'Typhoon', 'M2000D', 'AJET', 'PC21', 'F16', 'F35', 'EF2000', 'JAS39'],
    configurations: ['PARA', 'MAT', 'AAR', 'SAMAR', 'MEDEVAC'],
    tasks: ['TAL', 'AIRDROP', 'POS', 'RPOS', 'CAS', 'DCA', 'RECO', 'STRIKE'],
    groundEquipments: ['MISTIC (SA-7)', 'RAMAGEE (MISTRAL)', 'SCRIBE (COM)', 'NEPTUNE (GNSS)'],
    workAreas: ['Zone Alpha', 'Zone Bravo', 'Polygone Sud', 'RTBA'],
    icons: ['person', 'star', 'flag', 'warning'],
    grades: ['SLT', 'LTT', 'CNE', 'CDT', 'LCL', 'COL', 'SGT', 'SGC', 'ADJ', 'ADC', 'MAJ'],
    functions: ['PIC', 'PICUS', 'CP', 'TSO', 'LM', 'TLM', 'ARO', 'JM', 'AJM', 'AMPT', 'ACM', 'AECM', 'ICM'],
    crewMembers: [
        { id: 1, grade: 'CNE', lastName: 'DUBOIS', firstName: 'Marc', func: 'PIC' },
        { id: 2, grade: 'LTT', lastName: 'MARTIN', firstName: 'Sophie', func: 'CP' },
        { id: 3, grade: 'SGC', lastName: 'PETIT', firstName: 'Lucas', func: 'LM' }
    ]
};

const taskTypesConfig = {
    'FLIGHT': { color: '#aed6f1', briefingColor: '#d6dbdf' },
    'PREPARATION': { color: '#a9dfbf', trColor: '#fdebd0' },
    'AREA': { color: '#f5b7b1' },
    'C2 / ISR': { color: '#fad7a0' },
    'AAR': { color: '#d2b4de' },
    'AIR / AIR': { color: '#f1948a' },
    'GROUND / AIR': { color: '#85c1e9' },
    'GROUND ORDER': { color: '#e5e7e9' },
};

let tasksData = [
    { 
        id: 1, type: 'FLIGHT', startDateTime: '2025-07-22T08:00:00', endDateTime: '2025-07-22T10:30:00',
        details: { 
            missionName: 'EAGLE ONE', role: 'Leader', aircraftType: 'Rafale', aircraftNumber: '118-IX', 
            callSign: 'VIPER 11', missionNb: 'A-01', 
            configuration: 'CONF A',
            notes: 'Vol de test',
            task1: 'CAS', zone1: 'Zone Alpha', task2: '', zone2: '', task3: '', zone3: '',
            icon: 'star',
            crewIds: [1, 2] 
        }
    },
    { id: 2, type: 'PREPARATION', startDateTime: '2025-07-22T14:00:00', endDateTime: '2025-07-22T22:00:00', details: { missionName: 'EAGLE ONE', room: 'Salle de briefing 1' }},
    { id: 3, type: 'FLIGHT', startDateTime: '2025-07-22T09:00:00', endDateTime: '2025-07-22T11:00:00', details: { missionName: 'HAWK EYE', role: 'Wingman', aircraftType: 'M2000', callSign: 'HAWK 21', missionNb: 'B-04', notes: 'Deuxième vague', crewIds: [] }}
];

// Variables d'état
let currentDate = new Date();
let calendarViewDate = new Date();
let activeTaskId = null;
let isWeekView = false;