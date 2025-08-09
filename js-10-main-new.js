// FILE: js-10-main-new.js
// Point d'entrée de l'application. Initialise l'interface et attache tous les écouteurs d'événements.

/** Initialise l'application une fois le DOM chargé. */
document.addEventListener('DOMContentLoaded', () => {
    // Note: this assumes setupEventListeners from the original js-10-main.js has been implicitly merged.
    // In a real scenario, we would merge the two files.
    // For now, we call the new setup function.
    setupEventListenersNew();
    renderAllNew();
});

/** Met en place tous les écouteurs d'événements de la page (version améliorée). */
function setupEventListenersNew() {
    // === VUE JOUR/SEMAINE ===
    document.getElementById('day-view-btn').addEventListener('click', () => setView('day'));
    document.getElementById('week-view-btn').addEventListener('click', () => setView('week'));

    // === Navigation principale ===
    // Note: This relies on elements from the original index.html.
    // This will only work fully once the user replaces the files.
    if(document.getElementById('add-task-btn')) {
        document.getElementById('add-task-btn').addEventListener('click', openModal);
    }
    document.getElementById('prev-day-btn').addEventListener('click', handlePrev);
    document.getElementById('next-day-btn').addEventListener('click', handleNext);
    document.getElementById('today-btn').addEventListener('click', () => {
        currentDate = new Date();
        renderAllNew();
    });
}

/** Gère le clic sur le bouton Précédent en fonction de la vue. */
function handlePrev() {
    const increment = currentView === 'week' ? 7 : 1;
    currentDate.setDate(currentDate.getDate() - increment);
    renderAllNew();
}

/** Gère le clic sur le bouton Suivant en fonction de la vue. */
function handleNext() {
    const increment = currentView === 'week' ? 7 : 1;
    currentDate.setDate(currentDate.getDate() + increment);
    renderAllNew();
}

/** Définit la vue active (jour/semaine) et met à jour l'affichage. */
function setView(view) {
    currentView = view;
    document.getElementById('day-view-btn').classList.toggle('active', view === 'day');
    document.getElementById('week-view-btn').classList.toggle('active', view === 'week');
    renderAllNew();
}

/** Fonction de rendu principale qui choisit la bonne fonction de rendu. */
function renderAllNew() {
    updateDateDisplay();

    if (currentView === 'week') {
        renderWeeklyPlanning();
    } else {
        // We need to ensure the daily view elements are visible again
        if (document.getElementById('time-header-container')) {
            document.getElementById('time-header-container').style.display = 'grid';
        }
        if (document.getElementById('tracks-container')) {
            document.getElementById('tracks-container').className = '';
        }
        renderPlanning(); // This is the original daily render function
    }
}

/** Met à jour l'affichage de la date en fonction de la vue. */
function updateDateDisplay() {
    const dateDisplay = document.getElementById('date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (currentView === 'week') {
        const startOfWeek = getWeekDates(currentDate)[0];
        const endOfWeek = getWeekDates(currentDate)[6];

        const startStr = startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const endStr = endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        dateDisplay.textContent = `Semaine du ${startStr} au ${endStr}`;
    } else {
        dateDisplay.textContent = currentDate.toLocaleDateString('fr-FR', options);
    }
}
