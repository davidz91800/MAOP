// FILE: js-07-pdf-export.js
// Contient la logique pour la modale d'export PDF et la génération du document.

/** Génère un PDF du planning à partir de la vue HTML. */
async function generatePDF() {
    const startDateInput = document.getElementById('export-start-date').value;
    const endDateInput = document.getElementById('export-end-date').value;
    if (!startDateInput || !endDateInput || new Date(startDateInput) > new Date(endDateInput)) {
        alert("Veuillez sélectionner une plage de dates valide.");
        return;
    }
    
    const generateBtn = document.getElementById('generate-pdf-btn');
    generateBtn.textContent = 'Génération...';
    generateBtn.disabled = true;
    
    document.body.classList.add('printing-mode');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const planningContainer = document.querySelector('.planning-container');
    const originalDate = new Date(currentDate);

    try {
        let isFirstPage = true;
        for (let loopDate = new Date(startDateInput); loopDate <= new Date(endDateInput); loopDate.setDate(loopDate.getDate() + 1)) {
            currentDate = new Date(loopDate);
            renderHeader();
            renderPlanning();
            await new Promise(resolve => setTimeout(resolve, 500)); // Laisse le temps au DOM de se mettre à jour

            if (!isFirstPage) pdf.addPage();
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(currentDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), pdfWidth / 2, 15, { align: 'center' });

            const canvas = await html2canvas(planningContainer, { scale: 3, useCORS: true, windowWidth: 1400 });
            const imgData = canvas.toDataURL('image/png');
            const ratio = canvas.width / canvas.height;
            const availableWidth = pdfWidth - 20;
            const finalImgHeight = availableWidth / ratio;
            pdf.addImage(imgData, 'PNG', 10, 20, availableWidth, finalImgHeight);
            isFirstPage = false;
        }
        pdf.save(`planning_${startDateInput}_au_${endDateInput}.pdf`);
    } finally {
        document.body.classList.remove('printing-mode');
        currentDate = originalDate;
        renderAll();
        document.getElementById('pdf-export-modal').classList.add('hidden');
        generateBtn.textContent = 'Générer';
        generateBtn.disabled = false;
    }
}