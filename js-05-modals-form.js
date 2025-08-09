// FILE: js-05-modals-form.js
// Gère la modale principale de création et d'édition des tâches.

/** Ouvre la modale principale pour créer ou éditer une tâche. */
function openModal() {
    const taskForm = document.getElementById('task-form');
    taskForm.reset();
    document.getElementById('dynamic-form-fields').innerHTML = '';
    populateTaskTypeDropdown();
    generateFormFields('');
    document.querySelector('#task-modal .modal-header h2').textContent = 'Créer une nouvelle tâche';
    document.getElementById('task-modal').classList.remove('hidden');
}

/** Ferme la modale principale. */
function closeModal() {
    document.getElementById('task-modal').classList.add('hidden');
    activeTaskId = null;
}

/** Gère la soumission du formulaire de tâche (création ou mise à jour). */
function handleFormSubmit(event) {
    event.preventDefault();
    const taskForm = document.getElementById('task-form');
    const formData = new FormData(taskForm);
    
    const taskData = {
        type: formData.get('type'),
        startDateTime: formData.get('startDateTime'),
        endDateTime: formData.get('endDateTime'),
        details: {}
    };

    for (const [key, value] of formData.entries()) {
        if (!['type', 'startDateTime', 'endDateTime', 'crewIds[]'].includes(key)) {
            taskData.details[key] = value;
        }
    }
    
    if (taskData.type === 'FLIGHT') {
        taskData.details.crewIds = formData.getAll('crewIds[]').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    if (activeTaskId) { // Mode édition
        const taskIndex = tasksData.findIndex(t => t.id === activeTaskId);
        if (taskIndex > -1) {
            taskData.id = activeTaskId;
            taskData.details.isCancelled = tasksData[taskIndex].details.isCancelled;
            tasksData[taskIndex] = taskData;
        }
    } else { // Mode création
        taskData.id = Date.now();
        tasksData.push(taskData);
    }
    
    renderPlanning();
    closeModal();
}

/** Remplit le menu déroulant des types de tâches. */
function populateTaskTypeDropdown() {
    const taskTypes = ['FLIGHT', 'AREA', 'C2 / ISR', 'AAR', 'AIR / AIR', 'GROUND / AIR', 'GROUND ORDER', 'PREPARATION'];
    const taskTypeSelect = document.getElementById('task-type');
    taskTypeSelect.innerHTML = '<option value="" disabled selected>-- Choisir un type --</option>';
    taskTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        taskTypeSelect.appendChild(option);
    });
}

