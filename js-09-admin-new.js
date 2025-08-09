// FILE: js-09-admin-new.js
// Contient toutes les fonctions relatives au panneau d'administration.

/** Ouvre le panneau d'administration et affiche l'onglet actif. */
function openAdminPanel() {
    document.getElementById('admin-panel-modal').classList.remove('hidden');
    renderActiveAdminTab();
}

/** Ferme le panneau d'administration. */
function closeAdminPanel() {
    document.getElementById('admin-panel-modal').classList.add('hidden');
}

/** Affiche le contenu de l'onglet actuellement sélectionné. */
function renderActiveAdminTab() {
    const activeTab = document.querySelector('.admin-nav-tab.active');
    if (!activeTab) return;

    const tabContentId = activeTab.dataset.tab;
    const tabContent = document.getElementById(tabContentId);
    tabContent.innerHTML = '';

    switch (tabContentId) {
        case 'tab-aircraft': renderAdminList(tabContent, adminConfig.aircraftTypes, 'Type d\'avion'); break;
        case 'tab-tasks': renderAdminList(tabContent, adminConfig.tasks, 'Tâche de vol'); break;
        case 'tab-configs': renderAdminList(tabContent, adminConfig.configurations, 'Configuration'); break;
        case 'tab-areas': renderAdminList(tabContent, adminConfig.workAreas, 'Zone de travail'); break;
        case 'tab-equipments': renderAdminList(tabContent, adminConfig.groundEquipments, 'Équipement'); break;
        case 'tab-crew': renderCrewAdminTab(tabContent); break;
    }
}

