// FILE: js-08-io.js
// Gère la sauvegarde et le chargement de l'état de l'application au format JSON.

/**
 * Sauvegarde l'état actuel de l'application dans un fichier JSON.
 */
function handleSaveJSON() {
    const stateToSave = {
        savedAt: new Date().toISOString(),
        tasksData: tasksData,
        adminConfig: adminConfig,
        currentDate: currentDate.toISOString(),
        sunTimes: {
            sunrise: document.getElementById('sunrise-input').value,
            sunset: document.getElementById('sunset-input').value,
        }
    };

    const jsonString = JSON.stringify(stateToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `planning_exercice_${toISODateString(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Gère le chargement d'un fichier JSON pour restaurer l'état de l'application.
 * @param {Event} event L'événement 'change' de l'input de type fichier.
 */
function handleLoadJSON(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const loadedState = JSON.parse(e.target.result);

            // Validation simple pour s'assurer que le fichier est correct
            if (!loadedState.tasksData || !loadedState.adminConfig || !loadedState.currentDate) {
                throw new Error("Format de fichier invalide ou données manquantes.");
            }

            // Restauration de l'état de l'application
            tasksData = loadedState.tasksData;
            adminConfig = loadedState.adminConfig;
            currentDate = new Date(loadedState.currentDate);
            
            if (loadedState.sunTimes) {
                document.getElementById('sunrise-input').value = loadedState.sunTimes.sunrise;
                document.getElementById('sunset-input').value = loadedState.sunTimes.sunset;
            }

            // Rafraîchissement complet de l'interface
            renderAll();
            alert("Exercice chargé avec succès !");

        } catch (error) {
            console.error("Erreur lors du chargement du fichier JSON:", error);
            alert("Erreur : Impossible de charger le fichier. Assurez-vous qu'il s'agit d'un fichier de sauvegarde valide.");
        }
    };

    reader.onerror = () => {
        alert("Erreur lors de la lecture du fichier.");
    };

    reader.readAsText(file);
    
    // Réinitialise l'input pour permettre de recharger le même fichier
    event.target.value = '';
}

// ============================================================================
// === LOCALSTORAGE PERSISTENCE
// ============================================================================

const LOCAL_STORAGE_KEY = 'maopPlanningState';

/**
 * Sauvegarde l'état actuel de l'application dans le localStorage.
 */
function saveStateToLocalStorage() {
    try {
        const stateToSave = {
            tasksData: tasksData,
            adminConfig: adminConfig,
            sunTimes: {
                sunrise: document.getElementById('sunrise-input').value,
                sunset: document.getElementById('sunset-input').value,
            }
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("État sauvegardé dans le localStorage.");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde dans le localStorage:", error);
    }
}

/**
 * Charge l'état de l'application depuis le localStorage, si disponible.
 */
function loadStateFromLocalStorage() {
    try {
        const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateJSON) {
            const loadedState = JSON.parse(savedStateJSON);

            if (loadedState.tasksData && loadedState.adminConfig) {
                tasksData = loadedState.tasksData;
                adminConfig = loadedState.adminConfig;

                if (loadedState.sunTimes) {
                    document.getElementById('sunrise-input').value = loadedState.sunTimes.sunrise;
                    document.getElementById('sunset-input').value = loadedState.sunTimes.sunset;
                }

                console.log("État chargé depuis le localStorage.");
                return true; // Indique que l'état a été chargé
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement depuis le localStorage:", error);
        // On peut supprimer l'entrée si elle est corrompue
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    console.log("Aucun état valide trouvé dans le localStorage, utilisation des données par défaut.");
    return false; // Indique qu'aucun état n'a été chargé
}