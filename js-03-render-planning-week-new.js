// FILE: js-03-render-planning-week-new.js
// Contient la logique pour le rendu de la vue hebdomadaire.

function renderWeeklyPlanning() {
    const tracksContainer = document.getElementById('tracks-container');
    const timeHeaderContainer = document.getElementById('time-header-container');

    // Cacher la timeline horaire et afficher le conteneur principal
    timeHeaderContainer.style.display = 'none';
    tracksContainer.innerHTML = ''; // Vider le contenu précédent
    tracksContainer.className = 'week-view-container'; // Appliquer le style de la vue semaine

    // 1. Calculer la semaine actuelle
    const weekDates = getWeekDates(currentDate);

    // 2. Créer la structure de la grille
    const grid = document.createElement('div');
    grid.className = 'week-grid';

    // Créer les en-têtes des jours
    weekDates.forEach(date => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNum = date.getDate();
        dayHeader.innerHTML = `<strong>${dayName.toUpperCase()}</strong><span>${dayNum}</span>`;
        if (isSameDay(date, new Date())) {
            dayHeader.classList.add('today');
        }
        grid.appendChild(dayHeader);
    });

    // Créer les colonnes pour les tâches
    for (let i = 0; i < 7; i++) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'week-day-column';
        dayColumn.dataset.date = weekDates[i].toISOString().split('T')[0];
        grid.appendChild(dayColumn);
    }

    tracksContainer.appendChild(grid);

    // 3. Filtrer et placer les tâches
    const tasksInWeek = tasksData.filter(task => {
        const taskDate = new Date(task.startDateTime);
        const startOfWeek = weekDates[0];
        const endOfWeek = new Date(weekDates[6].getTime() + 86400000 - 1); // Fin de journée du dimanche
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });

    tasksInWeek.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    tasksInWeek.forEach(task => {
        const taskDateStr = task.startDateTime.split('T')[0];
        const column = grid.querySelector(`.week-day-column[data-date="${taskDateStr}"]`);
        if (column) {
            const taskElement = createWeeklyTaskElement(task);
            column.appendChild(taskElement);
        }
    });
}

function createWeeklyTaskElement(task) {
    const element = document.createElement('div');
    element.className = 'week-task';
    element.style.backgroundColor = taskTypesConfig[task.type]?.color || '#85c1e9';
    element.dataset.taskId = task.id;

    const startTime = new Date(task.startDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    element.innerHTML = `
        <span class="week-task-time">${startTime}</span>
        <strong class="week-task-title">${task.details.missionName || task.type}</strong>
    `;

    // Ajouter les interactions (infobulle, clic)
    addTooltipFunctionality(element, task.id);
    element.addEventListener('click', () => openTaskActionModal(task.id));

    return element;
}

// Helper pour obtenir les dates de la semaine
function getWeekDates(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const nextDate = new Date(startOfWeek);
        nextDate.setDate(startOfWeek.getDate() + i);
        dates.push(nextDate);
    }
    return dates;
}
