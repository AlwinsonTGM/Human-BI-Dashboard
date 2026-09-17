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
        const sliderPro = document.getElementById(`slider-pro-${i}`);
        const sliderWell = document.getElementById(`slider-well-${i}`);
        const badgePro = document.getElementById(`badge-pro-${i}`);
        const badgeWell = document.getElementById(`badge-well-${i}`);

        const pVal = proArr[i] !== undefined ? proArr[i] : 50;
        const wVal = wellArr[i] !== undefined ? wellArr[i] : 50;

        if (inpPro) inpPro.value = pVal;
        if (inpWell) inpWell.value = wVal;
        if (sliderPro) sliderPro.value = pVal;
        if (sliderWell) sliderWell.value = wVal;
        if (badgePro) badgePro.textContent = pVal;
        if (badgeWell) badgeWell.textContent = wVal;
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

// Interactive Monthly Slider Change Handler
function onTrendSliderChange(index, metric, val) {
  const hiddenInp = document.getElementById(`trend-${metric}-${index}`);
  const badge = document.getElementById(`badge-${metric}-${index}`);
  if (hiddenInp) hiddenInp.value = val;
  if (badge) badge.textContent = val;

  // Gather current values for real-time chart update
  const currentPro = [];
  const currentWell = [];
  for (let i = 0; i < 6; i++) {
    const pEl = document.getElementById(`slider-pro-${i}`);
    const wEl = document.getElementById(`slider-well-${i}`);
    currentPro.push(pEl ? parseInt(pEl.value, 10) || 0 : 50);
    currentWell.push(wEl ? parseInt(wEl.value, 10) || 0 : 50);
  }

  if (window.updateStudioTrendPreview) {
    window.updateStudioTrendPreview(currentPro, currentWell);
  }
}

// Time Horizon Range Selector for Authentic Trend Chart (Card C)
function onTrendRangeSelect(rangeKey) {
  if (!currentData) return;

  if (!currentData.longitudinalPool) {
    currentData.longitudinalPool = {
      labels: ["Jul '24", "Aug '24", "Sep '24", "Oct '24", "Nov '24", "Dec '24", "Jan '25", "Feb '25", "Mar '25", "Apr '25", "May '25", "Jun '25"],
      datasets: {
        professionalImpact: [48, 52, 55, 60, 58, 64, 56, 61, 66, 80, 71, 86],
        personalWellbeing: [62, 65, 60, 58, 63, 67, 69, 58, 54, 68, 55, 75]
      },
      ranges: {
        "last-6": { label: "Current (Jan–Jun '25)", indices: [6, 7, 8, 9, 10, 11] },
        "last-3": { label: "Recent / Q2 (Apr–Jun '25)", indices: [9, 10, 11] },
        "q1": { label: "Baseline / Q1 (Jan–Mar '25)", indices: [6, 7, 8] },
        "prior-6": { label: "Prior Sem (Jul–Dec '24)", indices: [0, 1, 2, 3, 4, 5] },
        "full-year": { label: "12-Mo Annual (Jul '24–Jun '25)", indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }
      }
    };
  }

  const pool = currentData.longitudinalPool;
  const rangeConfig = pool.ranges?.[rangeKey] || pool.ranges?.['last-6'];
  if (!rangeConfig) return;

  const slicedLabels = rangeConfig.indices.map(i => pool.labels[i]);
  const slicedPro = rangeConfig.indices.map(i => pool.datasets.professionalImpact[i]);
  const slicedWell = rangeConfig.indices.map(i => pool.datasets.personalWellbeing[i]);

  if (!currentData.trend) currentData.trend = {};
  currentData.trend.activeRange = rangeKey;
  currentData.trend.period = rangeConfig.label;
  currentData.trend.labels = slicedLabels;
  if (!currentData.trend.datasets) currentData.trend.datasets = {};
  currentData.trend.datasets.professionalImpact = slicedPro;
  currentData.trend.datasets.personalWellbeing = slicedWell;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

  if (window.initTrendChart) {
    window.initTrendChart(currentData.trend);
  } else if (window.updateCharts) {
    window.updateCharts(currentData);
  }

  syncTrendRangeSelector();
  showToast(`Horizon updated: ${rangeConfig.label}`);
}

