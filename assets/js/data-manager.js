/* ==========================================================================
   DATA MANAGER & LIVE EDITOR MODULE
   Fulfills requirement: "sana pag may update mabilis din"
   Provides instant in-browser editing, LocalStorage sync, and JSON import/export
   ========================================================================== */

const STORAGE_KEY = 'human_bi_dashboard_state_v3';
let currentData = null;

function renderKpiDeltaElement(el, changeVal, changeDir) {
  if (!el) return;
  let dir = changeDir;
  if (!dir) {
    if (typeof changeVal === 'string' && (changeVal.includes('↓') || changeVal.trim().startsWith('-'))) {
      dir = 'down';
    } else {
      dir = 'up';
    }
  }

  let numStr = typeof changeVal === 'number' ? String(changeVal) : String(changeVal || '').replace(/[^\d.]/g, '');
  if (!numStr) numStr = '0';

  const isDown = dir === 'down';
  el.className = `kpi-delta ${isDown ? 'delta-down' : 'delta-up'}`;
  el.innerHTML = `<span class="delta-arrow">${isDown ? '↓' : '↑'}</span> <span class="delta-val">${numStr}%</span>`;
}

async function loadInitialData() {
  let defaultData = null;
  try {
    const res = await fetch('data/dashboard-data.json');
    defaultData = await res.json();
  } catch (err) {
    console.error('Failed to load data/dashboard-data.json', err);
  }

  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      currentData = JSON.parse(cached);
      // Ensure longitudinal pool exists if cached under older schema
      if (defaultData && !currentData.longitudinalPool) {
        currentData.longitudinalPool = defaultData.longitudinalPool;
      }
      if (defaultData && defaultData.trend && !currentData.trend?.activeRange) {
        if (!currentData.trend) currentData.trend = {};
        currentData.trend.activeRange = 'last-6';
      }
    } catch (e) {
      console.warn('Cached data invalid, falling back to JSON file', e);
      currentData = defaultData;
    }
  } else {
    currentData = defaultData;
  }

  renderDashboard(currentData);
  syncTrendRangeSelector();
  return currentData;
}

function syncTrendRangeSelector() {
  const sel = document.getElementById('trendRangeSelect');
  if (sel && currentData && currentData.trend && currentData.trend.activeRange) {
    sel.value = currentData.trend.activeRange;
  }
}

