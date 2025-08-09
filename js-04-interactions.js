// FILE: js-04-interactions.js
// Gère les interactions utilisateur sur les blocs de tâches : drag & drop, redimensionnement, clics et infobulles.

/** Ajoute toutes les interactions à un bloc de tâche. */
function addBlockInteractions(blockDiv, taskId, timelineDiv, extraClasses) {
    blockDiv.draggable = true;
    blockDiv.addEventListener('dragstart', (e) => handleDragStart(e));
    blockDiv.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
    
    blockDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('resize-handle')) {
            openTaskActionModal(taskId);
        }
    });

    addTooltipFunctionality(blockDiv, taskId);

    if (extraClasses.includes('main-task-block')) {
        addResizeFunctionality(blockDiv, taskId, timelineDiv);
    }
}

/** Gère le début du glisser-déposer d'une tâche. */
function handleDragStart(event) {
    if (event.target.classList.contains('resize-handle')) {
        event.preventDefault();
        return;
    }
    const taskElement = event.target.closest('.task');
    event.dataTransfer.setData('text/plain', taskElement.dataset.taskId);
    taskElement.classList.add('dragging');
}

/** Gère le dépôt d'une tâche sur une timeline pour la déplacer. */
function addTimelineDropHandling(timelineGrid) {
    timelineGrid.addEventListener('dragover', e => e.preventDefault());
    timelineGrid.addEventListener('dragenter', e => e.currentTarget.classList.add('drop-target'));
    timelineGrid.addEventListener('dragleave', e => e.currentTarget.classList.remove('drop-target'));

    timelineGrid.addEventListener('drop', (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('drop-target');

        const taskId = event.dataTransfer.getData('text/plain');
        const task = tasksData.find(t => t.id == taskId);
        if (!task) return;

        const timelineRect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - timelineRect.left;
        const totalTimelineWidth = timelineRect.width;
        const totalMinutesInView = (24 - 4) * 60;
        const minutesFromStart = (mouseX / totalTimelineWidth) * totalMinutesInView;
        const snappedMinutes = Math.round(minutesFromStart / 5) * 5;
        
        const duration = new Date(task.endDateTime).getTime() - new Date(task.startDateTime).getTime();
        const day = new Date(currentDate);
        day.setHours(4, 0, 0, 0);

        const newStartDate = new Date(day.getTime() + snappedMinutes * 60 * 1000);
        const newEndDate = new Date(newStartDate.getTime() + duration);

        task.startDateTime = toLocalISOString(newStartDate);
        task.endDateTime = toLocalISOString(newEndDate);
        renderPlanning();
        saveStateToLocalStorage();
    });
}

/** Ajoute la poignée et la logique de redimensionnement à un bloc. */
function addResizeFunctionality(blockDiv, taskId, timelineDiv) {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    blockDiv.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const taskToResize = tasksData.find(t => t.id === taskId);
        if (!taskToResize || taskToResize.details.isCancelled) return;

        document.body.classList.add('is-resizing');
        blockDiv.classList.add('resizing');
        
        const timelineRect = timelineDiv.getBoundingClientRect();
        const colWidth = timelineRect.width / 240;
        const startCol = parseInt(blockDiv.style.getPropertyValue('--start-col'), 10);
        
        const onMouseMove = (moveEvent) => {
            const newWidthPx = moveEvent.clientX - timelineRect.left - ((startCol - 1) * colWidth);
            let newSpan = Math.round(newWidthPx / colWidth);
            if (newSpan < 1) newSpan = 1;
            const newEndCol = startCol + newSpan;
            if (newEndCol <= 241) blockDiv.style.setProperty('--end-col', newEndCol);
        };

        const onMouseUp = () => {
            document.body.classList.remove('is-resizing');
            blockDiv.classList.remove('resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            const finalEndCol = parseInt(blockDiv.style.getPropertyValue('--end-col'), 10);
            const newEndDate = columnToDate(finalEndCol, currentDate);
            
            taskToResize.endDateTime = toLocalISOString(newEndDate);
            renderPlanning();
            saveStateToLocalStorage();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

/** Ajoute la logique d'affichage de l'infobulle au survol. */
function addTooltipFunctionality(blockDiv, taskId) {
    const tooltip = document.getElementById('task-tooltip');
    blockDiv.addEventListener('mouseenter', (event) => {
        if (!blockDiv.classList.contains('dragging') && !document.body.classList.contains('is-resizing')) {
            const taskToShow = tasksData.find(t => t.id == taskId);
            if (taskToShow) {
                tooltip.innerHTML = generateTooltipContent(taskToShow);
                tooltip.classList.remove('hidden');
                tooltip.style.left = `${event.pageX + 15}px`;
                tooltip.style.top = `${event.pageY + 15}px`;
            }
        }
    });
    blockDiv.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
}

/** Génère le contenu HTML pour l'infobulle d'une tâche. */
function generateTooltipContent(task) {
    if (!task) return '';
    let content = `<h4>${task.details.missionName || task.type}</h4>`;
    const startTime = new Date(task.startDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(task.endDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    content += `<p><strong>Horaires :</strong> ${startTime} - ${endTime}</p>`;
    
    switch(task.type) {
        case 'FLIGHT':
            content += `<p><strong>Avion :</strong> ${task.details.aircraftType || ''} (${task.details.aircraftNumber || 'N/A'})</p>`;
            if (task.details.callSign) content += `<p><strong>Call Sign :</strong> ${task.details.callSign}</p>`;
            if (task.details.missionNb) content += `<p><strong>Mission N° :</strong> ${task.details.missionNb}</p>`;
            content += `<p><strong>Config :</strong> ${task.details.configuration || 'Aucune'}</p>`;
            if (task.details.task1 && task.details.zone1) content += `<p><strong>Mission 1 :</strong> ${task.details.task1} (${task.details.zone1})</p>`;
            if (task.details.notes) content += `<p><strong>Notes :</strong> ${task.details.notes}</p>`;
            const crew = getCrewDetails(task.details.crewIds);
            if (crew.length > 0) {
                content += `<p><strong>Équipage :</strong></p><ul class="crew-list">`;
                crew.forEach(m => { content += `<li>${m.grade} ${m.lastName} (${m.func})</li>`; });
                content += `</ul>`;
            }
            break;
        case 'PREPARATION':
            content += `<p><strong>Salle :</strong> ${task.details.room || 'Non spécifiée'}</p>`;
            if (task.details.notes) content += `<p><strong>Notes :</strong> ${task.details.notes}</p>`;
            break;
        default:
             content += `<p><strong>Détails :</strong> ${task.details.notes || 'Aucune note'}</p>`;
             break;
    }
    return content;
}