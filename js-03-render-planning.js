// FILE: js-03-render-planning.js
// Contient les fonctions responsables du rendu de l'interface principale du planning.

/** Fonction principale qui redessine tout le planning. */
function renderAll() {
    if (isWeekView) {
        renderWeek();
    } else {
        renderHeader();
        renderPlanning();
        updateNightOverlay();
    }
}

/** Met à jour l'affichage de la date et de la grille horaire. */
function renderHeader() {
    const dateDisplay = document.getElementById('date-display');
    const hourGridWrapper = document.getElementById('hour-grid-wrapper');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('fr-FR', options);
    dateDisplay.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    hourGridWrapper.innerHTML = '';
    const hourGrid = document.createElement('div');
    hourGrid.className = 'hour-grid';
    for (let i = 4; i < 24; i++) {
        const hourLabel = document.createElement('div');
        hourLabel.className = 'hour-label';
        hourLabel.textContent = `${String(i).padStart(2, '0')}:00`;
        hourGrid.appendChild(hourLabel);
    }
    hourGridWrapper.appendChild(hourGrid);
}

/** Met à jour la surcouche visuelle nuit/jour. */
function updateNightOverlay() {
    const sunriseInput = document.getElementById('sunrise-input').value;
    const sunsetInput = document.getElementById('sunset-input').value;
    const hourGrid = document.querySelector('.hour-grid');
    if (!hourGrid || !sunriseInput || !sunsetInput) {
        if(hourGrid) hourGrid.style.backgroundImage = '';
        return;
    }
    const nightColor = 'rgba(25, 25, 350, 0.2)';
    const totalMinutes = 20 * 60;
    const [sunriseHours, sunriseMinutes] = sunriseInput.split(':').map(Number);
    const sunriseTotalMinutes = Math.max(0, (sunriseHours - 4) * 60 + sunriseMinutes);
    const sunrisePercent = (sunriseTotalMinutes / totalMinutes) * 100;
    const [sunsetHours, sunsetMinutes] = sunsetInput.split(':').map(Number);
    const sunsetTotalMinutes = Math.max(0, (sunsetHours - 4) * 60 + sunsetMinutes);
    const sunsetPercent = (sunsetTotalMinutes / totalMinutes) * 100;
    const nightGradient = `linear-gradient(to right, 
        ${nightColor} 0%, ${nightColor} ${sunrisePercent}%, 
        transparent ${sunrisePercent}%, transparent ${sunsetPercent}%, 
        ${nightColor} ${sunsetPercent}%, ${nightColor} 100%)`;
    hourGrid.style.backgroundImage = nightGradient;
}