function renderDashboard(data) {
  if (!data) return;

  // 1. Profile
  if (data.profile) {
    const nameEl = document.getElementById('profileName');
    const nickEl = document.getElementById('profileNickname');
    const roleEl = document.getElementById('profileRole');
    const avatarEl = document.getElementById('profileAvatar');
    if (nameEl) nameEl.textContent = data.profile.name;
    if (nickEl) nickEl.textContent = `("${data.profile.nickname}")`;
    if (roleEl) roleEl.textContent = data.profile.role;
    if (avatarEl && data.profile.avatar) avatarEl.src = data.profile.avatar;
  }

  // 2. KPIs
  if (data.kpis && Array.isArray(data.kpis)) {
    data.kpis.forEach(kpi => {
      const valEl = document.getElementById(`kpi-val-${kpi.id}`);
      const unitEl = document.getElementById(`kpi-unit-${kpi.id}`);
      const changeEl = document.getElementById(`kpi-change-${kpi.id}`);
      if (valEl) valEl.textContent = kpi.value;
      if (unitEl) unitEl.textContent = kpi.unit;
      if (changeEl) {
        renderKpiDeltaElement(changeEl, kpi.change, kpi.changeDirection);
      }
    });
  }

  // 3. Insights
  if (data.insights && Array.isArray(data.insights)) {
    const listEl = document.getElementById('insightsList');
    if (listEl) {
      listEl.innerHTML = data.insights
        .map(text => `<div class="insight-item">${text}</div>`)
        .join('');
    }
  }

  // 4. Anomaly
  if (data.anomaly) {
    const titleEl = document.getElementById('anomalyTitle');
    const reasonEl = document.getElementById('anomalyReason');
    const actionEl = document.getElementById('anomalyAction');
    if (titleEl) titleEl.textContent = data.anomaly.title;
    if (reasonEl) reasonEl.textContent = data.anomaly.reason;
    if (actionEl) actionEl.textContent = data.anomaly.action;
  }

  // 5. Strategic Question
  if (data.strategicQuestion) {
    const qEl = document.getElementById('strategicQuestionText');
    if (qEl) qEl.textContent = data.strategicQuestion;
  }

  // 6. Forecast Summary
  if (data.forecast && data.forecast.summary) {
    const fListEl = document.getElementById('forecastSummaryList');
    if (fListEl) {
      fListEl.innerHTML = data.forecast.summary
        .map(item => `<div class="summary-check-item"><span class="check-green">✓</span> <span>${item}</span></div>`)
        .join('');
    }
    const noteEl = document.getElementById('forecastNote');
    if (noteEl && data.forecast.note) noteEl.textContent = data.forecast.note;
  }

  // 7. Identity
  if (data.identity) {
    const quoteEl = document.getElementById('identityQuote');
    const titlesEl = document.getElementById('identityTitles');
    const valuesEl = document.getElementById('identityValues');
    if (quoteEl) quoteEl.textContent = `"${data.identity.quote}"`;
    if (titlesEl) titlesEl.textContent = data.identity.title;
    if (valuesEl) valuesEl.textContent = data.identity.subtitle;
  }

  // 8. Declarations
  if (data.declarations) {
    const decEl = document.getElementById('declarationText');
    const aiEl = document.getElementById('aiDisclosureText');
    if (decEl) decEl.innerHTML = `<strong>DECLARATION:</strong> ${data.declarations.declaration}`;
    if (aiEl) aiEl.innerHTML = `<strong>AI DISCLOSURE:</strong> ${data.declarations.aiDisclosure}`;
  }
}

