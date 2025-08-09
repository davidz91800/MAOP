// FILE: js-11-theme.js
// Gère la logique du mode jour/nuit.

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const body = document.body;
    const themeKey = 'themePreference';

    // Appliquer le thème sauvegardé au chargement
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleButton.textContent = '🌙';
    } else {
        body.classList.remove('dark-mode');
        themeToggleButton.textContent = '☀️';
    }

    // Gérer le clic sur le bouton
    themeToggleButton.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            // Passer en mode clair
            body.classList.remove('dark-mode');
            themeToggleButton.textContent = '☀️';
            localStorage.setItem(themeKey, 'light');
        } else {
            // Passer en mode sombre
            body.classList.add('dark-mode');
            themeToggleButton.textContent = '🌙';
            localStorage.setItem(themeKey, 'dark');
        }
    });
});
