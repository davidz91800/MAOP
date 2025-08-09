// FILE: js-06-modals-actions-new.js
// Gère la modale d'actions sur une tâche (modifier, dupliquer, annuler, supprimer).

/** Ouvre la petite modale d'actions. */
function openTaskActionModal(taskId) {
    activeTaskId = taskId;
    const task = tasksData.find(t => t.id === activeTaskId);
    if (!task) return;

    const taskName = task.details.missionName || task.details.areaName || task.details.taskName || `Tâche ID ${task.id}`;
    document.getElementById('action-modal-title').textContent = `Actions pour "${taskName}"`;

    const actionModalFooter = document.getElementById('action-modal-footer');
    actionModalFooter.innerHTML = '';
    actionModalFooter.innerHTML += `<button id="edit-task-btn">Modifier</button>`;
    actionModalFooter.innerHTML += `<button id="duplicate-task-btn">Dupliquer</button>`;
    const cancelButtonText = task.details.isCancelled ? 'Réactiver' : 'Annuler';
    actionModalFooter.innerHTML += `<button id="cancel-toggle-btn">${cancelButtonText}</button>`;
    actionModalFooter.innerHTML += `<button id="delete-task-btn">Supprimer</button>`;

    document.getElementById('edit-task-btn').addEventListener('click', handleEditTask);
    document.getElementById('duplicate-task-btn').addEventListener('click', handleDuplicateTask);
    document.getElementById('cancel-toggle-btn').addEventListener('click', handleCancelTask);
    document.getElementById('delete-task-btn').addEventListener('click', handleDeleteTask);

    document.getElementById('task-action-modal').classList.remove('hidden');
}

/** Ferme la modale d'actions. */
function closeActionModal() {
    activeTaskId = null;
    document.getElementById('task-action-modal').classList.add('hidden');
}

/** Gère le clic sur Modifier : pré-remplit et ouvre la modale principale. */
function handleEditTask() {
    const taskToEdit = tasksData.find(t => t.id === activeTaskId);
    if (!taskToEdit) return;

    openModal();
    document.querySelector('#task-modal .modal-header h2').textContent = 'Modifier la tâche';

    const taskTypeSelect = document.getElementById('task-type');
    taskTypeSelect.value = taskToEdit.type;
    generateFormFields(taskToEdit.type);

    document.getElementById('startDateTime').value = toLocalISOString(new Date(taskToEdit.startDateTime)).slice(0, 16);
    document.getElementById('endDateTime').value = toLocalISOString(new Date(taskToEdit.endDateTime)).slice(0, 16);
    for (const key in taskToEdit.details) {
        if (key !== 'crewIds') {
            const field = document.getElementById(key);
            if (field) field.value = taskToEdit.details[key];
        }
    }

    if (taskToEdit.type === 'FLIGHT' && taskToEdit.details.crewIds) {
        document.getElementById('crew-list').innerHTML = '';
        taskToEdit.details.crewIds.forEach(crewId => {
            const crewMember = adminConfig.crewMembers.find(m => m.id === crewId);
            if(crewMember) {
                const row = addCrewRow();
                row.querySelector('.crew-member-select').value = crewId;
            }
        });
    }
    closeActionModal();
}

/** Gère le clic sur Dupliquer : pré-remplit et ouvre la modale principale. */
function handleDuplicateTask() {
    const taskToDuplicate = { ...tasksData.find(t => t.id === activeTaskId) };
    if (!taskToDuplicate) return;

    activeTaskId = null;
    openModal();
    document.querySelector('#task-modal .modal-header h2').textContent = 'Dupliquer la tâche';

    const taskTypeSelect = document.getElementById('task-type');
    taskTypeSelect.value = taskToDuplicate.type;
    generateFormFields(taskToDuplicate.type);

    document.getElementById('startDateTime').value = toLocalISOString(new Date(taskToDuplicate.startDateTime)).slice(0, 16);
    document.getElementById('endDateTime').value = toLocalISOString(new Date(taskToDuplicate.endDateTime)).slice(0, 16);
    for (const key in taskToDuplicate.details) {
        if (key !== 'crewIds') {
            const field = document.getElementById(key);
            if (field) field.value = taskToDuplicate.details[key];
        }
    }
    if (taskToDuplicate.type === 'FLIGHT' && taskToDuplicate.details.crewIds) {
        document.getElementById('crew-list').innerHTML = '';
        taskToDuplicate.details.crewIds.forEach(crewId => {
             const crewMember = adminConfig.crewMembers.find(m => m.id === crewId);
            if(crewMember) {
                const row = addCrewRow();
                row.querySelector('.crew-member-select').value = crewId;
            }
        });
    }
    closeActionModal();
}

/** Gère le clic sur le bouton Annuler/Réactiver une tâche. */
function handleCancelTask() {
    const task = tasksData.find(t => t.id === activeTaskId);
    if (task) {
        task.details.isCancelled = !task.details.isCancelled;
    }
    closeActionModal();
    renderPlanning();
    saveStateToLocalStorage();
}

/** Gère le clic sur le bouton Supprimer une tâche. */
function handleDeleteTask() {
    const taskIndex = tasksData.findIndex(t => t.id === activeTaskId);
    if (taskIndex === -1) return;

    const task = tasksData[taskIndex];
    const taskName = task.details.missionName || task.type;

    showConfirmation(`Êtes-vous sûr de vouloir supprimer la tâche "${taskName}" ?`, () => {
        tasksData.splice(taskIndex, 1);
        closeActionModal();
        renderPlanning();
        saveStateToLocalStorage();
    });
}