/// Open Studio Modal & Pre-fill
function openDataEditor() {
  const overlay = document.getElementById('editOverlay');
  if (!overlay) return;

  // Pre-fill inputs
  if (currentData) {
    // Profile
    if (currentData.profile) {
      const inpName = document.getElementById('edit-profile-name');
      const inpNick = document.getElementById('edit-profile-nickname');
      const inpRole = document.getElementById('edit-profile-role');
      const studioAvatar = document.getElementById('studioAvatarPreview');
      if (inpName) inpName.value = currentData.profile.name || '';
      if (inpNick) inpNick.value = currentData.profile.nickname || '';
      if (inpRole) inpRole.value = currentData.profile.role || '';
      if (studioAvatar) studioAvatar.src = currentData.profile.avatar || 'assets/img/default-avatar.svg';
    }

    // KPIs
    currentData.kpis.forEach(kpi => {
      const inpVal = document.getElementById(`edit-val-${kpi.id}`);
      const inpNum = document.getElementById(`edit-change-num-${kpi.id}`);
      if (inpVal) inpVal.value = kpi.value;

      let numVal = typeof kpi.change === 'number' ? kpi.change : String(kpi.change || '').replace(/[^\d.]/g, '');
      if (inpNum) inpNum.value = numVal;

      let dir = kpi.changeDirection;
      if (!dir) {
        dir = (typeof kpi.change === 'string' && (kpi.change.includes('↓') || kpi.change.trim().startsWith('-'))) ? 'down' : 'up';
      }
      setKpiDirState(kpi.id, dir);
      updateKpiGauge(kpi.id);
    });

    // Monthly Trends (0 to 5 for Jan to Jun)
    if (currentData.trend && currentData.trend.datasets) {
      const proArr = currentData.trend.datasets.professionalImpact || [56, 61, 66, 80, 71, 86];
      const wellArr = currentData.trend.datasets.personalWellbeing || [69, 58, 54, 68, 55, 75];
      for (let i = 0; i < 6; i++) {
        const inpPro = document.getElementById(`trend-pro-${i}`);
        const inpWell = document.getElementById(`trend-well-${i}`);
        const meterPro = document.getElementById(`meter-pro-${i}`);
        const meterWell = document.getElementById(`meter-well-${i}`);

        const pVal = proArr[i] !== undefined ? proArr[i] : 50;
        const wVal = wellArr[i] !== undefined ? wellArr[i] : 50;

        if (inpPro) inpPro.value = pVal;
        if (inpWell) inpWell.value = wVal;
        if (meterPro) meterPro.style.width = `${pVal}%`;
        if (meterWell) meterWell.style.width = `${wVal}%`;
      }

      // Initialize or update live studio trendline preview chart
      setTimeout(() => {
        if (window.initStudioTrendPreview) {
          window.initStudioTrendPreview('studioTrendCanvas', proArr, wellArr);
        }
      }, 50);
    }

    // Anomaly
    const inpAnoTitle = document.getElementById('edit-anomaly-title');
    const inpAnoReason = document.getElementById('edit-anomaly-reason');
    const inpAnoAction = document.getElementById('edit-anomaly-action');
    if (inpAnoTitle) inpAnoTitle.value = currentData.anomaly.title;
    if (inpAnoReason) inpAnoReason.value = currentData.anomaly.reason;
    if (inpAnoAction) inpAnoAction.value = currentData.anomaly.action;

    // Strategic question
    const inpQuestion = document.getElementById('edit-strategic-question');
    if (inpQuestion) inpQuestion.value = currentData.strategicQuestion;

    // Direct Forecast Monthly Target Values (Jul – Dec)
    if (currentData.forecast && Array.isArray(currentData.forecast.values)) {
      for (let i = 0; i < 6; i++) {
        const fInp = document.getElementById(`forecast-val-${i}`);
        if (fInp) fInp.value = currentData.forecast.values[i] !== undefined ? currentData.forecast.values[i] : 50;
      }
    }

    // Dynamic Forecast Summary Checklist
    const forecastListEl = document.getElementById('forecastGoalsList');
    if (forecastListEl) {
      forecastListEl.innerHTML = '';
      if (currentData.forecast && Array.isArray(currentData.forecast.summary) && currentData.forecast.summary.length > 0) {
        currentData.forecast.summary.forEach(goalText => {
          addForecastGoalRow(goalText);
        });
      } else {
        addForecastGoalRow('Professional Impact Target: 90+ score');
        addForecastGoalRow('Maintain Personal Well-being above 70 benchmark');
      }
    }
    const fNote = document.getElementById('edit-forecast-note');
    if (fNote && currentData.forecast && currentData.forecast.note) {
      fNote.value = currentData.forecast.note;
    }
  }

  // Switch to default profile tab on open
  switchStudioTab('profile');

  overlay.classList.add('show');
}

function closeDataEditor() {
  const overlay = document.getElementById('editOverlay');
  if (overlay) overlay.classList.remove('show');
}

// Studio Tab Switcher
function switchStudioTab(tabKey) {
  document.querySelectorAll('.studio-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.studioTab === tabKey);
  });
  document.querySelectorAll('.studio-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `studio-panel-${tabKey}`);
  });

  // Resize live trend canvas if switching to trends tab
  if (tabKey === 'trends' && window.studioTrendChartInstance) {
    setTimeout(() => {
      window.studioTrendChartInstance.resize();
    }, 60);
  }
}

// Direction state helper for KPI delta editor
function setKpiDirState(kpiId, dir) {
  const btnUp = document.querySelector(`.dir-btn.dir-up[data-kpi="${kpiId}"]`);
  const btnDown = document.querySelector(`.dir-btn.dir-down[data-kpi="${kpiId}"]`);
  const wrapEl = document.getElementById(`delta-wrap-${kpiId}`);

  if (dir === 'down') {
    if (btnUp) btnUp.classList.remove('active');
    if (btnDown) btnDown.classList.add('active');
    if (wrapEl) {
      wrapEl.classList.remove('is-up');
      wrapEl.classList.add('is-down');
    }
  } else {
    if (btnUp) btnUp.classList.add('active');
    if (btnDown) btnDown.classList.remove('active');
    if (wrapEl) {
      wrapEl.classList.remove('is-down');
      wrapEl.classList.add('is-up');
    }
  }
}