/** Affiche une liste simple avec options d'ajout/suppression. */
function renderAdminList(container, dataArray, itemLabel) {
    container.innerHTML = `<h3>Gestion des ${itemLabel}s</h3>`;
    const list = document.createElement('ul');
    list.className = 'admin-list';
    dataArray.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'admin-list-item';
        listItem.innerHTML = `<span>${item}</span>`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'admin-delete-btn';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.onclick = () => {
            showConfirmation(`Voulez-vous vraiment supprimer "${item}" ?`, () => {
                const index = dataArray.indexOf(item);
                if (index > -1) dataArray.splice(index, 1);
                renderAdminList(container, dataArray, itemLabel);
                saveStateToLocalStorage();
            });
        };
        listItem.appendChild(deleteBtn);
        list.appendChild(listItem);
    });
    container.appendChild(list);

    const addForm = document.createElement('div');
    addForm.className = 'admin-add-form';
    addForm.innerHTML = `<label for="add-${itemLabel}">Ajouter :</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `add-${itemLabel}`;
    const addBtn = document.createElement('button');
    addBtn.className = 'admin-add-btn';
    addBtn.textContent = 'Ajouter';
    addBtn.onclick = () => {
        const value = input.value.trim();
        if (value && !dataArray.includes(value)) {
            dataArray.push(value);
            dataArray.sort();
            renderAdminList(container, dataArray, itemLabel);
            saveStateToLocalStorage();
        } else if (dataArray.includes(value)) {
            alert(`"${value}" existe déjà.`);
        }
    };
    addForm.appendChild(input);
    addForm.appendChild(addBtn);
    container.appendChild(addForm);
}

/** Affiche l'onglet de gestion des équipages. */
function renderCrewAdminTab(container) {
    container.innerHTML = `<h3>Gestion des équipages</h3>`;
    const importSection = document.createElement('div');
    importSection.className = 'admin-import-section';
    importSection.innerHTML = `
        <label for="crew-import-textarea">Collez les données depuis Excel (Grade, Nom, Prénom, Fonction)</label>
        <textarea id="crew-import-textarea" rows="8" placeholder="Ex: CNE\tDUPONT\tJean\tPIC..."></textarea>
        <button id="import-crew-btn" class="admin-add-btn">Importer et Ajouter</button>`;
    container.appendChild(importSection);

    const listSection = document.createElement('div');
    listSection.className = 'admin-crew-list-section';
    listSection.innerHTML = `<h4>Équipage enregistré</h4>`;

    const list = document.createElement('ul');
    list.className = 'admin-list';
    adminConfig.crewMembers.sort((a, b) => a.lastName.localeCompare(b.lastName))
        .forEach(member => list.appendChild(createCrewAdminRow(member, container)));

    listSection.appendChild(list);
    container.appendChild(listSection);

    document.getElementById('import-crew-btn').addEventListener('click', () => {
        const text = document.getElementById('crew-import-textarea').value;
        importCrewFromText(text);
        renderCrewAdminTab(container);
    });
}

/** Crée une ligne pour un membre d'équipage dans l'admin. */
function createCrewAdminRow(member, mainContainer) {
    const listItem = document.createElement('li');
    listItem.className = 'admin-list-item';
    const memberDisplay = document.createElement('span');
    memberDisplay.innerHTML = `<b>${member.grade} ${member.lastName}</b> ${member.firstName} <i>(${member.func})</i>`;
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'admin-list-item-buttons';

    const editBtn = document.createElement('button');
    editBtn.className = 'admin-add-btn';
    editBtn.textContent = 'Modifier';
    editBtn.onclick = () => switchToEditMode(listItem, member, mainContainer);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'admin-delete-btn';
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.onclick = () => {
        showConfirmation(`Voulez-vous vraiment supprimer ${member.grade} ${member.lastName} ?`, () => {
            const index = adminConfig.crewMembers.findIndex(m => m.id === member.id);
            if (index > -1) adminConfig.crewMembers.splice(index, 1);
            renderCrewAdminTab(mainContainer);
            saveStateToLocalStorage();
        });
    };
    buttonsContainer.appendChild(editBtn);
    buttonsContainer.appendChild(deleteBtn);
    listItem.appendChild(memberDisplay);
    listItem.appendChild(buttonsContainer);
    return listItem;
}

/** Bascule une ligne de membre d'équipage en mode édition. */
function switchToEditMode(listItem, member, mainContainer) {
    const memberDisplay = listItem.querySelector('span');
    const buttonsContainer = listItem.querySelector('.admin-list-item-buttons');
    memberDisplay.innerHTML = '';

    const createSelect = (options, selectedValue, className) => {
        const select = document.createElement('select');
        select.className = `admin-edit-input ${className}`;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (opt === selectedValue) option.selected = true;
            select.appendChild(option);
        });
        return select;
    };
    const createInput = (value, className, placeholder) => {
         const input = document.createElement('input');
         input.type = 'text';
         input.className = `admin-edit-input ${className}`;
         input.value = value;
         input.placeholder = placeholder;
         return input;
    };

    const gradeSelect = createSelect(adminConfig.grades, member.grade, 'grade');
    const lastNameInput = createInput(member.lastName, 'name', 'Nom');
    const firstNameInput = createInput(member.firstName, 'name', 'Prénom');
    const funcSelect = createSelect(adminConfig.functions, member.func, 'function');
    memberDisplay.append(gradeSelect, lastNameInput, firstNameInput, funcSelect);

    buttonsContainer.innerHTML = '';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'admin-save-btn';
    saveBtn.textContent = 'Sauvegarder';
    saveBtn.onclick = () => {
        const memberToUpdate = adminConfig.crewMembers.find(m => m.id === member.id);
        if (memberToUpdate) {
            memberToUpdate.grade = gradeSelect.value;
            memberToUpdate.lastName = lastNameInput.value.trim().toUpperCase();
            memberToUpdate.firstName = firstNameInput.value.trim();
            memberToUpdate.func = funcSelect.value;
        }
        renderCrewAdminTab(mainContainer);
        saveStateToLocalStorage();
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'admin-cancel-btn';
    cancelBtn.textContent = 'Annuler';
    cancelBtn.onclick = () => renderCrewAdminTab(mainContainer);
    buttonsContainer.append(saveBtn, cancelBtn);
}

/** Parse le texte et importe les équipages. */
function importCrewFromText(text) {
    const lines = text.trim().split('\n');
    let addedCount = 0;
    lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 4) {
            const [grade, lastName, firstName, func] = parts.map(p => p.trim());
            const exists = adminConfig.crewMembers.some(m => m.grade === grade && m.lastName.toUpperCase() === lastName.toUpperCase() && m.firstName === firstName && m.func === func);
            if (!exists && lastName) {
                const newId = adminConfig.crewMembers.length > 0 ? Math.max(...adminConfig.crewMembers.map(m => m.id)) + 1 : 1;
                adminConfig.crewMembers.push({ id: newId, grade, lastName: lastName.toUpperCase(), firstName, func });
                addedCount++;
            }
        }
    });
    if (addedCount > 0) {
        alert(`${addedCount} membre(s) d'équipage ajouté(s) avec succès !`);
        document.getElementById('crew-import-textarea').value = '';
        saveStateToLocalStorage();
    } else {
        alert("Aucun nouveau membre d'équipage à importer.");
    }
}
