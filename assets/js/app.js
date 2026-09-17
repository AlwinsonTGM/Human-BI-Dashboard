/* ==========================================================================
   APP CONTROLLER & NAVIGATION
   Manages tabs, routing, iframe lazy-loading, and interactive controls
   ========================================================================== */

const LAYOUT_STORAGE_KEY = 'human_bi_card_layout_v1';
const HIDDEN_CARDS_STORAGE_KEY = 'human_bi_hidden_cards_v1';
const CUSTOM_CARDS_STORAGE_KEY = 'human_bi_custom_cards_v1';

let draggedCard = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load data and render initial dashboard
  const data = await window.loadInitialData();

  // 2. Initialize charts
  if (data && window.initCharts) {
    window.initCharts(data);
  }

  // 3. Initialize Card Drag & Drop and Layout
  initCardDragAndDrop();

  // 4. Tab Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
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

  // 5. Action Button Listeners
  const btnEditData = document.getElementById('btnEditData');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const editOverlay = document.getElementById('editOverlay');
  const editForm = document.getElementById('editForm');
  const btnResetDefaults = document.getElementById('btnResetDefaults');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const btnExportPDF = document.getElementById('btnExportPDF');
  const btnShareLink = document.getElementById('btnShareLink');

  if (btnEditData) btnEditData.addEventListener('click', window.openDataEditor);
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
        window.showToast('View-only link copied to clipboard!');
      }).catch(() => {
        window.showToast('Share URL: ' + window.location.href);
      });
    });
  }
});

// View Switcher Function
function switchView(viewName) {
  // Update Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
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

  // Lazy-load GIS Map if switching to GIS view
  if (viewName === 'gis') {
    lazyLoadGISMap();
  }

  // Resize charts if switching to dashboard view
  if (viewName === 'dashboard' && window.updateCharts && window.currentData) {
    setTimeout(() => {
      window.updateCharts(window.currentData);
    }, 100);
  }
}

// Lazy load QuakeSpots map iframe to save memory
let gisMapLoaded = false;
function lazyLoadGISMap() {
  if (gisMapLoaded) return;
  const iframe = document.getElementById('gisMapIframe');
  const loader = document.getElementById('gisLoader');
  if (iframe) {
    iframe.src = 'quakespots3.html';
    iframe.onload = () => {
      if (loader) loader.style.display = 'none';
      iframe.style.opacity = '1';
      gisMapLoaded = true;
    };
  }
}

function toggleMapFullscreen() {
  const container = document.getElementById('gisMapContainer');
  if (!container) return;

  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// ==========================================================================
// CARD DRAG & DROP AND LAYOUT PERSISTENCE
// ==========================================================================
function initCardDragAndDrop() {
  const grid = document.querySelector('.pbi-grid');
  if (!grid) return;

  // 1. Restore any saved custom cards first
  restoreCustomCards();

  // 2. Restore ordering & hidden states
  restoreCardLayout();

  // 3. Attach listeners to all cards currently in grid
  const cards = grid.querySelectorAll('.pbi-card');
  cards.forEach(card => {
    attachCardDragListeners(card);
  });

  // 4. Attach grid dragover
  grid.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });
}

function attachCardDragListeners(card) {
  card.setAttribute('draggable', 'true');

  card.addEventListener('dragstart', (e) => {
    // Don't drag if user is typing in contenteditable
    if (e.target.isContentEditable) {
      e.preventDefault();
      return;
    }
    draggedCard = card;
    card.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.cardId || card.id);
  });

  card.addEventListener('dragend', () => {
    if (draggedCard) {
      draggedCard.classList.remove('is-dragging');
      draggedCard = null;
    }
    document.querySelectorAll('.pbi-card.drag-over').forEach(c => c.classList.remove('drag-over'));
    saveCurrentCardLayout();
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedCard || draggedCard === card) return;
    card.classList.add('drag-over');
  });

  card.addEventListener('dragleave', (e) => {
    if (!card.contains(e.relatedTarget)) {
      card.classList.remove('drag-over');
    }
  });

  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (!draggedCard || draggedCard === card) return;

    const grid = card.parentNode;
    const rect = card.getBoundingClientRect();
    const isAfter = (e.clientY > rect.top + rect.height / 2);

    if (isAfter) {
      grid.insertBefore(draggedCard, card.nextSibling);
    } else {
      grid.insertBefore(draggedCard, card);
    }

    saveCurrentCardLayout();
    window.showToast('Card arrangement updated.');
  });
}

function saveCurrentCardLayout() {
  const grid = document.querySelector('.pbi-grid');
  if (!grid) return;

  const cardIds = [];
  grid.querySelectorAll('.pbi-card').forEach(card => {
    const id = card.dataset.cardId || card.id;
    if (id) cardIds.push(id);
  });

  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(cardIds));
}

function restoreCardLayout() {
  const grid = document.querySelector('.pbi-grid');
  if (!grid) return;

  // Restore ordering
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (saved) {
    try {
      const order = JSON.parse(saved);
      if (Array.isArray(order)) {
        order.forEach(cardId => {
          const el = grid.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
          if (el) grid.appendChild(el);
        });
      }
    } catch (e) {
      console.warn('Failed to restore card layout', e);
    }
  }

  // Restore hidden cards
  const hiddenSaved = localStorage.getItem(HIDDEN_CARDS_STORAGE_KEY);
  if (hiddenSaved) {
    try {
      const hiddenList = JSON.parse(hiddenSaved);
      if (Array.isArray(hiddenList)) {
        hiddenList.forEach(cardId => {
          const el = grid.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId);
          if (el) el.style.display = 'none';
        });
      }
    } catch (e) {}
  }
}