// Creative KPI Steppers & Gauge Fill
function stepKpiValue(kpiId, delta) {
  const inputEl = document.getElementById(`edit-val-${kpiId}`);
  if (!inputEl) return;

  const raw = String(inputEl.value).replace(/[^\d.-]/g, '');
  let currentVal = parseFloat(raw) || 0;
  let newVal = currentVal + delta;

  if (kpiId === 'wellbeing_index') {
    newVal = Math.max(0, Math.min(10, newVal));
    inputEl.value = newVal.toFixed(1);
  } else if (kpiId === 'physical_readiness') {
    newVal = Math.max(0, Math.min(100, Math.round(newVal)));
    inputEl.value = newVal + '%';
  } else {
    newVal = Math.max(0, Math.round(newVal));
    inputEl.value = newVal;
  }

  updateKpiGauge(kpiId);
}

function updateKpiGauge(kpiId) {
  const inputEl = document.getElementById(`edit-val-${kpiId}`);
  const fillEl = document.getElementById(`gauge-fill-${kpiId}`);
  if (!inputEl || !fillEl) return;

  const num = parseFloat(String(inputEl.value).replace(/[^\d.]/g, '')) || 0;
  let pct = 50;

  switch (kpiId) {
    case 'learning_hours':
      pct = Math.min(100, Math.max(5, (num / 180) * 100));
      break;
    case 'student_impact':
      pct = Math.min(100, Math.max(5, (num / 550) * 100));
      break;
    case 'projects_initiatives':
      pct = Math.min(100, Math.max(5, (num / 12) * 100));
      break;
    case 'physical_readiness':
      pct = Math.min(100, Math.max(5, num));
      break;
    case 'wellbeing_index':
      pct = Math.min(100, Math.max(5, (num / 10) * 100));
      break;
  }

  fillEl.style.width = `${Math.round(pct)}%`;
}

// Direct Numerical Input Change Handler for Monthly Trends in Studio
function onTrendNumInputChange(index, metric, val) {
  let num = parseInt(val, 10);
  if (isNaN(num)) num = 0;
  num = Math.max(0, Math.min(100, num));

  // Update mini meter bar fill
  const meter = document.getElementById(`meter-${metric}-${index}`);
  if (meter) meter.style.width = `${num}%`;

  // Gather current values from all 6 inputs for live preview
  const currentPro = [];
  const currentWell = [];
  for (let i = 0; i < 6; i++) {
    const pEl = document.getElementById(`trend-pro-${i}`);
    const wEl = document.getElementById(`trend-well-${i}`);
    currentPro.push(pEl ? (parseInt(pEl.value, 10) || 0) : 50);
    currentWell.push(wEl ? (parseInt(wEl.value, 10) || 0) : 50);
  }

  if (window.updateStudioTrendPreview) {
    window.updateStudioTrendPreview(currentPro, currentWell);
  }
}

// Quick Stepper / Nudge for Monthly Values (-5 / +5)
function stepTrendVal(index, metric, delta) {
  const inp = document.getElementById(`trend-${metric}-${index}`);
  if (!inp) return;
  let cur = parseInt(inp.value, 10) || 0;
  let next = Math.max(0, Math.min(100, cur + delta));
  inp.value = next;
  onTrendNumInputChange(index, metric, next);
}

// Card Chart Interactive Drag Edit Mode Toggles (Cards C & G)
window.isCardCEditing = false;
window.isCardGEditing = false;

