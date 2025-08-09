// FILE: js-02-utils.js
// Contient les fonctions utilitaires (helpers) pour la manipulation des dates, heures et données.

/** Convertit une heure (ex: "08:30") en colonne de la grille (de 1 à 240). */
function timeToColumn(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutesSinceStart = (hours - 4) * 60 + minutes;
    return Math.max(1, Math.floor(totalMinutesSinceStart / 5) + 1);
}

/** Convertit un numéro de colonne en objet Date pour le jour courant. */
function columnToDate(column, baseDate) {
    const minutesFromStart = (column - 1) * 5;
    const newDate = new Date(baseDate);
    newDate.setHours(4, 0, 0, 0); 
    newDate.setMinutes(newDate.getMinutes() + minutesFromStart);
    return newDate;
}

/** Formate une date en string YYYY-MM-DDTHH:mm:ss sans conversion de fuseau horaire. */
function toLocalISOString(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/** Formate une date en string YYYY-MM-DD. */
function toISODateString(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

/** Récupère les objets complets des membres d'équipage à partir de leurs IDs. */
function getCrewDetails(crewIds = []) {
    return crewIds.map(id => adminConfig.crewMembers.find(m => m.id === id)).filter(Boolean);
}