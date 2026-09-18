/* ==========================================================================
   UNIFIED EXECUTIVE DOSSIER & STRATEGIC EDITOR
   Consolidates quantitative metric controls and Quill.js rich narrative drafting
   into a single, high-stature dual-pane executive workspace.
   ========================================================================== */

(function(window) {
  'use strict';

  let activeModuleKey = 'a';
  let activeQuillEditor = null;
  let autoSaveTimer = null;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const MODULE_METADATA = {
    'a': {
      letter: 'A',
      title: 'Executive Profile & Command Record',
      subtitle: 'HIGHER EDUCATION FACULTY & MILITARY RESERVE EXECUTIVE',
      category: 'Leadership & Identity',
      icon: 'person'
    },
    'b': {
      letter: 'B',
      title: '5 Core Operational KPIs & Indices',
      subtitle: 'NORMALIZED LEARNING HOURS, IMPACT, INITIATIVES & READINESS',
      category: 'Operational Metrics',
      icon: 'insights'
    },
    'c': {
      letter: 'C',
      title: 'Authentic Longitudinal Trend Analysis',
      subtitle: 'ROLLING 6-MONTH PROFESSIONAL IMPACT VS WELL-BEING CORRELATION',
      category: 'Temporal Analytics',
      icon: 'stacked_line_chart'
    },
    'd': {
      letter: 'D',
      title: 'Diagnostic Insights & Behavioral Drivers',
      subtitle: 'EVIDENCE-BASED PEDAGOGICAL & READINESS DRIVERS',
      category: 'Qualitative Intelligence',
      icon: 'lightbulb'
    },
    'e': {
      letter: 'E',
      title: 'Root-Cause Anomaly Analysis',
      subtitle: 'WORKLOAD CONVERGENCE POST-MORTEM & PREVENTIVE SAFEGUARDS',
      category: 'Anomaly Forensics',
      icon: 'warning'
    },
    'f': {
      letter: 'F',
      title: 'Strategic Horizon & Transformational Inquiry',
      subtitle: 'INSTITUTIONAL SCALABILITY FRAMEWORK & CIVIC READINESS',
      category: 'Strategic Vision',
      icon: 'crisis_alert'
    },
    'g': {
      letter: 'G',
      title: '6-Month Statistical Forecast',
      subtitle: 'LINEAR REGRESSION TARGET TRAJECTORIES & MILESTONES',
      category: 'Predictive Modeling',
      icon: 'bolt'
    },
    'h': {
      letter: 'H',
      title: 'Data Governance & LMS Verification',
      subtitle: 'PROVENANCE INTEGRITY, PRIVACY PROTOCOLS & SECURITY COMPLIANCE',
      category: 'Governance & Ethics',
      icon: 'shield'
    },
    'i': {
      letter: 'I',
      title: 'Leadership Identity & Servant Creed',
      subtitle: 'ETHOS: EDUCATOR · SOLDIER · SERVANT LEADER',
      category: 'Executive Vision',
      icon: 'flag'
    }
  };

  const DEFAULT_FORECAST_HORIZONS = {
    '6m': {
      name: '6 Months',
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      values: [55, 62, 67, 72, 75, 82],
      badge: "H2: Oct '26–Mar '27",
      banner: "Forecast: Oct '26–Mar '27"
    },
    '1y': {
      name: '1 Year (12M)',
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      values: [55, 60, 64, 68, 72, 75, 78, 80, 83, 85, 88, 92],
      badge: "Annual: Oct '26–Sep '27",
      banner: "Annual Forecast: 12-Mo Cycle"
    },
    '8w': {
      name: '8 Weeks',
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
      values: [60, 63, 67, 70, 72, 76, 79, 84],
      badge: "8-Wk Sprint: W1–W8",
      banner: "Weekly Forecast: 8-Week Sprints"
    },
    'custom': {
      name: 'Custom',
      labels: ['Target 1', 'Target 2', 'Target 3', 'Target 4'],
      values: [65, 72, 80, 88],
      badge: "Custom Trajectory",
      banner: "Custom Trajectory Forecast"
    }
  };

  const DEFAULT_NARRATIVES = {
    'a': `<div class="doc-callout success"><strong>Servant Leadership Ethos:</strong> "I turn purpose into performance through data, discipline, and dedication."</div>
<p>Ma'am Jane integrates rigor from military training with empathetic academic mentoring. This personal dashboard acts as a continuous feedback loop between professional achievements and personal sustainability.</p>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Zero compromise on student learning outcomes</span></div>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:4px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Maintains high physical readiness score (87%+)</span></div>`,

    'b': `<div class="doc-callout info"><strong>Operational Efficiency Takeaway:</strong> Across 5 core indicators, student reach and continuous faculty learning demonstrate strong upward velocity (+12% to +15% MoM).</div>
<p>Standardized z-score weights prioritize direct student instructional mentorship while enforcing physical readiness standards required for military reserve deployment readiness.</p>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>High student retention supported through structured mentoring</span></div>`,

    'c': `<div class="doc-callout info"><strong>Executive Trend Takeaway:</strong> Sustained professional impact is maintained above the 60 index baseline. Well-being exhibits dynamic resilience with rapid recovery cycles following peak academic-military workload intersections.</div>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Rolling correlation index tracked across institutional quarters</span></div>`,

    'd': `<div class="doc-callout info"><strong>Qualitative Behavioral Driver:</strong> Balancing academic responsibilities and reserve military duties builds discipline, resilience, and purpose.</div>
<p>Continuous faculty professional development and physical readiness correlate directly with student satisfaction and institutional project delivery rates.</p>`,

    'e': `<div class="doc-callout warning"><strong>Incident Post-Mortem:</strong> Academic mid-term grading and thesis committee reviews overlapped simultaneously with mandatory battalion field exercises.</div>
<h5>Preventive Safeguards Instituted:</h5>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:6px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Automated grading rubrics deployed via LMS, saving 18 hrs/week during finals.</span></div>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:4px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Protected 7.5 hours minimum nightly sleep window before military field exercises.</span></div>`,

    'f': `<div class="doc-callout primary"><strong>Strategic Vision:</strong> Scaling educational impact and community disaster preparedness requires institutional partnerships and data-driven resource allocation.</div>
<p>Focus next semester on cross-departmental civic action initiatives, GIS hazard mapping research, and automated grading systems.</p>`,

    'g': `<div class="doc-callout dark"><strong>Predictive Modeling Methodology:</strong> Linear regression trajectory indicates potential 15–20% student impact expansion in H2 assuming maintained learning hours and recovery discipline.</div>
<div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;"><span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span> <span>Quarterly review milestones aligned with academic semester deliverables</span></div>`,

    'h': `<div class="doc-callout success"><strong>Data Ethics Protocol:</strong> Multi-source data provenance is strictly maintained with encrypted local storage and opt-in consent for all personal tracking metrics.</div>
<p>Institutional reviews conform to military security protocols and university ethical committee mandates.</p>`,

    'i': `<div class="doc-callout dark"><strong>Executive Identity Manifesto:</strong> "Driven by values. Guided by data. Committed to impact."</div>
<p>Servant leadership bridges civilian higher education with national defense service, creating an enduring standard of integrity and community capability.</p>`
  };

  function getDataStore() {
    const STORAGE_KEY = 'human_bi_dashboard_state_v5';
    let store = window.dashboardData;
    if (!store) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { store = JSON.parse(saved); } catch(e) {}
      }
    }
    if (!store) store = {};
    window.dashboardData = store;
    return store;
  }

  function getModuleNarrative(key) {
    const store = getDataStore();
    if (store.narratives && store.narratives[key]) {
      return store.narratives[key];
    }
    const local = localStorage.getItem(`card_detail_narrative_${key}`);
    if (local) return local;
    return DEFAULT_NARRATIVES[key] || '<p>Enter extended strategic analysis and executive notes...</p>';
  }

  /* ==========================================================================
     OPEN / CLOSE / SWITCH UNIFIED EDITOR
     ========================================================================== */
  function openUnifiedEditor(moduleKey) {
    if (typeof moduleKey !== 'string' || !MODULE_METADATA[moduleKey.toLowerCase()]) {
      // Map legacy tab keys if passed
      const map = {
        'profile': 'a',
        'kpis': 'b',
        'trends': 'c',
        'insights': 'd',
        'anomaly': 'e',
        'forecast': 'g',
        'backup': 'h',
        'identity': 'i'
      };
      moduleKey = map[moduleKey] || 'a';
    }
    activeModuleKey = moduleKey.toLowerCase();

    let modal = document.getElementById('unifiedEditorModal');
    if (!modal) {
      modal = createModalElement();
      document.body.appendChild(modal);
    }

    renderNavStrip();
    renderModuleStage(activeModuleKey);

    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeUnifiedEditor() {
    const modal = document.getElementById('unifiedEditorModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

  function createModalElement() {
    const modal = document.createElement('div');
    modal.id = 'unifiedEditorModal';
    modal.className = 'unified-editor-backdrop';
    modal.innerHTML = `
      <div class="unified-editor-window" role="dialog" aria-modal="true">
        <!-- Top Command Bar -->
        <div class="unified-editor-header">
          <div class="unified-header-left">
            <span class="module-code-pill" id="unifiedModulePill">MODULE [A]</span>
            <div>
              <h3 id="unifiedModuleTitle">Executive Profile & Command Record</h3>
              <p id="unifiedModuleSubtitle">HIGHER EDUCATION FACULTY & MILITARY RESERVE EXECUTIVE</p>
            </div>
          </div>
          <div class="unified-header-actions">
            <button type="button" class="btn-unified-close" onclick="closeUnifiedEditor()" title="Close Editor">&times;</button>
          </div>
        </div>

        <!-- Horizontal Module Rail -->
        <div class="unified-nav-strip" id="unifiedNavStrip"></div>

        <!-- Dual-Pane Stage -->
        <div class="unified-dual-stage">
          <!-- Left Pane: Data & Metric Controls -->
          <div class="unified-data-pane" id="unifiedDataPane"></div>

          <!-- Right Pane: WYSIWYG Strategic Narrative -->
          <div class="unified-narrative-pane">
            <div class="narrative-pane-header">
              <div class="narrative-header-title">
                <span class="material-symbols-rounded">article</span>
                <h4>Extended Strategic Analysis & Narrative</h4>
              </div>
              <span class="narrative-help-text">Quill.js Rich Executive Briefing Canvas</span>
            </div>
            <div id="unifiedQuillContainer" class="unified-quill-container"></div>
          </div>
        </div>

        <!-- Footer Actions Bar -->
        <div class="unified-editor-footer">
          <div class="footer-left">
            <button type="button" class="btn-unified-reset" onclick="resetCurrentModuleDefaults()">
              <span class="material-symbols-rounded">restart_alt</span> Reset Module to Baseline
            </button>
            <span class="footer-sync-note">Changes persist instantly to browser storage.</span>
          </div>
          <div class="footer-right">
            <button type="button" class="btn-unified-cancel" onclick="closeUnifiedEditor()">Close</button>
            <button type="button" class="btn-unified-save" onclick="saveAndCloseUnifiedEditor()">
              <span class="material-symbols-rounded">check</span> Save & Apply to Canvas
            </button>
          </div>
        </div>
      </div>
    `;

    // Close on backdrop click (outside window)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeUnifiedEditor();
      }
    });

    return modal;
  }

  function renderNavStrip() {
    const strip = document.getElementById('unifiedNavStrip');
    if (!strip) return;

    strip.innerHTML = Object.keys(MODULE_METADATA).map(key => {
      const meta = MODULE_METADATA[key];
      const isActive = key === activeModuleKey;
      return `
        <button type="button" class="unified-nav-btn ${isActive ? 'active' : ''}" data-module="${key}" onclick="switchUnifiedModule('${key}')">
          <span class="nav-btn-badge">[${meta.letter}]</span>
          <span class="nav-btn-label">${meta.category}</span>
        </button>
      `;
    }).join('');
  }

  function switchUnifiedModule(key) {
    // Save current active module first
    saveActiveModuleData(false);
    activeModuleKey = key.toLowerCase();
    renderNavStrip();
    renderModuleStage(activeModuleKey);
  }

  /* ==========================================================================
     RENDER DUAL-PANE MODULE STAGE
     ========================================================================== */
  function renderModuleStage(key) {
    const meta = MODULE_METADATA[key] || MODULE_METADATA['a'];
    const pill = document.getElementById('unifiedModulePill');
    const title = document.getElementById('unifiedModuleTitle');
    const sub = document.getElementById('unifiedModuleSubtitle');

    if (pill) pill.textContent = `MODULE [${meta.letter}]`;
    if (title) title.textContent = meta.title;
    if (sub) sub.textContent = meta.subtitle;

    const dataPane = document.getElementById('unifiedDataPane');
    const store = getDataStore();

    if (dataPane) {
      dataPane.innerHTML = buildDataPaneHtml(key, store);
      bindDataPaneEvents(key, store);
    }

    // Initialize Quill Editor on the Right Pane
    initQuillForModule(key);
  }

  function renderModuleDataPaneOnly(key, store) {
    const dataPane = document.getElementById('unifiedDataPane');
    if (dataPane) {
      dataPane.innerHTML = buildDataPaneHtml(key, store);
      bindDataPaneEvents(key, store);
    }
  }

  function syncAnomaliesFromDOM(store) {
    const items = document.querySelectorAll('.ue-anomaly-item');
    if (!items || !items.length) {
      if (document.getElementById('ueAnomalyList')) {
        store.anomalies = [];
        store.anomaly = null;
      }
      return;
    }
    const updated = [];
    items.forEach((item, idx) => {
      const badge = item.querySelector('.ue-ano-badge')?.value?.trim() || `Anomaly ${idx + 1}`;
      const color = item.querySelector('.ue-ano-color')?.value || 'amber';
      const icon = item.querySelector('.ue-ano-icon')?.value || 'warning';
      const title = item.querySelector('.ue-ano-title')?.value?.trim() || '';
      const reason = item.querySelector('.ue-ano-reason')?.value?.trim() || '';
      const action = item.querySelector('.ue-ano-action')?.value?.trim() || '';
      const existingId = store.anomalies?.[idx]?.id || ('ano-' + Date.now() + '-' + idx);
      updated.push({
        id: existingId,
        badge,
        color,
        icon,
        title,
        reason,
        action
      });
    });
    store.anomalies = updated;
    if (updated.length > 0) {
      store.anomaly = {
        badge: updated[0].badge,
        color: updated[0].color,
        icon: updated[0].icon,
        title: updated[0].title,
        observation: updated[0].title,
        reason: updated[0].reason,
        possibleReason: updated[0].reason,
        action: updated[0].action
      };
    } else {
      store.anomaly = null;
    }
  }

  function initQuillForModule(key) {
    const container = document.getElementById('unifiedQuillContainer');
    if (!container) return;

    if (activeQuillEditor) {
      activeQuillEditor.destroy();
      activeQuillEditor = null;
    }

    const narrativeHtml = getModuleNarrative(key);

    if (window.ExecutiveDocEditor) {
      activeQuillEditor = new window.ExecutiveDocEditor(container, narrativeHtml, {
        onChange: (newHtml) => {
          saveActiveModuleNarrative(newHtml, false);
        }
      });
    }
  }

  /* ==========================================================================
     DATA PANE HTML BUILDERS (PER MODULE A-I)
     ========================================================================== */
  function buildDataPaneHtml(key, store) {
    if (key === 'a') {
      const prof = store.profile || {};
      const avatarSrc = prof.avatar || 'assets/mary_jane.jpg';
      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">account_circle</span>
            <span>Official Portrait & Visual Identity</span>
          </div>
          <div class="avatar-edit-box">
            <img src="${avatarSrc}" id="ueAvatarPreview" class="ue-avatar-img" alt="Official Portrait" onerror="this.src='assets/img/default-avatar.svg'">
            <div class="avatar-actions">
              <input type="file" id="ueAvatarFile" accept="image/*" style="display:none;">
              <button type="button" class="btn-ue-action" onclick="document.getElementById('ueAvatarFile').click()">
                <span class="material-symbols-rounded">upload</span> Choose Photo
              </button>
              <button type="button" class="btn-ue-action outline" id="btnUeResetPhoto">
                <span class="material-symbols-rounded">refresh</span> Reset
              </button>
            </div>
          </div>
        </div>

        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">badge</span>
            <span>Command & Institutional Credentials</span>
          </div>
          <div class="ue-field">
            <label>Full Executive Name</label>
            <input type="text" id="ue-prof-name" class="ue-input" value="${prof.name || 'Mary Jane Sapiendante Legaspi'}">
          </div>
          <div class="ue-field-row">
            <div class="ue-field">
              <label>Display Nickname</label>
              <input type="text" id="ue-prof-nick" class="ue-input" value="${prof.nickname || 'Mary Jane'}">
            </div>
            <div class="ue-field">
              <label>Tenure / Experience</label>
              <input type="text" id="ue-prof-tenure" class="ue-input" value="${prof.tenure || '12+ Years'}">
            </div>
          </div>
          <div class="ue-field">
            <label>Institutional & Military Role</label>
            <input type="text" id="ue-prof-role" class="ue-input" value="${prof.role || 'Higher Education Faculty Member & Reserve Military Officer'}">
          </div>
          <div class="ue-field">
            <label>Reserve Military Branch</label>
            <input type="text" id="ue-prof-branch" class="ue-input" value="${prof.branch || 'Philippine Army Reserve Command (ARESCOM)'}">
          </div>
        </div>
      `;
    }

    if (key === 'b') {
      const kpis = store.kpis || [
        { id: 'kpi-learning-hours', label: 'Continuous Faculty Learning', value: '142', unit: 'hrs / sem', change: '+12%', changeDirection: 'up' },
        { id: 'kpi-student-reach', label: 'Student Mentorship Reach', value: '268', unit: 'students', change: '+15%', changeDirection: 'up' },
        { id: 'kpi-initiatives', label: 'Active Institutional Projects', value: '12', unit: 'projects', change: '+8%', changeDirection: 'up' },
        { id: 'kpi-readiness', label: 'Physical Readiness Score', value: '88', unit: '%', change: '-2%', changeDirection: 'down' },
        { id: 'kpi-governance', label: 'Data Governance Index', value: '94', unit: '/ 100', change: '+4%', changeDirection: 'up' }
      ];

      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">speed</span>
            <span>Core Performance Indicators</span>
          </div>
          <div class="kpi-controls-list">
            ${kpis.map(k => `
              <div class="kpi-edit-card" data-kpi-id="${k.id}">
                <div class="kpi-edit-header">
                  <span class="kpi-edit-label">${k.label}</span>
                  <span class="kpi-edit-unit">${k.unit || ''}</span>
                </div>
                <div class="kpi-edit-inputs">
                  <div class="ue-field" style="flex:1;">
                    <label>Metric Value</label>
                    <input type="text" class="ue-input kpi-input-val" value="${k.value}">
                  </div>
                  <div class="ue-field" style="width:75px;">
                    <label>Delta</label>
                    <input type="text" class="ue-input kpi-input-change" value="${k.change}">
                  </div>
                  <div class="ue-field" style="width:65px;">
                    <label>Trend</label>
                    <select class="ue-select kpi-select-dir">
                      <option value="up" ${k.changeDirection !== 'down' ? 'selected' : ''}>↑ Up</option>
                      <option value="down" ${k.changeDirection === 'down' ? 'selected' : ''}>↓ Down</option>
                    </select>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (key === 'c') {
      const trend = store.trend || {};
      const labels = trend.labels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
      const pro = trend.datasets?.professionalImpact || [56, 61, 66, 80, 71, 86];
      const well = trend.datasets?.personalWellbeing || [69, 58, 54, 68, 55, 75];
      const curRange = trend.activeRange || 'last-6';

      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">history</span>
            <span>Historical Horizon / Timeframe Preset</span>
          </div>
          <div class="fc-horizon-selector" id="trendHorizonSelector" style="margin-bottom: 14px;">
            <button type="button" class="fc-horizon-btn ${(curRange === 'last-6') ? 'active' : ''}" data-trend-range="last-6">Rolling 6M</button>
            <button type="button" class="fc-horizon-btn ${curRange === 'last-3' ? 'active' : ''}" data-trend-range="last-3">Recent Q3</button>
            <button type="button" class="fc-horizon-btn ${curRange === 'q1' ? 'active' : ''}" data-trend-range="q1">Baseline Q2</button>
            <button type="button" class="fc-horizon-btn ${curRange === 'prior-6' ? 'active' : ''}" data-trend-range="prior-6">Prior 6M</button>
            <button type="button" class="fc-horizon-btn ${curRange === 'full-year' ? 'active' : ''}" data-trend-range="full-year">12-Mo Annual</button>
            <button type="button" class="fc-horizon-btn ${curRange === 'custom' ? 'active' : ''}" data-trend-range="custom">Custom</button>
          </div>
        </div>

        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">tune</span>
            <span>Monthly Impact & Well-being Scores (0–100)</span>
          </div>
          <div class="trend-inputs-table" id="trendCrudTable">
            <div class="trend-table-header">
              <span>Period</span>
              <span>Prof. Impact</span>
              <span>Well-being</span>
              <span></span>
            </div>
            ${labels.map((lbl, idx) => `
              <div class="trend-table-row" data-idx="${idx}">
                <input type="text" class="ue-input trend-month-input" data-idx="${idx}" value="${lbl}" placeholder="e.g. Oct" title="Period / Month label">
                <input type="number" min="0" max="100" class="ue-input trend-pro-input" data-idx="${idx}" value="${pro[idx] ?? 50}" title="Professional Impact (0–100)">
                <input type="number" min="0" max="100" class="ue-input trend-well-input" data-idx="${idx}" value="${well[idx] ?? 50}" title="Personal Well-being (0–100)">
                <button type="button" class="btn-trend-delete-row" data-idx="${idx}" title="Delete period" aria-label="Delete period">&times;</button>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn-ue-action" id="btnTrendAddRow">
              <span class="material-symbols-rounded">add</span> Add Period / Month
            </button>
            <span style="font-size: 10.5px; color: #64748B;">Live synced to chart</span>
          </div>
        </div>
      `;
    }

    if (key === 'd') {
      const insights = store.insights || [
        "Consistent positive trend across personal and professional pillars, driven by disciplined military and academic routines.",
        "Balancing academic responsibilities with military training builds discipline, focus, resilience, and a deep sense of purpose.",
        "Student success is directly linked to faculty professional development and physical readiness."
      ];
      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">lightbulb</span>
            <span>Key Qualitative Behavioral Statements</span>
          </div>
          <div class="ue-field">
            <label>Insight #1 (Operational Velocity)</label>
            <textarea id="ue-insight-0" class="ue-textarea" rows="3">${insights[0] || ''}</textarea>
          </div>
          <div class="ue-field">
            <label>Insight #2 (Resilience Equilibrium)</label>
            <textarea id="ue-insight-1" class="ue-textarea" rows="3">${insights[1] || ''}</textarea>
          </div>
          <div class="ue-field">
            <label>Insight #3 (Mentorship Correlation)</label>
            <textarea id="ue-insight-2" class="ue-textarea" rows="3">${insights[2] || ''}</textarea>
          </div>
        </div>
      `;
    }

    if (key === 'e') {
      if (!store.anomalies || !Array.isArray(store.anomalies)) {
        if (store.anomaly && (store.anomaly.badge || store.anomaly.title)) {
          store.anomalies = [{
            id: 'ano-1',
            badge: store.anomaly.badge || 'April Workload Convergence',
            title: store.anomaly.title || store.anomaly.observation || 'April peak in Professional Impact (80) diverged sharply from Personal Well-being (68).',
            reason: store.anomaly.reason || store.anomaly.possibleReason || 'Confluence of academic final evaluations, thesis panels, and unscheduled military reserve brigade mobilization exercises.',
            action: store.anomaly.action || 'Instituted digital rubric automation via LMS to preserve a non-negotiable 7.5-hour recovery window during peak deployment periods.'
          }];
        } else {
          store.anomalies = [{
            id: 'ano-1',
            badge: 'April Workload Convergence',
            title: 'April peak in Professional Impact (80) diverged sharply from Personal Well-being (68).',
            reason: 'Confluence of academic final evaluations, thesis panels, and unscheduled military reserve brigade mobilization exercises.',
            action: 'Instituted digital rubric automation via LMS to preserve a non-negotiable 7.5-hour recovery window during peak deployment periods.'
          }];
        }
      }

      const itemsHtml = store.anomalies.map((ano, idx) => {
        const color = ano.color || 'amber';
        const icon = ano.icon || 'warning';
        return `
        <div class="ue-anomaly-item" data-ano-idx="${idx}">
          <div class="ue-anomaly-item-header">
            <div class="ue-anomaly-header-left">
              <span class="anomaly-badge-pill pill-${color}" id="ue-preview-pill-${idx}" style="font-size:10px; padding:2px 8px;">
                <span class="material-symbols-rounded preview-icon" style="font-size:12px; line-height:1;">${escapeHtml(icon)}</span>
                <span class="preview-text">${escapeHtml(ano.badge || `Anomaly ${idx + 1}`)}</span>
              </span>
            </div>
            <button type="button" class="btn-ue-anomaly-del" data-delete-idx="${idx}" title="Delete anomaly record">
              <span class="material-symbols-rounded" style="font-size:14px;">delete</span> Delete
            </button>
          </div>
          
          <div class="ue-field" style="margin-top: 8px;">
            <label>Badge Header Label</label>
            <input type="text" class="ue-input ue-ano-badge" data-ano-idx="${idx}" value="${escapeHtml(ano.badge || '')}" placeholder="e.g. April Workload Convergence">
          </div>

          <div class="ue-field-row">
            <div class="ue-field">
              <label>Pill Accent Color</label>
              <select class="ue-select ue-ano-color" data-ano-idx="${idx}">
                <option value="amber" ${color === 'amber' ? 'selected' : ''}>Amber (Warning / Anomaly)</option>
                <option value="emerald" ${color === 'emerald' ? 'selected' : ''}>Emerald (Success / Equilibrium)</option>
                <option value="brass" ${color === 'brass' ? 'selected' : ''}>Antique Brass (Executive)</option>
                <option value="navy" ${color === 'navy' ? 'selected' : ''}>Midnight Navy (Command)</option>
                <option value="crimson" ${color === 'crimson' ? 'selected' : ''}>Crimson (Critical Alert)</option>
                <option value="violet" ${color === 'violet' ? 'selected' : ''}>Violet (Strategic Horizon)</option>
              </select>
            </div>
            <div class="ue-field">
              <label>Pill Icon Symbol</label>
              <select class="ue-select ue-ano-icon" data-ano-idx="${idx}">
                <option value="warning" ${icon === 'warning' ? 'selected' : ''}>⚠️ warning (Warning / Alert)</option>
                <option value="verified" ${icon === 'verified' ? 'selected' : ''}>✓ verified (Milestone / Quality)</option>
                <option value="star" ${icon === 'star' ? 'selected' : ''}>★ star (Key Highlight)</option>
                <option value="bolt" ${icon === 'bolt' ? 'selected' : ''}>⚡ bolt (High Velocity)</option>
                <option value="flag" ${icon === 'flag' ? 'selected' : ''}>⚑ flag (Strategic Directive)</option>
                <option value="lightbulb" ${icon === 'lightbulb' ? 'selected' : ''}>💡 lightbulb (Diagnostic Insight)</option>
                <option value="trending_up" ${icon === 'trending_up' ? 'selected' : ''}>📈 trending_up (Growth Pacing)</option>
                <option value="shield" ${icon === 'shield' ? 'selected' : ''}>🛡 shield (Governance & Security)</option>
                <option value="crisis_alert" ${icon === 'crisis_alert' ? 'selected' : ''}>🚨 crisis_alert (High Risk)</option>
                <option value="school" ${icon === 'school' ? 'selected' : ''}>🎓 school (Pedagogical)</option>
              </select>
            </div>
          </div>

          <div class="ue-field">
            <label>Anomaly Headline / Metric Divergence</label>
            <input type="text" class="ue-input ue-ano-title" data-ano-idx="${idx}" value="${escapeHtml(ano.title || '')}" placeholder="e.g. April peak in Professional Impact (80) diverged sharply from Personal Well-being (68).">
          </div>
          <div class="ue-field">
            <label>Diagnostic Root Cause</label>
            <textarea class="ue-textarea ue-ano-reason" data-ano-idx="${idx}" rows="2" placeholder="Describe root cause...">${escapeHtml(ano.reason || ano.possibleReason || '')}</textarea>
          </div>
          <div class="ue-field">
            <label>Prescriptive Corrective Action</label>
            <textarea class="ue-textarea ue-ano-action" data-ano-idx="${idx}" rows="2" placeholder="Describe corrective action...">${escapeHtml(ano.action || '')}</textarea>
          </div>
        </div>
        `;
      }).join('');

      return `
        <div class="data-group">
          <div class="data-group-title" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="material-symbols-rounded">warning</span>
              <span>Root-Cause Anomaly Forensics (${store.anomalies.length})</span>
            </div>
            <button type="button" class="btn-ue-action" id="btnAnomalyAddRecord">
              <span class="material-symbols-rounded">add</span> Add Anomaly
            </button>
          </div>
          <div class="ue-anomaly-list" id="ueAnomalyList">
            ${store.anomalies.length ? itemsHtml : '<div class="ue-callout-hint" style="text-align:center; padding:16px;">No anomalies recorded. Click "+ Add Anomaly" above to create one.</div>'}
          </div>
        </div>
      `;
    }

    if (key === 'f') {
      const q = typeof store.strategicQuestion === 'string'
        ? store.strategicQuestion
        : (store.strategicQuestion?.question || "How can data-driven approaches be systematically applied to optimize both educational outcomes and civic defense preparedness?");
      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">crisis_alert</span>
            <span>Transformational Inquiry Directive</span>
          </div>
          <div class="ue-field">
            <label>Strategic Question (Core Institutional Focus)</label>
            <textarea id="ue-strategic-q" class="ue-textarea" rows="4">${q}</textarea>
          </div>
          <div class="ue-callout-hint">
            This strategic question shapes the leadership vision displayed in Module [F] and provides institutional alignment for committee presentations.
          </div>
        </div>
      `;
    }

    if (key === 'g') {
      if (!store.forecastHorizonMode) store.forecastHorizonMode = '6m';
      if (!store.forecastByMode) {
        store.forecastByMode = JSON.parse(JSON.stringify(DEFAULT_FORECAST_HORIZONS));
      }
      const mode = store.forecastHorizonMode;
      const fc = store.forecast || {};
      const labels = fc.labels || store.forecastByMode[mode]?.labels || DEFAULT_FORECAST_HORIZONS[mode].labels;
      const vals = fc.values || store.forecastByMode[mode]?.values || DEFAULT_FORECAST_HORIZONS[mode].values;
      const summary = fc.summary || [
        "Expected 15–20% increase in student mentorship reach",
        "Target: Complete 2 research publications in GIS education",
        "Maintain physical readiness score above 85% through structured routines"
      ];

      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">date_range</span>
            <span>Forecast Horizon & Timeframe Format</span>
          </div>
          <div class="fc-horizon-selector" id="fcHorizonSelector">
            <button type="button" class="fc-horizon-btn ${mode === '6m' ? 'active' : ''}" data-mode="6m">6 Months</button>
            <button type="button" class="fc-horizon-btn ${mode === '1y' ? 'active' : ''}" data-mode="1y">1 Year (12M)</button>
            <button type="button" class="fc-horizon-btn ${mode === '8w' ? 'active' : ''}" data-mode="8w">8 Weeks</button>
            <button type="button" class="fc-horizon-btn ${mode === 'custom' ? 'active' : ''}" data-mode="custom">Custom</button>
          </div>

          <div class="data-group-title" style="margin-top:10px;">
            <span class="material-symbols-rounded">query_stats</span>
            <span>Target Trajectory per Interval (0–100)</span>
          </div>
          <div class="forecast-inputs-grid" id="fcInputsGrid">
            ${labels.map((lbl, idx) => `
              <div class="fc-input-card" data-idx="${idx}">
                <div class="fc-card-top">
                  <input type="text" class="fc-month-input" data-idx="${idx}" value="${lbl}" title="Interval Label" placeholder="Label">
                  <button type="button" class="btn-fc-delete-row" data-idx="${idx}" title="Delete this interval" aria-label="Delete interval">&times;</button>
                </div>
                <input type="number" min="0" max="100" class="ue-input fc-val-input" data-idx="${idx}" value="${vals[idx] ?? 50}" title="Target value (0–100)">
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn-ue-action" id="btnFcAddInterval">
              <span class="material-symbols-rounded">add</span> Add Target Interval
            </button>
            <span style="font-size: 10.5px; color: #64748B;">Live synced to forecast chart</span>
          </div>

          <div class="data-group-title" style="margin-top:16px;">
            <span class="material-symbols-rounded">task_alt</span>
            <span>Milestone Directives</span>
          </div>
          <div class="ue-field">
            <label>Milestone 1</label>
            <input type="text" id="ue-fc-goal-0" class="ue-input" value="${summary[0] || ''}">
          </div>
          <div class="ue-field">
            <label>Milestone 2</label>
            <input type="text" id="ue-fc-goal-1" class="ue-input" value="${summary[1] || ''}">
          </div>
          <div class="ue-field">
            <label>Milestone 3</label>
            <input type="text" id="ue-fc-goal-2" class="ue-input" value="${summary[2] || ''}">
          </div>
        </div>
      `;
    }

    if (key === 'h') {
      const gov = store.governance || {};
      const pts = gov.points || [
        "Multi-source data provenance is strictly maintained with encrypted local storage.",
        "Personal metrics require explicit opt-in consent before inclusion in institutional reports.",
        "Military readiness ratings are verified by unit command records under ARESCOM standards."
      ];
      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">shield</span>
            <span>Governance & Provenance Principles</span>
          </div>
          <div class="ue-field">
            <label>Principle #1 (Data Provenance)</label>
            <textarea id="ue-gov-0" class="ue-textarea" rows="2">${pts[0] || ''}</textarea>
          </div>
          <div class="ue-field">
            <label>Principle #2 (Privacy & Ethics)</label>
            <textarea id="ue-gov-1" class="ue-textarea" rows="2">${pts[1] || ''}</textarea>
          </div>
          <div class="ue-field">
            <label>Principle #3 (Command Standards)</label>
            <textarea id="ue-gov-2" class="ue-textarea" rows="2">${pts[2] || ''}</textarea>
          </div>
        </div>
      `;
    }

    if (key === 'i') {
      const iden = store.identity || {
        quote: "Driven by values. Guided by data. Committed to impact.",
        motto: "Educator · Soldier · Servant Leader",
        subtext: "Higher Education Faculty & Military Reserve Executive"
      };
      return `
        <div class="data-group">
          <div class="data-group-title">
            <span class="material-symbols-rounded">flag</span>
            <span>Leadership Creed & Identity</span>
          </div>
          <div class="ue-field">
            <label>Personal Quote / Motto</label>
            <textarea id="ue-id-quote" class="ue-textarea" rows="2">${iden.quote || ''}</textarea>
          </div>
          <div class="ue-field">
            <label>Leadership Titles (Header Tag)</label>
            <input type="text" id="ue-id-motto" class="ue-input" value="${iden.motto || iden.title || ''}">
          </div>
          <div class="ue-field">
            <label>Core Creed / Subtext</label>
            <input type="text" id="ue-id-subtext" class="ue-input" value="${iden.subtext || iden.subtitle || ''}">
          </div>
        </div>
      `;
    }

    return '';
  }

  /* ==========================================================================
     DATA PANE EVENT BINDING & LIVE SYNC
     ========================================================================== */
  function bindDataPaneEvents(key, store) {
    const dataPane = document.getElementById('unifiedDataPane');
    if (!dataPane) return;

    // Continuous auto-save on any change in data pane
    dataPane.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => {
        triggerAutoSaveDebounce();
      });
      el.addEventListener('change', () => {
        triggerAutoSaveDebounce();
      });
    });

    // Special handler for Avatar Photo Upload
    if (key === 'a') {
      const fileInput = document.getElementById('ueAvatarFile');
      const resetBtn = document.getElementById('btnUeResetPhoto');
      const previewImg = document.getElementById('ueAvatarPreview');

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            if (!store.profile) store.profile = {};
            store.profile.avatar = dataUrl;
            if (previewImg) previewImg.src = dataUrl;
            const dashAvatar = document.getElementById('profileAvatar');
            if (dashAvatar) dashAvatar.src = dataUrl;
            saveActiveModuleData(false);
          };
          reader.readAsDataURL(file);
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const defaultAvatar = 'assets/mary_jane.jpg';
          if (!store.profile) store.profile = {};
          store.profile.avatar = defaultAvatar;
          if (previewImg) previewImg.src = defaultAvatar;
          const dashAvatar = document.getElementById('profileAvatar');
          if (dashAvatar) dashAvatar.src = defaultAvatar;
          saveActiveModuleData(false);
        });
      }
    }

    // Special handler for Module C (Longitudinal Trend Presets & CRUD)
    if (key === 'c') {
      // Horizon Preset buttons
      dataPane.querySelectorAll('#trendHorizonSelector .fc-horizon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rangeKey = btn.dataset.trendRange;
          if (!rangeKey) return;
          if (rangeKey === 'custom') {
            store.trend.activeRange = 'custom';
            renderModuleStage('c');
            if (typeof syncTrendRangeSelector === 'function') syncTrendRangeSelector();
            return;
          }

          const pool = store.longitudinalPool || (window.dashboardData && window.dashboardData.longitudinalPool);
          if (pool && pool.ranges && pool.ranges[rangeKey]) {
            const rConfig = pool.ranges[rangeKey];
            const indices = rConfig.indices;
            if (!store.trend) store.trend = {};
            store.trend.labels = indices.map(i => pool.labels[i]);
            store.trend.datasets = {
              professionalImpact: indices.map(i => pool.datasets.professionalImpact[i]),
              personalWellbeing: indices.map(i => pool.datasets.personalWellbeing[i])
            };
            store.trend.activeRange = rangeKey;
            store.trend.period = `Period: ${rConfig.label}`;

            renderModuleStage('c');
            saveActiveModuleData(false);
            if (window.updateCharts) window.updateCharts(store);
            if (typeof syncTrendRangeSelector === 'function') syncTrendRangeSelector();
            if (typeof window.showToast === 'function') {
              window.showToast(`Switched trend horizon to ${rConfig.label}`);
            }
          }
        });
      });

      // When editing inputs directly, transition to Custom
      dataPane.querySelectorAll('.trend-month-input, .trend-pro-input, .trend-well-input').forEach(inp => {
        inp.addEventListener('input', () => {
          if (store.trend) store.trend.activeRange = 'custom';
          dataPane.querySelectorAll('#trendHorizonSelector .fc-horizon-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.trendRange === 'custom');
          });
          if (typeof syncTrendRangeSelector === 'function') syncTrendRangeSelector();
        });
      });

      const btnAdd = document.getElementById('btnTrendAddRow');
      if (btnAdd) {
        btnAdd.addEventListener('click', () => {
          if (!store.trend) store.trend = { datasets: {} };
          if (!store.trend.labels) store.trend.labels = [];
          if (!store.trend.datasets) store.trend.datasets = {};
          if (!store.trend.datasets.professionalImpact) store.trend.datasets.professionalImpact = [];
          if (!store.trend.datasets.personalWellbeing) store.trend.datasets.personalWellbeing = [];

          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const lastLabel = store.trend.labels[store.trend.labels.length - 1] || '';
          let nextLabel = `P${store.trend.labels.length + 1}`;
          const mIdx = months.findIndex(m => m.toLowerCase() === lastLabel.slice(0, 3).toLowerCase());
          if (mIdx >= 0) {
            nextLabel = months[(mIdx + 1) % 12];
          }

          store.trend.labels.push(nextLabel);
          store.trend.datasets.professionalImpact.push(75);
          store.trend.datasets.personalWellbeing.push(70);
          store.trend.activeRange = 'custom';

          renderModuleStage('c');
          saveActiveModuleData(false);
          if (window.updateCharts) window.updateCharts(store);
          if (typeof syncTrendRangeSelector === 'function') syncTrendRangeSelector();
          if (typeof window.showToast === 'function') {
            window.showToast(`Added period ${nextLabel} to trend dataset.`);
          }
        });
      }

      dataPane.querySelectorAll('.btn-trend-delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          if (isNaN(idx)) return;
          if (store.trend?.labels?.length <= 2) {
            if (typeof window.showToast === 'function') {
              window.showToast('Minimum 2 periods required for trend analysis.');
            }
            return;
          }
          const removed = store.trend.labels.splice(idx, 1)[0];
          store.trend.datasets.professionalImpact.splice(idx, 1);
          store.trend.datasets.personalWellbeing.splice(idx, 1);
          store.trend.activeRange = 'custom';

          renderModuleStage('c');
          saveActiveModuleData(false);
          if (window.updateCharts) window.updateCharts(store);
          if (typeof syncTrendRangeSelector === 'function') syncTrendRangeSelector();
          if (typeof window.showToast === 'function') {
            window.showToast(`Removed period ${removed}.`);
          }
        });
      });
    }

    // Special handler for Module G (Forecast Horizons & Intervals)
    if (key === 'g') {
      dataPane.querySelectorAll('.fc-horizon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetMode = btn.dataset.mode;
          if (!targetMode) return;

          // Save current inputs into active mode
          const currentMode = store.forecastHorizonMode || '6m';
          if (!store.forecastByMode) store.forecastByMode = JSON.parse(JSON.stringify(DEFAULT_FORECAST_HORIZONS));
          store.forecastByMode[currentMode] = {
            labels: [...(store.forecast.labels || [])],
            values: [...(store.forecast.values || [])]
          };

          // Switch mode
          store.forecastHorizonMode = targetMode;
          const targetData = store.forecastByMode[targetMode] || DEFAULT_FORECAST_HORIZONS[targetMode];
          store.forecast.labels = [...targetData.labels];
          store.forecast.values = [...targetData.values];

          // Update tags on card & banner
          const meta = DEFAULT_FORECAST_HORIZONS[targetMode];
          const fcBannerTag = document.getElementById('forecastHorizonBadge');
          const fcCardTag = document.getElementById('forecastPeriodTag');
          if (fcBannerTag && meta?.banner) fcBannerTag.textContent = meta.banner;
          if (fcCardTag && meta?.badge) fcCardTag.textContent = meta.badge;

          renderModuleStage('g');
          saveActiveModuleData(false);
          if (window.updateCharts) window.updateCharts(store);
          if (typeof window.showToast === 'function') {
            window.showToast(`Switched forecast horizon to ${meta?.name || targetMode}`);
          }
        });
      });

      const btnAddInterval = document.getElementById('btnFcAddInterval');
      if (btnAddInterval) {
        btnAddInterval.addEventListener('click', () => {
          if (!store.forecast) store.forecast = {};
          if (!store.forecast.labels) store.forecast.labels = [];
          if (!store.forecast.values) store.forecast.values = [];

          const count = store.forecast.labels.length;
          const nextLabel = `Int ${count + 1}`;
          store.forecast.labels.push(nextLabel);
          store.forecast.values.push(75);

          renderModuleStage('g');
          saveActiveModuleData(false);
          if (window.updateCharts) window.updateCharts(store);
        });
      }

      dataPane.querySelectorAll('.btn-fc-delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          if (isNaN(idx)) return;
          if (store.forecast?.labels?.length <= 2) {
            if (typeof window.showToast === 'function') {
              window.showToast('Minimum 2 intervals required for trajectory forecast.');
            }
            return;
          }
          store.forecast.labels.splice(idx, 1);
          store.forecast.values.splice(idx, 1);

          renderModuleStage('g');
          saveActiveModuleData(false);
          if (window.updateCharts) window.updateCharts(store);
        });
      });
    }

    // Special handler for Module E (Anomalies CRUD & Design)
    if (key === 'e') {
      const btnAddAno = dataPane.querySelector('#btnAnomalyAddRecord');
      if (btnAddAno) {
        btnAddAno.addEventListener('click', (e) => {
          e.preventDefault();
          syncAnomaliesFromDOM(store);
          if (!store.anomalies) store.anomalies = [];
          const count = store.anomalies.length;
          const newAno = {
            id: 'ano-' + Date.now(),
            badge: `Highlight ${count + 1}`,
            color: 'amber',
            icon: 'warning',
            title: 'Metric divergence or operational milestone observed.',
            reason: 'Identified workload convergence or operational milestone.',
            action: 'Institute preventive safeguards and continuous monitoring.'
          };
          store.anomalies.push(newAno);
          if (store.anomalies.length === 1) {
            store.anomaly = { ...newAno };
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
          renderModuleDataPaneOnly('e', store);
          if (typeof window.renderDashboard === 'function') {
            window.renderDashboard(store);
          }
          if (typeof window.showToast === 'function') {
            window.showToast('New anomaly record added.');
          }
        });
      }

      dataPane.querySelectorAll('.btn-ue-anomaly-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const idx = parseInt(btn.dataset.deleteIdx, 10);
          if (isNaN(idx)) return;
          syncAnomaliesFromDOM(store);
          const removed = store.anomalies.splice(idx, 1)[0];
          if (store.anomalies.length > 0) {
            store.anomaly = { ...store.anomalies[0] };
          } else {
            store.anomaly = null;
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
          renderModuleDataPaneOnly('e', store);
          if (typeof window.renderDashboard === 'function') {
            window.renderDashboard(store);
          }
          if (typeof window.showToast === 'function') {
            window.showToast(`Deleted ${removed?.badge || 'anomaly record'}.`);
          }
        });
      });

      const updateLivePillPreview = (itemEl) => {
        if (!itemEl) return;
        const idx = itemEl.dataset.anoIdx;
        const preview = itemEl.querySelector('#ue-preview-pill-' + idx);
        const badgeVal = itemEl.querySelector('.ue-ano-badge')?.value?.trim() || `Anomaly ${Number(idx) + 1}`;
        const colorVal = itemEl.querySelector('.ue-ano-color')?.value || 'amber';
        const iconVal = itemEl.querySelector('.ue-ano-icon')?.value || 'warning';
        if (preview) {
          preview.className = `anomaly-badge-pill pill-${colorVal}`;
          preview.innerHTML = `<span class="material-symbols-rounded preview-icon" style="font-size:12px; line-height:1;">${escapeHtml(iconVal)}</span> <span class="preview-text">${escapeHtml(badgeVal)}</span>`;
        }
      };

      dataPane.querySelectorAll('.ue-ano-badge, .ue-ano-color, .ue-ano-icon').forEach(el => {
        el.addEventListener('input', () => {
          updateLivePillPreview(el.closest('.ue-anomaly-item'));
          triggerAutoSaveDebounce();
        });
        el.addEventListener('change', () => {
          updateLivePillPreview(el.closest('.ue-anomaly-item'));
          triggerAutoSaveDebounce();
        });
      });

      dataPane.querySelectorAll('.ue-ano-title, .ue-ano-reason, .ue-ano-action').forEach(el => {
        el.addEventListener('input', () => {
          triggerAutoSaveDebounce();
        });
      });
    }
  }

  function triggerAutoSaveDebounce() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveActiveModuleData(false);
    }, 350);
  }

  /* ==========================================================================
     PERSISTENCE: SAVE ACTIVE MODULE
     ========================================================================== */
  function saveActiveModuleData(showToastNotification = false) {
    const store = getDataStore();
    const STORAGE_KEY = 'human_bi_dashboard_state_v5';

    // 1. Gather narrative from active Quill editor
    if (activeQuillEditor) {
      const html = activeQuillEditor.getContent();
      if (!store.narratives) store.narratives = {};
      store.narratives[activeModuleKey] = html;
      localStorage.setItem(`card_detail_narrative_${activeModuleKey}`, html);
    }

    // 2. Gather data fields for activeModuleKey
    if (activeModuleKey === 'a') {
      const name = document.getElementById('ue-prof-name')?.value?.trim();
      const nick = document.getElementById('ue-prof-nick')?.value?.trim();
      const role = document.getElementById('ue-prof-role')?.value?.trim();
      const branch = document.getElementById('ue-prof-branch')?.value?.trim();
      const tenure = document.getElementById('ue-prof-tenure')?.value?.trim();
      if (!store.profile) store.profile = {};
      if (name) store.profile.name = name;
      if (nick) store.profile.nickname = nick;
      if (role) store.profile.role = role;
      if (branch) store.profile.branch = branch;
      if (tenure) store.profile.tenure = tenure;
    } else if (activeModuleKey === 'b') {
      const cards = document.querySelectorAll('.kpi-edit-card');
      if (cards.length && Array.isArray(store.kpis)) {
        cards.forEach(card => {
          const kpiId = card.dataset.kpiId;
          const kpi = store.kpis.find(k => k.id === kpiId);
          if (kpi) {
            const val = card.querySelector('.kpi-input-val')?.value?.trim();
            const chg = card.querySelector('.kpi-input-change')?.value?.trim();
            const dir = card.querySelector('.kpi-select-dir')?.value;
            if (val !== undefined) kpi.value = val;
            if (chg !== undefined) kpi.change = chg;
            if (dir) {
              kpi.changeDirection = dir;
              kpi.changeType = dir === 'down' ? 'negative' : 'positive';
            }
          }
        });
      }
    } else if (activeModuleKey === 'c') {
      if (!store.trend) store.trend = { datasets: {} };
      if (!store.trend.datasets) store.trend.datasets = {};
      const labels = [];
      const pro = [];
      const well = [];
      document.querySelectorAll('.trend-month-input').forEach(inp => labels.push(inp.value.trim() || 'Period'));
      document.querySelectorAll('.trend-pro-input').forEach(inp => pro.push(Number(inp.value) || 0));
      document.querySelectorAll('.trend-well-input').forEach(inp => well.push(Number(inp.value) || 0));
      store.trend.labels = labels;
      store.trend.datasets.professionalImpact = pro;
      store.trend.datasets.personalWellbeing = well;
      if (window.updateCharts) {
        window.updateCharts(store);
      }
      if (typeof syncTrendRangeSelector === 'function') {
        syncTrendRangeSelector();
      }
    } else if (activeModuleKey === 'd') {
      const ins0 = document.getElementById('ue-insight-0')?.value?.trim();
      const ins1 = document.getElementById('ue-insight-1')?.value?.trim();
      const ins2 = document.getElementById('ue-insight-2')?.value?.trim();
      store.insights = [ins0, ins1, ins2].filter(Boolean);
    } else if (activeModuleKey === 'e') {
      syncAnomaliesFromDOM(store);
      if (typeof window.renderDashboard === 'function') {
        window.renderDashboard(store);
      }
    } else if (activeModuleKey === 'f') {
      const q = document.getElementById('ue-strategic-q')?.value?.trim();
      if (q) {
        store.strategicQuestion = { question: q };
      }
    } else if (activeModuleKey === 'g') {
      if (!store.forecast) store.forecast = {};
      const labels = [];
      const vals = [];
      document.querySelectorAll('.fc-month-input').forEach(inp => labels.push(inp.value.trim() || 'Target'));
      document.querySelectorAll('.fc-val-input').forEach(inp => vals.push(Number(inp.value) || 0));
      store.forecast.labels = labels;
      store.forecast.values = vals;

      const currentMode = store.forecastHorizonMode || '6m';
      if (!store.forecastByMode) store.forecastByMode = JSON.parse(JSON.stringify(DEFAULT_FORECAST_HORIZONS));
      store.forecastByMode[currentMode] = {
        labels: [...labels],
        values: [...vals]
      };

      const g0 = document.getElementById('ue-fc-goal-0')?.value?.trim();
      const g1 = document.getElementById('ue-fc-goal-1')?.value?.trim();
      const g2 = document.getElementById('ue-fc-goal-2')?.value?.trim();
      store.forecast.summary = [g0, g1, g2].filter(Boolean);

      if (window.updateCharts) {
        window.updateCharts(store);
      }
    } else if (activeModuleKey === 'h') {
      const pts = [
        document.getElementById('ue-gov-0')?.value?.trim(),
        document.getElementById('ue-gov-1')?.value?.trim(),
        document.getElementById('ue-gov-2')?.value?.trim()
      ].filter(Boolean);
      if (!store.governance) store.governance = {};
      store.governance.points = pts;
    } else if (activeModuleKey === 'i') {
      const q = document.getElementById('ue-id-quote')?.value?.trim();
      const m = document.getElementById('ue-id-motto')?.value?.trim();
      const s = document.getElementById('ue-id-subtext')?.value?.trim();
      if (!store.identity) store.identity = {};
      if (q) store.identity.quote = q;
      if (m) { store.identity.motto = m; store.identity.title = m; }
      if (s) { store.identity.subtext = s; store.identity.subtitle = s; }
    }

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

    // Flash auto-saved indicator
    indicateAutoSaved();

    if (showToastNotification && typeof window.showToast === 'function') {
      window.showToast(`Module [${MODULE_METADATA[activeModuleKey]?.letter || 'A'}] updated successfully.`);
    }
  }

  function saveActiveModuleNarrative(html, showIndicator = false) {
    const store = getDataStore();
    if (!store.narratives) store.narratives = {};
    store.narratives[activeModuleKey] = html;
    localStorage.setItem(`card_detail_narrative_${activeModuleKey}`, html);
    indicateAutoSaved();
  }

  function indicateAutoSaved() {
    // Auto-save pill removed per executive design request
  }

  /* ==========================================================================
     SAVE & CLOSE / RESET ACTIONS
     ========================================================================== */
  function saveAndCloseUnifiedEditor() {
    saveActiveModuleData(false);

    const store = getDataStore();

    // Re-render dashboard UI and Chart.js instances
    if (typeof window.renderDashboard === 'function') {
      window.renderDashboard(store);
    }
    if (typeof window.updateCharts === 'function') {
      window.updateCharts(store);
    }

    closeUnifiedEditor();

    if (typeof window.showToast === 'function') {
      window.showToast('Executive Dossier & Metrics synchronized with dashboard.');
    }
  }

  async function resetCurrentModuleDefaults() {
    if (!confirm(`Reset Module [${MODULE_METADATA[activeModuleKey]?.letter}] to institutional baseline values?`)) {
      return;
    }

    try {
      const res = await fetch('data/dashboard-data.json');
      const baseline = await res.json();
      const store = getDataStore();

      // Reset specific module fields
      if (activeModuleKey === 'a' && baseline.profile) {
        store.profile = JSON.parse(JSON.stringify(baseline.profile));
      } else if (activeModuleKey === 'b' && baseline.kpis) {
        store.kpis = JSON.parse(JSON.stringify(baseline.kpis));
      } else if (activeModuleKey === 'c' && baseline.trend) {
        store.trend = JSON.parse(JSON.stringify(baseline.trend));
      } else if (activeModuleKey === 'd' && baseline.insights) {
        store.insights = JSON.parse(JSON.stringify(baseline.insights));
      } else if (activeModuleKey === 'e' && baseline.anomaly) {
        store.anomaly = JSON.parse(JSON.stringify(baseline.anomaly));
      } else if (activeModuleKey === 'f' && baseline.strategicQuestion) {
        store.strategicQuestion = JSON.parse(JSON.stringify(baseline.strategicQuestion));
      } else if (activeModuleKey === 'g' && baseline.forecast) {
        store.forecast = JSON.parse(JSON.stringify(baseline.forecast));
        store.forecastHorizonMode = '6m';
        store.forecastByMode = JSON.parse(JSON.stringify(DEFAULT_FORECAST_HORIZONS));
      } else if (activeModuleKey === 'h' && baseline.governance) {
        store.governance = JSON.parse(JSON.stringify(baseline.governance));
      } else if (activeModuleKey === 'i' && baseline.identity) {
        store.identity = JSON.parse(JSON.stringify(baseline.identity));
      }

      // Reset narrative to default
      if (DEFAULT_NARRATIVES[activeModuleKey]) {
        if (!store.narratives) store.narratives = {};
        store.narratives[activeModuleKey] = DEFAULT_NARRATIVES[activeModuleKey];
        localStorage.setItem(`card_detail_narrative_${activeModuleKey}`, DEFAULT_NARRATIVES[activeModuleKey]);
      }

      localStorage.setItem('human_bi_dashboard_state_v5', JSON.stringify(store));

      // Refresh editor stage
      renderModuleStage(activeModuleKey);

      if (typeof window.showToast === 'function') {
        window.showToast(`Module [${MODULE_METADATA[activeModuleKey]?.letter}] restored to baseline.`);
      }
    } catch (err) {
      console.error('Error resetting module', err);
    }
  }

  // Keyboard shortcut: Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('unifiedEditorModal');
      if (modal && modal.classList.contains('show')) {
        saveAndCloseUnifiedEditor();
      }
    }
  });

  /* ==========================================================================
     GLOBAL EXPORTS & BACKWARD-COMPATIBLE ALIASES
     ========================================================================== */
  window.openUnifiedEditor = openUnifiedEditor;
  window.closeUnifiedEditor = closeUnifiedEditor;
  window.switchUnifiedModule = switchUnifiedModule;
  window.saveAndCloseUnifiedEditor = saveAndCloseUnifiedEditor;
  window.resetCurrentModuleDefaults = resetCurrentModuleDefaults;

  // Backward-compatible aliases
  window.openCardDetail = openUnifiedEditor;
  window.closeCardDetail = closeUnifiedEditor;

})(window);