function toggleCardChartEdit(cardKey) {
  if (cardKey === 'c') {
    window.isCardCEditing = !window.isCardCEditing;
    const btn = document.getElementById('btnEditCardC');
    const btnText = document.getElementById('btnEditCardCText');
    const hint = document.getElementById('cardCDragHint');
    const card = document.getElementById('pbi-card-c');

    if (window.isCardCEditing) {
      if (btn) btn.classList.add('active-editing');
      if (btnText) btnText.textContent = '✓ Done';
      if (hint) hint.style.display = 'inline-flex';
      if (card) card.classList.add('card-editing-mode');
      showToast('Card C Edit Mode: Pull any dot on the chart to adjust values');
    } else {
      if (btn) btn.classList.remove('active-editing');
      if (btnText) btnText.textContent = 'Edit Dots';
      if (hint) hint.style.display = 'none';
      if (card) card.classList.remove('card-editing-mode');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      showToast('Card C changes saved & chart locked.');
    }
  } else if (cardKey === 'g') {
    window.isCardGEditing = !window.isCardGEditing;
    const btn = document.getElementById('btnEditCardG');
    const btnText = document.getElementById('btnEditCardGText');
    const hint = document.getElementById('cardGDragHint');
    const card = document.getElementById('pbi-card-g');

    if (window.isCardGEditing) {
      if (btn) btn.classList.add('active-editing');
      if (btnText) btnText.textContent = '✓ Done';
      if (hint) hint.style.display = 'inline-flex';
      if (card) card.classList.add('card-editing-mode');
      showToast('Card G Edit Mode: Pull bar tops to adjust forecast projections');
    } else {
      if (btn) btn.classList.remove('active-editing');
      if (btnText) btnText.textContent = 'Edit Bars';
      if (hint) hint.style.display = 'none';
      if (card) card.classList.remove('card-editing-mode');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      showToast('Card G forecast saved & bars locked.');
    }
  }
}

// Direct Forecast Month Input Change Handler
function onForecastNumInputChange(index, val) {
  if (!currentData) return;
  if (!currentData.forecast) currentData.forecast = { values: [55, 62, 67, 72, 75, 82] };
  let num = parseInt(val, 10);
  if (isNaN(num)) num = 0;
  num = Math.max(0, Math.min(100, num));
  currentData.forecast.values[index] = num;

  if (typeof calculateStatisticalTrendline === 'function') {
    currentData.forecast.trendline = calculateStatisticalTrendline(currentData.forecast.values);
  }
  if (window.initForecastChart) {
    window.initForecastChart(currentData.forecast);
  }
}

