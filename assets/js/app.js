/* ==========================================================================
   APP CONTROLLER & NAVIGATION (HIGH-STATURE EXECUTIVE BRIEF)
   Manages tabs, routing, iframe lazy-loading, and interactive controls
   ========================================================================== */

const LAYOUT_STORAGE_KEY = 'human_bi_card_layout_v1';
const HIDDEN_CARDS_STORAGE_KEY = 'human_bi_hidden_cards_v1';
const CUSTOM_CARDS_STORAGE_KEY = 'human_bi_custom_cards_v1';

document.addEventListener('DOMContentLoaded', async () => {
  // Clear any legacy flat drag layout that could break structured rows
  localStorage.removeItem(LAYOUT_STORAGE_KEY);

  // 1. Load data and render initial dashboard
  const data = await window.loadInitialData();

  // 2. Initialize charts
  if (data && window.initCharts) {
    window.initCharts(data);
  }

  // 3. Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn, .nav-pill-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
    });
  });

  // Check URL hash on page load
  const currentHash = window.location.hash.replace('#', '');
  if (['dashboard', 'gis', 'methodology'].includes(currentHash)) {
    switchView(currentHash);
  }

  // 4. Action Button Listeners
  const btnEditData = document.getElementById('btnEditData');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const editOverlay = document.getElementById('editOverlay');
  const editForm = document.getElementById('editForm');
  const btnResetDefaults = document.getElementById('btnResetDefaults');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const btnExportPDF = document.getElementById('btnExportPDF');
  const btnShareLink = document.getElementById('btnShareLink');

  if (btnEditData) {
    btnEditData.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      if (typeof window.openUnifiedEditor === 'function') {
        window.openUnifiedEditor('a');
      } else if (typeof window.openDataEditor === 'function') {
        window.openDataEditor('profile');
      }
    });
  }
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', window.closeDataEditor);
  if (editOverlay) {
    editOverlay.addEventListener('click', (e) => {
      if (e.target === editOverlay) {
        window.closeDataEditor();
      }
    });
  }
  if (editForm) editForm.addEventListener('submit', window.saveEditorChanges);
  if (btnResetDefaults) btnResetDefaults.addEventListener('click', window.resetToDefaults);
  if (btnExportJSON) btnExportJSON.addEventListener('click', window.exportDataJSON);
  if (jsonFileInput) jsonFileInput.addEventListener('change', window.importDataJSON);
  if (btnExportPDF) btnExportPDF.addEventListener('click', window.exportToPDF);

  if (btnShareLink) {
    btnShareLink.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        window.showToast('Executive portal link copied to clipboard.');
      }).catch(() => {
        window.showToast('Portal URL: ' + window.location.href);
      });
    });
  }
});

// View Switcher Function
function switchView(viewName) {
  // Update Tab Buttons
  document.querySelectorAll('.tab-btn, .nav-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Update View Sections
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update URL hash without scroll jumping
  history.replaceState(null, null, `#${viewName}`);

  // Resize charts if switching to dashboard view
  if (viewName === 'dashboard' && window.updateCharts && window.dashboardData) {
    setTimeout(() => {
      window.updateCharts(window.dashboardData);
    }, 120);
  }
}

// Global Exports
window.switchView = switchView;
window.initCardDragAndDrop = () => {};
window.toggleCardVisibility = () => {};
window.restoreAllHiddenCards = () => {};