/** Affiche et gère le calendrier pour la sélection de date. */
function renderCalendar() {
    const calendarModal = document.getElementById('calendar-modal');
    calendarModal.innerHTML = ''; 
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button class="calendar-nav-btn" id="prev-month-btn"><</button>
        <h3>${calendarViewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button class="calendar-nav-btn" id="next-month-btn">></button>`;
    calendarModal.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(day => {
        grid.innerHTML += `<div class="day-name">${day}</div>`;
    });
    for (let i = 0; i < startDayIndex; i++) {
        grid.innerHTML += `<div class="calendar-day empty-day"></div>`;
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        const thisDate = new Date(year, month, i);
        if (thisDate.toDateString() === today.toDateString()) dayDiv.classList.add('today');
        if (thisDate.toDateString() === currentDate.toDateString()) dayDiv.classList.add('selected-day');
        
        dayDiv.addEventListener('click', () => {
            currentDate = thisDate;
            renderAll();
            calendarModal.classList.add('hidden');
        });
        grid.appendChild(dayDiv);
    }
    calendarModal.appendChild(grid);

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
        renderCalendar();
    });
}

/** Crée et affiche toutes les pistes et les tâches du planning. */
function renderPlanning(targetDate = currentDate, container = document.getElementById('tracks-container')) {
    container.innerHTML = '';

    const tasksForDay = tasksData.filter(task => {
        const taskStart = new Date(task.startDateTime);
        return taskStart.toDateString() === targetDate.toDateString();
    });

    const trackOrder = ['FLIGHT', 'AREA', 'C2 / ISR', 'AAR', 'AIR / AIR', 'GROUND / AIR', 'GROUND ORDER', 'PREPARATION'];
    trackOrder.forEach(trackName => {
        const tasksInTrack = tasksForDay.filter(t => t.type === trackName);
        renderTrack(container, trackName, tasksInTrack);
    });
}

/** Affiche une semaine complète avec 7 jours côte à côte. */
function renderWeek() {
    const dateDisplay = document.getElementById('date-display');
    const hourGridWrapper = document.getElementById('hour-grid-wrapper');
    const tracksContainer = document.getElementById('tracks-container');

    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Lundi
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const options = { day: 'numeric', month: 'long' };
    dateDisplay.textContent = `Semaine du ${weekStart.toLocaleDateString('fr-FR', options)} au ${weekEnd.toLocaleDateString('fr-FR', options)}`;

    hourGridWrapper.innerHTML = '';
    tracksContainer.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);

        // Création de la grille horaire pour chaque jour
        const dayGrid = document.createElement('div');
        dayGrid.className = 'hour-grid';
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-header';
        const formattedDay = dayDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        dayLabel.textContent = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1);
        dayLabel.style.gridColumn = '1 / -1';
        dayGrid.appendChild(dayLabel);
        for (let h = 4; h < 24; h++) {
            const hourLabel = document.createElement('div');
            hourLabel.className = 'hour-label';
            hourLabel.textContent = `${String(h).padStart(2, '0')}:00`;
            dayGrid.appendChild(hourLabel);
        }
        hourGridWrapper.appendChild(dayGrid);

        // Création des pistes pour chaque jour
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        renderPlanning(dayDate, dayColumn);
        tracksContainer.appendChild(dayColumn);
    }
}

/** Crée et affiche une seule piste et ses tâches, en gérant les superpositions. */
function renderTrack(container, trackName, tasks) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'track-title';
    titleDiv.textContent = trackName;
    trackDiv.appendChild(titleDiv);
    
    const timelinesContainer = document.createElement('div');
    trackDiv.appendChild(timelinesContainer);
    
    if (tasks.length > 0) {
        const subRows = [];
        const tasksToRender = [];
        tasks.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
        
        tasks.forEach(task => {
            let placed = false;
            for (let i = 0; i < subRows.length; i++) {
                if (new Date(task.startDateTime) >= subRows[i]) {
                    tasksToRender.push({ task: task, subRowIndex: i });
                    subRows[i] = new Date(task.endDateTime);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                tasksToRender.push({ task: task, subRowIndex: subRows.length });
                subRows.push(new Date(task.endDateTime));
            }
        });

        const timelineGrid = document.createElement('div');
        timelineGrid.className = 'track-timeline';
        if (subRows.length > 1) {
            timelineGrid.style.gridTemplateRows = `repeat(${subRows.length}, 1fr)`;
        }
        addTimelineDropHandling(timelineGrid);
        timelinesContainer.appendChild(timelineGrid);

        tasksToRender.forEach(({ task, subRowIndex }) => {
            drawTask(task, subRowIndex, timelineGrid);
        });
    }
    container.appendChild(trackDiv);
}

/** Dessine une tâche (ou un ensemble de blocs pour un vol) sur sa timeline. */
function drawTask(task, subRowIndex, timelineGrid) {
    const taskStart = new Date(task.startDateTime);
    const taskEnd = new Date(task.endDateTime);

    switch (task.type) {
        case 'FLIGHT':
            const briefingStart = new Date(taskStart.getTime() - 60 * 60 * 1000);
            const debriefingStart = new Date(taskEnd.getTime() + 30 * 60 * 1000);
            const debriefingEnd = new Date(debriefingStart.getTime() + 30 * 60 * 1000);

            let flightContent = `<div class="task-content-wrapper"><strong>${task.details.missionName || ''}</strong>`;
            flightContent += `<div>${task.details.role || ''} - ${task.details.aircraftType || ''}</div>`;
            if (task.details.aircraftNumber || task.details.configuration) flightContent += `<div>${task.details.aircraftNumber || ''} - ${task.details.configuration || ''}</div>`;
            if (task.details.callSign || task.details.missionNb) flightContent += `<div>${task.details.callSign || ''} / ${task.details.missionNb || ''}</div>`;
            const pic = getCrewDetails(task.details.crewIds).find(m => m.func === 'PIC');
            if (pic) flightContent += `<div>${pic.grade} ${pic.lastName}</div>`;
            flightContent += '</div>';
            if (task.details.icon === 'star') flightContent = `<div class="task-icon">★</div>` + flightContent;
            
            drawBlock(timelineGrid, briefingStart, taskStart, 'Briefing', taskTypesConfig.FLIGHT.briefingColor, subRowIndex, [], task.id);
            drawBlock(timelineGrid, taskStart, taskEnd, flightContent, taskTypesConfig.FLIGHT.color, subRowIndex, ['flight-task', 'main-task-block'], task.id);
            drawBlock(timelineGrid, debriefingStart, debriefingEnd, 'Debriefing', taskTypesConfig.FLIGHT.briefingColor, subRowIndex, [], task.id);
            break;
        
        case 'PREPARATION':
            const trEnd = new Date(taskStart.getTime() + 30 * 60 * 1000);
            const prepContent = `<strong>${task.details.missionName}</strong><span>${task.details.room || ''}</span>`;
            drawBlock(timelineGrid, taskStart, trEnd, '<strong>TR</strong>', taskTypesConfig.PREPARATION.trColor, subRowIndex, [], task.id);
            drawBlock(timelineGrid, trEnd, taskEnd, prepContent, taskTypesConfig.PREPARATION.color, subRowIndex, ['main-task-block'], task.id);
            break;

        default:
            const title = task.details.missionName || task.details.areaName || task.details.entityName || task.details.aarName || task.details.squadronName || task.details.equipmentName || task.details.taskName || 'Tâche';
            drawBlock(timelineGrid, taskStart, taskEnd, `<strong>${title}</strong>`, taskTypesConfig[task.type]?.color || '#cccccc', subRowIndex, ['main-task-block'], task.id);
            break;
    }
}

/** Fonction bas niveau pour dessiner un bloc de tâche individuel sur la grille. */
function drawBlock(timelineDiv, start, end, content, color, subRowIndex, extraClasses = [], taskId) {
    const gridStartDate = new Date(currentDate);
    gridStartDate.setHours(4, 0, 0, 0);
    const gridEndDate = new Date(currentDate);
    gridEndDate.setHours(24, 0, 0, 0);

    const clampedStart = new Date(Math.max(start, gridStartDate));
    const clampedEnd = new Date(Math.min(end, gridEndDate));
    if (clampedEnd <= clampedStart) return;

    const blockDiv = document.createElement('div');
    const taskData = tasksData.find(t => t.id === taskId);
    if (taskData && taskData.details.isCancelled) {
        extraClasses.push('cancelled-task');
    }
    blockDiv.className = ['task', ...extraClasses].join(' ');
    blockDiv.dataset.taskId = taskId;
    blockDiv.innerHTML = content;
    blockDiv.style.gridRow = subRowIndex + 1;
    blockDiv.style.setProperty('--color', color);
    
    const startTimeStr = `${String(clampedStart.getHours()).padStart(2, '0')}:${String(clampedStart.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(clampedEnd.getHours()).padStart(2, '0')}:${String(clampedEnd.getMinutes()).padStart(2, '0')}`;
    blockDiv.style.setProperty('--start-col', timeToColumn(startTimeStr));
    blockDiv.style.setProperty('--end-col', clampedEnd.getTime() === gridEndDate.getTime() ? 241 : timeToColumn(endTimeStr));

    addBlockInteractions(blockDiv, taskId, timelineDiv, extraClasses);
    
    timelineDiv.appendChild(blockDiv);
}