// FILE: js-12-confirm-modal.js
// Gère la logique de la modale de confirmation personnalisée.

function showConfirmation(message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const textElement = document.getElementById('confirm-modal-text');
    const confirmBtn = document.getElementById('confirm-modal-ok-btn');
    const cancelBtn = document.getElementById('confirm-modal-cancel-btn');
    const closeBtn = document.getElementById('close-confirm-modal-btn');

    textElement.textContent = message;

    // Pour éviter d'attacher plusieurs listeners, on remplace le bouton par un clone
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    const confirmAction = () => {
        onConfirm();
        closeModal();
    };

    newConfirmBtn.addEventListener('click', confirmAction);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.classList.remove('hidden');
}