// Auto-Calculate Real-Time Forecast from Current Historical Trends
function autoCalculateForecastFromTrends() {
  if (!currentData || !currentData.trend || !currentData.trend.datasets) return;
  const pro = currentData.trend.datasets.professionalImpact || [56, 61, 66, 80, 71, 86];
  const well = currentData.trend.datasets.personalWellbeing || [69, 58, 54, 68, 55, 75];

  const n = pro.length;
  const lastPro = pro[n - 1] || 80;
  const prevPro = pro[Math.max(0, n - 3)] || 70;
  const proVelocity = (lastPro - prevPro) / Math.max(1, Math.min(3, n - 1));

  const lastWell = well[n - 1] || 75;
  const prevWell = well[Math.max(0, n - 3)] || 65;
  const wellVelocity = (lastWell - prevWell) / Math.max(1, Math.min(3, n - 1));

  const blendedVelocity = (proVelocity * 0.65) + (wellVelocity * 0.35);
  const startVal = Math.round((lastPro * 0.6) + (lastWell * 0.4));

  const projectedValues = [];
  for (let i = 0; i < 6; i++) {
    const proj = Math.round(startVal + (blendedVelocity * (i + 1) * 0.85));
    projectedValues.push(Math.max(30, Math.min(98, proj)));
  }

  if (!currentData.forecast) currentData.forecast = {};
  currentData.forecast.values = projectedValues;

  for (let i = 0; i < 6; i++) {
    const inp = document.getElementById(`forecast-val-${i}`);
    if (inp) inp.value = projectedValues[i];
  }

  if (typeof calculateStatisticalTrendline === 'function') {
    currentData.forecast.trendline = calculateStatisticalTrendline(currentData.forecast.values);
  }

  if (window.initForecastChart) {
    window.initForecastChart(currentData.forecast);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
  showToast('⚡ Calculated real-time momentum forecast from trends!');
}

// Dynamic Forecast Checklist Methods
function addForecastGoalRow(text = '') {
  const list = document.getElementById('forecastGoalsList');
  if (!list) return;

  const row = document.createElement('div');
  row.className = 'forecast-goal-row';
  row.innerHTML = `
    <span class="goal-check-badge">✓</span>
    <input type="text" class="forecast-goal-input" value="${escapeHtml(text)}" placeholder="Enter target / forecast goal milestone..." required>
    <button type="button" class="goal-delete-btn" onclick="removeForecastGoalRow(this)" title="Remove this target">✕</button>
  `;
  list.appendChild(row);
}

function removeForecastGoalRow(btn) {
  const row = btn.closest('.forecast-goal-row');
  if (row) row.remove();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Trend Scenarios Presets with Visual Sliders & Live Preview Sync
function applyTrendPreset(type) {
  const presets = {
    'default': {
      pro: [56, 61, 66, 80, 71, 86],
      well: [69, 58, 54, 68, 55, 75]
    },
    'high-impact': {
      pro: [62, 70, 78, 92, 85, 96],
      well: [65, 60, 52, 60, 58, 72]
    },
    'balanced': {
      pro: [55, 62, 68, 74, 78, 85],
      well: [70, 68, 65, 72, 75, 80]
    },
    'dip': {
      pro: [60, 65, 45, 52, 74, 88],
      well: [72, 68, 40, 46, 65, 78]
    },
    'growth': {
      pro: [42, 52, 64, 76, 88, 98],
      well: [52, 58, 66, 75, 84, 94]
    }
  };

  let selected = presets[type];
  if (type === 'random') {
    selected = {
      pro: Array.from({ length: 6 }, () => Math.floor(Math.random() * 45) + 50),
      well: Array.from({ length: 6 }, () => Math.floor(Math.random() * 40) + 45)
    };
  } else if (!selected) {
    selected = presets['default'];
  }

  for (let i = 0; i < 6; i++) {
    const inpPro = document.getElementById(`trend-pro-${i}`);
    const inpWell = document.getElementById(`trend-well-${i}`);
    const meterPro = document.getElementById(`meter-pro-${i}`);
    const meterWell = document.getElementById(`meter-well-${i}`);

    if (inpPro) inpPro.value = selected.pro[i];
    if (inpWell) inpWell.value = selected.well[i];
    if (meterPro) meterPro.style.width = `${selected.pro[i]}%`;
    if (meterWell) meterWell.style.width = `${selected.well[i]}%`;
  }

  if (window.updateStudioTrendPreview) {
    window.updateStudioTrendPreview(selected.pro, selected.well);
  }

  showToast(`Scenario "${type}" loaded into interactive preview.`);
}

// Save Changes from Studio
function saveEditorChanges(e) {
  if (e) e.preventDefault();
  if (!currentData) return;

  // Update Profile
  if (!currentData.profile) currentData.profile = {};
  const inpName = document.getElementById('edit-profile-name');
  const inpNick = document.getElementById('edit-profile-nickname');
  const inpRole = document.getElementById('edit-profile-role');
  if (inpName) currentData.profile.name = inpName.value.trim();
  if (inpNick) currentData.profile.nickname = inpNick.value.trim();
  if (inpRole) currentData.profile.role = inpRole.value.trim();

  // Update KPIs
  currentData.kpis.forEach(kpi => {
    const inpVal = document.getElementById(`edit-val-${kpi.id}`);
    const inpNum = document.getElementById(`edit-change-num-${kpi.id}`);
    const btnDown = document.querySelector(`.dir-btn.dir-down[data-kpi="${kpi.id}"]`);

    if (inpVal) kpi.value = inpVal.value.trim();
    
    let numVal = inpNum ? inpNum.value.trim() : '0';
    if (!numVal) numVal = '0';
    const isDown = btnDown && btnDown.classList.contains('active');
    kpi.changeDirection = isDown ? 'down' : 'up';
    kpi.change = numVal;
    kpi.changeType = isDown ? 'negative' : 'positive';
  });

  // Update Monthly Trends
  const newPro = [];
  const newWell = [];
  for (let i = 0; i < 6; i++) {
    const inpPro = document.getElementById(`trend-pro-${i}`);
    const inpWell = document.getElementById(`trend-well-${i}`);
    newPro.push(inpPro ? (parseFloat(inpPro.value) || 0) : 50);
    newWell.push(inpWell ? (parseFloat(inpWell.value) || 0) : 50);
  }
  if (!currentData.trend) currentData.trend = { datasets: {} };
  if (!currentData.trend.datasets) currentData.trend.datasets = {};
  currentData.trend.datasets.professionalImpact = newPro;
  currentData.trend.datasets.personalWellbeing = newWell;

  // Update Anomaly
  const inpAnoTitle = document.getElementById('edit-anomaly-title');
  const inpAnoReason = document.getElementById('edit-anomaly-reason');
  const inpAnoAction = document.getElementById('edit-anomaly-action');
  if (inpAnoTitle) currentData.anomaly.title = inpAnoTitle.value.trim();
  if (inpAnoReason) currentData.anomaly.reason = inpAnoReason.value.trim();
  if (inpAnoAction) currentData.anomaly.action = inpAnoAction.value.trim();

  // Strategic Question
  const inpQuestion = document.getElementById('edit-strategic-question');
  if (inpQuestion) currentData.strategicQuestion = inpQuestion.value.trim();

  // Dynamic Forecast Summary & Targets
  const goalInputs = document.querySelectorAll('#forecastGoalsList .forecast-goal-input');
  const goals = Array.from(goalInputs).map(inp => inp.value.trim()).filter(v => v.length > 0);
  if (!currentData.forecast) currentData.forecast = {};
  currentData.forecast.summary = goals;
  const fNote = document.getElementById('edit-forecast-note');
  if (fNote) currentData.forecast.note = fNote.value.trim();

  // Save 6-Month Forecast direct target values (Jul – Dec)
  const newForecastVals = [];
  for (let i = 0; i < 6; i++) {
    const fInp = document.getElementById(`forecast-val-${i}`);
    newForecastVals.push(fInp ? (parseInt(fInp.value, 10) || 50) : 50);
  }
  currentData.forecast.values = newForecastVals;
  if (typeof calculateStatisticalTrendline === 'function') {
    currentData.forecast.trendline = calculateStatisticalTrendline(newForecastVals);
  }

  // Save to LocalStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

  // Re-render UI & Charts
  renderDashboard(currentData);
  if (window.updateCharts) {
    window.updateCharts(currentData);
  }

  closeDataEditor();
  showToast('Executive metrics synchronized & saved!');
}

// Reset to Default Factory Settings
async function resetToDefaults() {
  if (!confirm('Revert all changes to original default values?')) return;
  localStorage.removeItem(STORAGE_KEY);
  try {
    const res = await fetch('data/dashboard-data.json');
    currentData = await res.json();
    renderDashboard(currentData);
    syncTrendRangeSelector();
    if (window.updateCharts) window.updateCharts(currentData);
    closeDataEditor();
    showToast('Reset to original default values.');
  } catch (err) {
    console.error('Error resetting defaults', err);
  }
}

// Export JSON file
function exportDataJSON() {
  if (!currentData) return;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'human-bi-dashboard-data.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Data exported as human-bi-dashboard-data.json');
}

// Import JSON file
function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      currentData = parsed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      renderDashboard(currentData);
      syncTrendRangeSelector();
      if (window.updateCharts) window.updateCharts(currentData);
      closeDataEditor();
      showToast('New data imported and applied successfully!');
    } catch (err) {
      alert('Invalid JSON file format.');
    }
  };
  reader.readAsText(file);
}