// Chart Point Drag Handlers for on-canvas interactive editing
function handleChartPointDrag(chartType, datasetIndex, index, value) {
  if (!currentData) return;

  if (chartType === 'trend') {
    if (!currentData.trend || !currentData.trend.datasets) return;
    const activeRange = currentData.trend.activeRange || 'last-6';
    const pool = currentData.longitudinalPool;
    const rangeConfig = pool?.ranges?.[activeRange];
    const poolIdx = (rangeConfig && rangeConfig.indices && rangeConfig.indices[index] !== undefined)
      ? rangeConfig.indices[index]
      : index;

    if (datasetIndex === 0) {
      if (currentData.trend.datasets.professionalImpact) {
        currentData.trend.datasets.professionalImpact[index] = value;
      }
      if (pool?.datasets?.professionalImpact && poolIdx !== undefined) {
        pool.datasets.professionalImpact[poolIdx] = value;
      }
      // If visible in studio (months 0..5 correspond to Jan..Jun, indices 6..11)
      if (poolIdx >= 6 && poolIdx <= 11) {
        const sIdx = poolIdx - 6;
        const sEl = document.getElementById(`slider-pro-${sIdx}`);
        const bEl = document.getElementById(`badge-pro-${sIdx}`);
        const iEl = document.getElementById(`trend-pro-${sIdx}`);
        if (sEl) sEl.value = value;
        if (bEl) bEl.textContent = value;
        if (iEl) iEl.value = value;
      }
    } else {
      if (currentData.trend.datasets.personalWellbeing) {
        currentData.trend.datasets.personalWellbeing[index] = value;
      }
      if (pool?.datasets?.personalWellbeing && poolIdx !== undefined) {
        pool.datasets.personalWellbeing[poolIdx] = value;
      }
      if (poolIdx >= 6 && poolIdx <= 11) {
        const sIdx = poolIdx - 6;
        const sEl = document.getElementById(`slider-well-${sIdx}`);
        const bEl = document.getElementById(`badge-well-${sIdx}`);
        const iEl = document.getElementById(`trend-well-${sIdx}`);
        if (sEl) sEl.value = value;
        if (bEl) bEl.textContent = value;
        if (iEl) iEl.value = value;
      }
    }
  } else if (chartType === 'forecast') {
    if (!currentData.forecast || !currentData.forecast.values) return;
    if (datasetIndex === 0) {
      currentData.forecast.values[index] = value;
    }
  }
}

function handleChartPointDragEnd(chartType, datasetIndex, index, value) {
  if (!currentData) return;
  handleChartPointDrag(chartType, datasetIndex, index, value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

  if (chartType === 'trend') {
    const metric = datasetIndex === 0 ? 'Professional Impact' : 'Personal Well-being';
    const month = currentData.trend?.labels?.[index] || `Month ${index + 1}`;
    showToast(`Saved ${metric} for ${month}: ${value}%`);
  } else if (chartType === 'forecast') {
    const month = currentData.forecast?.labels?.[index] || `Month ${index + 1}`;
    showToast(`Saved projection for ${month}: ${value}`);
  }
}

// Studio Modal Canvas Drag Handlers
function handleStudioPointDrag(datasetIndex, index, value) {
  if (datasetIndex === 0) {
    const sPro = document.getElementById(`slider-pro-${index}`);
    const bPro = document.getElementById(`badge-pro-${index}`);
    const inpPro = document.getElementById(`trend-pro-${index}`);
    if (sPro) sPro.value = value;
    if (bPro) bPro.textContent = value;
    if (inpPro) inpPro.value = value;
  } else {
    const sWell = document.getElementById(`slider-well-${index}`);
    const bWell = document.getElementById(`badge-well-${index}`);
    const inpWell = document.getElementById(`trend-well-${index}`);
    if (sWell) sWell.value = value;
    if (bWell) bWell.textContent = value;
    if (inpWell) inpWell.value = value;
  }
}

function handleStudioPointDragEnd(datasetIndex, index, value) {
  handleStudioPointDrag(datasetIndex, index, value);
  const metric = datasetIndex === 0 ? 'Professional Impact' : 'Well-being';
  showToast(`Studio: set ${metric} point ${index + 1} to ${value}`);
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
    const sPro = document.getElementById(`slider-pro-${i}`);
    const sWell = document.getElementById(`slider-well-${i}`);
    const inpPro = document.getElementById(`trend-pro-${i}`);
    const inpWell = document.getElementById(`trend-well-${i}`);
    const bPro = document.getElementById(`badge-pro-${i}`);
    const bWell = document.getElementById(`badge-well-${i}`);

    if (sPro) sPro.value = selected.pro[i];
    if (sWell) sWell.value = selected.well[i];
    if (inpPro) inpPro.value = selected.pro[i];
    if (inpWell) inpWell.value = selected.well[i];
    if (bPro) bPro.textContent = selected.pro[i];
    if (bWell) bWell.textContent = selected.well[i];
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

  // Dynamic Forecast Summary
  const goalInputs = document.querySelectorAll('#forecastGoalsList .forecast-goal-input');
  const goals = Array.from(goalInputs).map(inp => inp.value.trim()).filter(v => v.length > 0);
  if (!currentData.forecast) currentData.forecast = {};
  currentData.forecast.summary = goals;
  const fNote = document.getElementById('edit-forecast-note');
  if (fNote) currentData.forecast.note = fNote.value.trim();

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
window.onTrendSliderChange = onTrendSliderChange;
window.addForecastGoalRow = addForecastGoalRow;
window.removeForecastGoalRow = removeForecastGoalRow;
window.onTrendRangeSelect = onTrendRangeSelect;
window.syncTrendRangeSelector = syncTrendRangeSelector;
window.handleChartPointDrag = handleChartPointDrag;
window.handleChartPointDragEnd = handleChartPointDragEnd;
window.handleStudioPointDrag = handleStudioPointDrag;
window.handleStudioPointDragEnd = handleStudioPointDragEnd;