/** Génère les champs de formulaire dynamiques en fonction du type de tâche. */
function generateFormFields(taskType) {
    const dynamicFieldsContainer = document.getElementById('dynamic-form-fields');
    dynamicFieldsContainer.innerHTML = '';
    let html = '';
    const createField = (label, type, name, options = {}) => {
        let fieldHtml = `<div class="form-group"><label for="${name}">${label}</label>`;
        const requiredAttr = options.required ? 'required' : '';
        if (type === 'select') {
            fieldHtml += `<select id="${name}" name="${name}" ${requiredAttr}>`;
            const emptyOptionText = ['configuration', 'task2', 'zone2', 'task3', 'zone3'].includes(name) ? 'Aucune' : '-- Choisir --';
            fieldHtml += `<option value="">${emptyOptionText}</option>`;
            options.choices.forEach(c => fieldHtml += `<option value="${c}">${c}</option>`);
            fieldHtml += `</select>`;
        } else if (type === 'textarea') {
            fieldHtml += `<textarea id="${name}" name="${name}"></textarea>`;
        } else {
            fieldHtml += `<input type="${type}" id="${name}" name="${name}" ${requiredAttr}>`;
        }
        return fieldHtml + `</div>`;
    };

    html += createField('Date et heure de début', 'datetime-local', 'startDateTime', { required: true });
    html += createField('Date et heure de fin', 'datetime-local', 'endDateTime', { required: true });

    switch (taskType) {
        case 'FLIGHT':
            html += createField('Nom de la mission', 'text', 'missionName', { required: true });
            html += createField('Rôle', 'select', 'role', { choices: ['Leader', 'Wingman', 'Solo'] });
            html += createField('Type Avion', 'select', 'aircraftType', { choices: adminConfig.aircraftTypes, required: true });
            html += createField('Numéro d\'avion', 'text', 'aircraftNumber');
            html += createField('Call Sign', 'text', 'callSign');
            html += createField('Mission NB', 'text', 'missionNb');
            html += createField('Configuration', 'select', 'configuration', { choices: adminConfig.configurations });
            
            html += '<div class="task-zone-pair">';
            html += createField('Tâche 1', 'select', 'task1', { choices: adminConfig.tasks });
            html += createField('Zone 1', 'select', 'zone1', { choices: adminConfig.workAreas });
            html += '</div>';
            
            html += '<div class="task-zone-pair">';
            html += createField('Tâche 2', 'select', 'task2', { choices: adminConfig.tasks });
            html += createField('Zone 2', 'select', 'zone2', { choices: adminConfig.workAreas });
            html += '</div>';

            html += '<div class="task-zone-pair">';
            html += createField('Tâche 3', 'select', 'task3', { choices: adminConfig.tasks });
            html += createField('Zone 3', 'select', 'zone3', { choices: adminConfig.workAreas });
            html += '</div>';

            html += createField('Notes', 'textarea', 'notes');
            html += `<div class="crew-section"><div class="crew-header"><h4>Équipage</h4><button type="button" id="add-crew-btn">+</button></div><div id="crew-list"></div></div>`;
            break;
        case 'PREPARATION':
            html += createField('Nom de la mission', 'text', 'missionName', { required: true });
            html += createField('Salle', 'text', 'room');
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'AREA':
            html += createField('Nom de la zone', 'select', 'areaName', { choices: adminConfig.workAreas, required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'C2 / ISR':
            html += createField('Entité / Sujet', 'text', 'entityName', { required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'AAR':
            html += createField('Indicatif Tanker', 'text', 'aarName', { required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'AIR / AIR':
            html += createField('Escadron opposant', 'text', 'squadronName', { required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'GROUND / AIR':
            html += createField('Équipement au sol', 'select', 'equipmentName', { choices: adminConfig.groundEquipments, required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
        case 'GROUND ORDER':
            html += createField('Ordre au sol', 'text', 'taskName', { required: true });
            html += createField('Notes', 'textarea', 'notes');
            break;
    }
    dynamicFieldsContainer.innerHTML = html;
    
    const now = new Date();
    const defaultStart = toLocalISOString(now).slice(0, 16);
    const defaultEnd = toLocalISOString(new Date(now.getTime() + 2 * 60 * 60 * 1000)).slice(0, 16);
    document.getElementById('startDateTime').value = defaultStart;
    document.getElementById('endDateTime').value = defaultEnd;
    
    if (taskType === 'FLIGHT') {
        document.getElementById('add-crew-btn').addEventListener('click', addCrewRow);
        addCrewRow();
    }
}

/** Ajoute une ligne pour sélectionner un membre d'équipage dans le formulaire de vol. */
function addCrewRow() {
    const crewList = document.getElementById('crew-list');
    const crewRow = document.createElement('div');
    crewRow.className = 'crew-row simple'; 

    const select = document.createElement('select');
    select.className = 'crew-member-select';
    select.name = 'crewIds[]';

    select.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
    adminConfig.crewMembers
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.grade} ${member.lastName} ${member.firstName} (${member.func})`;
            select.appendChild(option);
        });

    crewRow.appendChild(select);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-crew-btn';
    removeBtn.textContent = '-';
    removeBtn.onclick = (e) => e.target.closest('.crew-row').remove();
    crewRow.appendChild(removeBtn);

    crewList.appendChild(crewRow);
    return crewRow;
}