// FILE: js-10-main.js
// Point d'entrée de l'application. Initialise l'interface et attache tous les écouteurs d'événements.

/** Initialise l'application une fois le DOM chargé. */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderAll();
});

/** Met en place tous les écouteurs d'événements de la page. */
function setupEventListeners() {
    // === Navigation principale ===
    document.getElementById('add-task-btn').addEventListener('click', openModal);
    document.getElementById('prev-day-btn').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); renderAll(); });
    document.getElementById('next-day-btn').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); renderAll(); });
    document.getElementById('today-btn').addEventListener('click', () => { currentDate = new Date(); renderAll(); });
    document.getElementById('sunrise-input').addEventListener('change', updateNightOverlay);
    document.getElementById('sunset-input').addEventListener('change', updateNightOverlay);

    // === Sauvegarde / Chargement JSON ===
    document.getElementById('save-json-btn').addEventListener('click', handleSaveJSON);
    document.getElementById('load-json-btn').addEventListener('click', () => document.getElementById('import-json-input').click());
    document.getElementById('import-json-input').addEventListener('change', handleLoadJSON);

    // === Calendrier ===
    const calendarBtn = document.getElementById('calendar-btn');
    const calendarModal = document.getElementById('calendar-modal');
    calendarBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = calendarModal.classList.toggle('hidden');
        if (!isHidden) {
            calendarViewDate = new Date(currentDate); 
            renderCalendar();
        }
    });
    document.addEventListener('click', (event) => {
        if (!calendarModal.contains(event.target) && event.target !== calendarBtn) {
            calendarModal.classList.add('hidden');
        }
    });

    // === Modale de création/édition de tâche ===
    const taskModal = document.getElementById('task-modal');
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    taskModal.addEventListener('click', (event) => { if (event.target === taskModal) closeModal(); });
    document.getElementById('task-type').addEventListener('change', (e) => generateFormFields(e.target.value));
    document.getElementById('task-form').addEventListener('submit', handleFormSubmit);
    
    // === Modale d'actions sur une tâche ===
    const actionModal = document.getElementById('task-action-modal');
    document.getElementById('close-action-modal-btn').addEventListener('click', closeActionModal);
    actionModal.addEventListener('click', (event) => { if (event.target === actionModal) closeActionModal(); });

    // === Modale d'export PDF ===
    const pdfExportModal = document.getElementById('pdf-export-modal');
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        const todayStr = toISODateString(currentDate);
        document.getElementById('export-start-date').value = todayStr;
        document.getElementById('export-end-date').value = todayStr;
        pdfExportModal.classList.remove('hidden');
    });
    document.getElementById('close-export-modal-btn').addEventListener('click', () => pdfExportModal.classList.add('hidden'));
    document.getElementById('cancel-export-btn').addEventListener('click', () => pdfExportModal.classList.add('hidden'));
    pdfExportModal.addEventListener('click', (event) => { if (event.target === pdfExportModal) pdfExportModal.classList.add('hidden'); });
    document.getElementById('pdf-export-form').addEventListener('submit', (e) => { e.preventDefault(); generatePDF(); });
    
    // === Panneau d'administration ===
    const adminPanelModal = document.getElementById('admin-panel-modal');
    document.getElementById('admin-panel-btn').addEventListener('click', openAdminPanel);
    document.getElementById('close-admin-panel-btn').addEventListener('click', closeAdminPanel);
    adminPanelModal.addEventListener('click', (event) => { if (event.target === adminPanelModal) closeAdminPanel(); });
    document.querySelectorAll('.admin-nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.admin-nav-tab.active')?.classList.remove('active');
            tab.classList.add('active');
            
            document.querySelector('.admin-tab-content.active')?.classList.remove('active');
            document.getElementById(tab.dataset.tab).classList.add('active');

            renderActiveAdminTab();
        });
    });
}