function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Avatar Upload Handler
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (JPG, PNG, WebP, SVG).');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (!currentData) currentData = {};
    if (!currentData.profile) currentData.profile = {};
    currentData.profile.avatar = dataUrl;

    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) {
      avatarEl.src = dataUrl;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    showToast('Profile photo updated successfully!');
  };
  reader.readAsDataURL(file);
}

function resetAvatarPhoto() {
  const defaultAvatar = 'assets/img/default-avatar.svg';
  if (!currentData) currentData = {};
  if (!currentData.profile) currentData.profile = {};
  currentData.profile.avatar = defaultAvatar;

  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    avatarEl.src = defaultAvatar;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
  showToast('Profile photo reset to default silhouette.');
}

// Setup avatar event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const avatarFileInput = document.getElementById('avatarFileInput');
  const btnChangeAvatar = document.getElementById('btnChangeAvatar');
  const avatarBoxClick = document.getElementById('avatarBoxClick');
  const btnDrawerUploadPhoto = document.getElementById('btnDrawerUploadPhoto');
  const btnDrawerResetPhoto = document.getElementById('btnDrawerResetPhoto');

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', handleAvatarUpload);
  }
  if (btnChangeAvatar && avatarFileInput) {
    btnChangeAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      avatarFileInput.click();
    });
  }
  if (avatarBoxClick && avatarFileInput) {
    avatarBoxClick.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }
  if (btnDrawerUploadPhoto && avatarFileInput) {
    btnDrawerUploadPhoto.addEventListener('click', () => {
      avatarFileInput.click();
    });
  }
  if (btnDrawerResetPhoto) {
    btnDrawerResetPhoto.addEventListener('click', resetAvatarPhoto);
  }

  // Setup tab switcher event listeners for Studio Modal
  document.querySelectorAll('.studio-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.studioTab;
      if (tabKey) switchStudioTab(tabKey);
    });
  });

  // Setup directional toggle buttons for KPI delta editor
  document.querySelectorAll('.dir-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const kpiId = btn.dataset.kpi;
      const dir = btn.dataset.dir;
      if (kpiId && dir) {
        setKpiDirState(kpiId, dir);
      }
    });
  });
});