function resetCardLayout() {
  localStorage.removeItem(LAYOUT_STORAGE_KEY);
  localStorage.removeItem(HIDDEN_CARDS_STORAGE_KEY);

  const grid = document.querySelector('.pbi-grid');
  if (!grid) return;

  // Default A-I order
  const defaultOrder = ['card-a', 'card-b', 'card-c', 'card-d', 'card-e', 'card-f', 'card-g', 'card-h', 'card-i'];
  defaultOrder.forEach(id => {
    const el = grid.querySelector(`[data-card-id="${id}"]`);
    if (el) {
      el.style.display = '';
      grid.appendChild(el);
    }
  });

  window.showToast('Card layout restored to default A–I order.');
}

function toggleCardVisibility(cardId, isVisible) {
  const grid = document.querySelector('.pbi-grid');
  const card = grid ? (grid.querySelector(`[data-card-id="${cardId}"]`) || document.getElementById(cardId)) : null;
  if (!card) return;

  let hiddenList = [];
  try {
    hiddenList = JSON.parse(localStorage.getItem(HIDDEN_CARDS_STORAGE_KEY)) || [];
  } catch (e) {}

  if (isVisible) {
    card.style.display = '';
    hiddenList = hiddenList.filter(id => id !== cardId);
    window.showToast('Card unhidden and visible on dashboard.');
  } else {
    card.style.display = 'none';
    if (!hiddenList.includes(cardId)) hiddenList.push(cardId);
    window.showToast('Card hidden. You can unhide it anytime in Data Studio.');
  }

  localStorage.setItem(HIDDEN_CARDS_STORAGE_KEY, JSON.stringify(hiddenList));
}

function restoreAllHiddenCards() {
  localStorage.removeItem(HIDDEN_CARDS_STORAGE_KEY);
  document.querySelectorAll('.pbi-card').forEach(card => {
    card.style.display = '';
  });
  window.showToast('All dashboard cards are now unhidden.');
}

// Add Dynamic Custom Card
function addCustomCard(title = 'CUSTOM EXECUTIVE NOTE', content = 'Click to edit this custom target, strategic observation, or meeting notes.') {
  const grid = document.querySelector('.pbi-grid');
  if (!grid) return;

  const cardCount = grid.querySelectorAll('.pbi-card').length;
  const customId = `custom-card-${Date.now()}`;
  const letter = String.fromCharCode(65 + (cardCount % 26));

  const card = document.createElement('div');
  card.className = 'pbi-card custom-pbi-card';
  card.id = customId;
  card.dataset.cardId = customId;
  card.setAttribute('draggable', 'true');
  card.innerHTML = `
    <div class="card-header">
      <span class="card-drag-handle" title="Drag to reorder card"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg></span>
      <span class="card-letter-badge" style="background-color: #2563eb;">${letter}</span>
      <span class="card-title" contenteditable="true" title="Click to edit title" onblur="saveCustomCards()">${escapeHtml(title)}</span>
      <button type="button" class="card-hide-btn" onclick="removeCustomCard('${customId}')" title="Delete custom card" aria-label="Delete card">✕</button>
    </div>
    <div class="card-body" style="padding: 10px 0; font-size: 13px; color: #334155; line-height: 1.5;" contenteditable="true" title="Click to edit content" onblur="saveCustomCards()">
      ${escapeHtml(content)}
    </div>
  `;

  grid.appendChild(card);
  attachCardDragListeners(card);
  saveCurrentCardLayout();
  saveCustomCards();
  window.showToast(`Custom card ${letter} added! Click on title or body to edit.`);
}

function removeCustomCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.remove();
    saveCurrentCardLayout();
    saveCustomCards();
    window.showToast('Custom card removed.');
  }
}

function saveCustomCards() {
  const customCards = [];
  document.querySelectorAll('.custom-pbi-card').forEach(card => {
    const titleEl = card.querySelector('.card-title');
    const bodyEl = card.querySelector('.card-body');
    customCards.push({
      id: card.id,
      title: titleEl ? titleEl.textContent : '',
      content: bodyEl ? bodyEl.innerHTML : ''
    });
  });
  localStorage.setItem(CUSTOM_CARDS_STORAGE_KEY, JSON.stringify(customCards));
}

function restoreCustomCards() {
  const saved = localStorage.getItem(CUSTOM_CARDS_STORAGE_KEY);
  if (!saved) return;
  try {
    const list = JSON.parse(saved);
    if (Array.isArray(list)) {
      list.forEach(item => {
        if (!document.getElementById(item.id)) {
          addCustomCard(item.title, item.content);
        }
      });
    }
  } catch (e) {}
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

window.switchView = switchView;
window.toggleMapFullscreen = toggleMapFullscreen;
window.initCardDragAndDrop = initCardDragAndDrop;
window.resetCardLayout = resetCardLayout;
window.toggleCardVisibility = toggleCardVisibility;
window.restoreAllHiddenCards = restoreAllHiddenCards;
window.addCustomCard = addCustomCard;
window.removeCustomCard = removeCustomCard;
window.saveCustomCards = saveCustomCards;
