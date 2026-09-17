/* ==========================================================================
   PDF EXPORT ENGINE
   Formats and downloads the Human BI Dashboard as a clean executive PDF
   ========================================================================== */

function exportToPDF() {
  // Ensure the user is viewing the Human BI Dashboard before printing
  if (window.switchView) {
    window.switchView('dashboard');
  }

  // Check if html2pdf library is available on window
  const canvasElement = document.getElementById('dashboardCanvas');

  if (window.html2pdf && canvasElement) {
    const opt = {
      margin: [6, 8, 6, 8], // mm
      filename: 'Human_BI_Dashboard_Mary_Jane_Legaspi.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    if (window.showToast) {
      window.showToast('Generating executive PDF report...');
    }

    html2pdf().set(opt).from(canvasElement).save().then(() => {
      if (window.showToast) {
        window.showToast('PDF downloaded successfully!');
      }
    }).catch(err => {
      console.warn('html2pdf error, falling back to window.print()', err);
      window.print();
    });
  } else {
    // Standard high-fidelity browser print dialog using our @media print CSS
    window.print();
  }
}

window.exportToPDF = exportToPDF;