window.loadInitialData = loadInitialData;
window.openDataEditor = openDataEditor;
window.closeDataEditor = closeDataEditor;
window.switchStudioTab = switchStudioTab;
window.applyTrendPreset = applyTrendPreset;
window.setKpiDirState = setKpiDirState;
window.saveEditorChanges = saveEditorChanges;
window.resetToDefaults = resetToDefaults;
window.exportDataJSON = exportDataJSON;
window.importDataJSON = importDataJSON;
window.showToast = showToast;
window.handleAvatarUpload = handleAvatarUpload;
window.resetAvatarPhoto = resetAvatarPhoto;
window.stepKpiValue = stepKpiValue;
window.updateKpiGauge = updateKpiGauge;
window.onTrendNumInputChange = onTrendNumInputChange;
window.stepTrendVal = stepTrendVal;
window.toggleCardChartEdit = toggleCardChartEdit;
window.onForecastNumInputChange = onForecastNumInputChange;
window.autoCalculateForecastFromTrends = autoCalculateForecastFromTrends;
window.addForecastGoalRow = addForecastGoalRow;
window.removeForecastGoalRow = removeForecastGoalRow;
window.onTrendRangeSelect = onTrendRangeSelect;
window.syncTrendRangeSelector = syncTrendRangeSelector;
window.handleChartPointDrag = handleChartPointDrag;
window.handleChartPointDragEnd = handleChartPointDragEnd;
window.handleStudioPointDrag = handleStudioPointDrag;
window.handleStudioPointDragEnd = handleStudioPointDragEnd;
