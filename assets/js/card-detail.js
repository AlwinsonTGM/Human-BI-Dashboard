/* ==========================================================================
   CARD FULL DETAIL MODAL (DEEP DIVE VIEW)
   Provides full metrics breakdowns, formulas, historical logs, and
   reusable Word-style document editing for each card on the dashboard.
   ========================================================================== */

(function(window) {
  'use strict';

  let activeDetailCardKey = 'a';
  let detailDocEditor = null;
  let isEditingDetail = false;

  const CARD_DEFINITIONS = {
    'a': {
      letter: 'A',
      title: 'Executive Profile & Command Record',
      category: 'Leadership & Identity',
      gradientClass: 'badge-dark',
      icon: 'person',
      subtitle: 'Higher Education Faculty & Military Reserve Executive'
    },
    'b': {
      letter: 'B',
      title: '5 Core KPIs & Performance Index Breakdown',
      category: 'Operational Metrics',
      gradientClass: 'badge-info',
      icon: 'insights',
      subtitle: 'Multivariate Normalization: Student Reach, Initiatives, Readiness, & Equilibrium'
    },
    'c': {
      letter: 'C',
      title: 'Authentic Longitudinal Trend Analysis',
      category: 'Temporal Analytics',
      gradientClass: 'badge-dark',
      icon: 'trending_up',
      subtitle: 'Rolling 12-Month Performance Velocity and Well-being Correlation'
    },
    'd': {
      letter: 'D',
      title: 'Diagnostic Insights & Behavioral Drivers',
      category: 'Qualitative Intelligence',
      gradientClass: 'badge-info',
      icon: 'lightbulb',
      subtitle: 'Root-Cause Analysis of Faculty Deliverables and Physical Preparedness'
    },
    'e': {
      letter: 'E',
      title: 'One Data Anomaly: Workload Convergence Post-Mortem',
      category: 'Anomaly Forensics',
      gradientClass: 'badge-warning',
      icon: 'warning',
      subtitle: 'Detailed Analysis of April Spike (Impact 80 vs Well-being 68)'
    },
    'f': {
      letter: 'F',
      title: 'Strategic Inquiry & Strategic Expansion Plan',
      category: 'Strategic Vision',
      gradientClass: 'badge-primary',
      icon: 'crisis_alert',
      subtitle: 'Institutional Scalability Framework, Resource Allocation & Partnerships'
    },
    'g': {
      letter: 'G',
      title: '6-Month Statistical Forecast & Predictive Projections',
      category: 'Predictive Modeling',
      gradientClass: 'badge-dark',
      icon: 'bolt',
      subtitle: 'Dynamic Linear Regression Modeling ($y = mx + b$) for H2 Projections'
    },
    'h': {
      letter: 'H',
      title: 'Data Governance, Provenance & Privacy Architecture',
      category: 'Governance & Ethics',
      gradientClass: 'badge-success',
      icon: 'shield',
      subtitle: 'Multi-source Data Provenance Catalog, Consent Protocols, & Ethical AI Compliance'
    },
    'i': {
      letter: 'I',
      title: 'BI Identity & Servant Leadership Philosophy',
      category: 'Executive Vision',
      gradientClass: 'badge-dark',
      icon: 'flag',
      subtitle: 'Personal Mission Statement, Leadership Pillars, & Core Competencies'
    }
  };

  function openCardDetail(cardKey) {
    activeDetailCardKey = cardKey || 'a';
    isEditingDetail = false;

    let modal = document.getElementById('cardDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cardDetailModal';
      modal.className = 'card-detail-backdrop';
      modal.innerHTML = `
        <div class="card-detail-window">
          
          <!-- Modal Top Header -->
          <div class="detail-modal-header">
            <div class="detail-header-info">
              <div class="material-letter-badge badge-dark" id="detailCardBadge">A</div>
              <div>
                <h3 class="mb-0 h5 font-weight-bolder text-dark" id="detailCardTitle">Executive Profile</h3>
                <span class="text-xs text-secondary" id="detailCardSubtitle">Detailed Deep Dive</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn-material btn-material-outline" id="btnToggleDetailEdit" onclick="toggleDetailEditMode()">
                <span class="material-symbols-rounded" style="font-size:16px;">edit_document</span>
                <span id="btnToggleDetailEditText">Edit Narrative</span>
              </button>
              <button type="button" class="btn-card-hide" onclick="closeCardDetail()" title="Close detail view">✕</button>
            </div>
          </div>

          <!-- Quick Navigation Tabs (Cards A - I) -->
          <div class="detail-nav-tabs" id="detailNavTabs"></div>

          <!-- Dynamic Deep Dive Content -->
          <div class="detail-modal-content" id="detailModalContent"></div>

          <!-- Modal Footer -->
          <div class="detail-modal-footer">
            <div class="text-xs text-secondary d-flex align-items-center gap-2">
              <span class="material-symbols-rounded text-success" style="font-size:16px;">verified</span>
              <span>All metrics synchronized in real time with Executive Data Studio.</span>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn-material btn-material-outline" onclick="closeCardDetail()">Close</button>
              <button type="button" class="btn-material btn-material-primary" onclick="saveDetailNarrativeAndClose()">Save & Apply</button>
            </div>
          </div>

        </div>
      `;
      document.body.appendChild(modal);
    }

    renderDetailNavTabs();
    renderActiveCardContent();
    modal.style.display = 'flex';
  }

  function closeCardDetail() {
    const modal = document.getElementById('cardDetailModal');
    if (modal) modal.style.display = 'none';
  }

  function renderDetailNavTabs() {
    const tabsContainer = document.getElementById('detailNavTabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    Object.keys(CARD_DEFINITIONS).forEach(key => {
      const def = CARD_DEFINITIONS[key];
      const btn = document.createElement('button');
      btn.className = `detail-nav-tab-btn card-detail-tab ${key === activeDetailCardKey ? 'active' : ''}`;
      btn.dataset.card = key;
      btn.innerHTML = `<span class="material-symbols-rounded" style="font-size:14px;">${def.icon}</span> [${def.letter}] ${def.title.split(':')[0].split('&')[0]}`;
      btn.onclick = () => {
        activeDetailCardKey = key;
        isEditingDetail = false;
        renderDetailNavTabs();
        renderActiveCardContent();
      };
      tabsContainer.appendChild(btn);
    });
  }

  function renderActiveCardContent() {
    const def = CARD_DEFINITIONS[activeDetailCardKey];
    if (!def) return;

    // Update Header
    document.getElementById('detailCardBadge').textContent = def.letter;
    document.getElementById('detailCardBadge').className = `material-letter-badge ${def.gradientClass}`;
    document.getElementById('detailCardTitle').textContent = def.title;
    document.getElementById('detailCardSubtitle').textContent = def.subtitle;

    const contentArea = document.getElementById('detailModalContent');
    const store = window.dashboardData || {};

    let html = '';

    if (activeDetailCardKey === 'a') {
      // Profile
      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-info">military_tech</span> Executive Profile & Credentials</h4>
            <table class="detail-metrics-table">
              <tr><th>Full Legal Name</th><td><strong>${store.profile?.name || 'Mary Jane Sapiendante Legaspi'}</strong></td></tr>
              <tr><th>Academic Role</th><td>${store.profile?.role || 'Higher Education Faculty Member & Researcher'}</td></tr>
              <tr><th>Military Branch</th><td>Philippine Army Reserve Command (ARESCOM)</td></tr>
              <tr><th>Operational Unit</th><td>National Service Training Program & Civil-Military Operations</td></tr>
              <tr><th>Specializations</th><td>Data-Driven Curriculum, Quantitative Pedagogy, Geospatial GIS Analysis</td></tr>
              <tr><th>Tenure</th><td>12+ Years in Academic Instruction & Community Mobilization</td></tr>
            </table>
          </div>
          <div class="detail-card-panel">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-success">psychology</span> Executive Philosophy & Mission</h4>
            <div id="detail-doc-editor-container"></div>
            <div id="detail-static-narrative">
              <div class="doc-callout success">
                <strong>Servant Leadership Ethos:</strong> "I turn purpose into performance through data, discipline, and dedication."
              </div>
              <p>Ma'am Jane integrates rigor from military training with empathetic academic mentoring. This personal dashboard acts as a continuous feedback loop between professional achievements and personal sustainability.</p>
              <div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;">
                <span class="doc-check-icon">✓</span> <span>Zero compromise on student learning outcomes</span>
              </div>
              <div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                <span class="doc-check-icon">✓</span> <span>Maintains high physical readiness score (87%+)</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeDetailCardKey === 'b') {
      // 5 KPIs
      const kpis = store.kpis || {};
      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel full-span">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-info">calculate</span> KPI Weighted Normalization Formula</h4>
            <div class="doc-callout">
              <strong>Human BI Normalization Index:</strong><br>
              <code>Impact Score = (0.40 × Student Reach) + (0.35 × Active Projects) + (0.25 × Learning Hours)</code><br>
              <code>Well-being Score = (0.50 × Physical Readiness) + (0.30 × Recovery Cycles) + (0.20 × Work-Life Equilibrium)</code>
            </div>
            <table class="detail-metrics-table" style="margin-top:12px;">
              <thead>
                <tr>
                  <th>KPI Dimension</th>
                  <th>Current Metric</th>
                  <th>Standard Unit</th>
                  <th>Monthly Delta</th>
                  <th>Target Benchmark</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. Continuous Learning Hours</strong></td>
                  <td><strong>${kpis.learning_hours?.value || 142}</strong></td>
                  <td>hrs / month</td>
                  <td><span class="text-success font-weight-bold">↑ ${kpis.learning_hours?.change || '12%'}</span></td>
                  <td>130 hrs / month</td>
                  <td><span class="material-symbols-rounded text-success">verified</span> Exceeding</td>
                </tr>
                <tr>
                  <td><strong>2. Student Impact & Reach</strong></td>
                  <td><strong>${kpis.student_impact?.value || 268}</strong></td>
                  <td>students mentored</td>
                  <td><span class="text-success font-weight-bold">↑ ${kpis.student_impact?.change || '15%'}</span></td>
                  <td>250 students</td>
                  <td><span class="material-symbols-rounded text-success">verified</span> Exceeding</td>
                </tr>
                <tr>
                  <td><strong>3. Active Projects & Initiatives</strong></td>
                  <td><strong>${kpis.projects_initiatives?.value || 12}</strong></td>
                  <td>initiatives</td>
                  <td><span class="text-success font-weight-bold">↑ ${kpis.projects_initiatives?.change || '9%'}</span></td>
                  <td>10 active</td>
                  <td><span class="material-symbols-rounded text-success">verified</span> Optimal</td>
                </tr>
                <tr>
                  <td><strong>4. Physical Readiness Score</strong></td>
                  <td><strong>${kpis.physical_readiness?.value || '87%'}</strong></td>
                  <td>fitness index</td>
                  <td><span class="text-success font-weight-bold">↑ ${kpis.physical_readiness?.change || '5%'}</span></td>
                  <td>85% passing</td>
                  <td><span class="material-symbols-rounded text-success">verified</span> Reserve Ready</td>
                </tr>
                <tr>
                  <td><strong>5. Holistic Well-being Index</strong></td>
                  <td><strong>${kpis.wellbeing_index?.value || 8.6}</strong></td>
                  <td>out of 10.0</td>
                  <td><span class="text-success font-weight-bold">↑ ${kpis.wellbeing_index?.change || '7%'}</span></td>
                  <td>8.5 target</td>
                  <td><span class="material-symbols-rounded text-success">verified</span> Balanced</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeDetailCardKey === 'c') {
      // Authentic Trend
      const trend = store.trend || {};
      const labels = trend.labels || [];
      const pro = trend.datasets?.professionalImpact || [];
      const well = trend.datasets?.personalWellbeing || [];
      
      let rows = '';
      labels.forEach((m, idx) => {
        const pVal = pro[idx] || 0;
        const wVal = well[idx] || 0;
        const diff = pVal - wVal;
        rows += `
          <tr>
            <td><strong>${m}</strong></td>
            <td><span class="text-info font-weight-bold">${pVal}</span></td>
            <td><span class="text-warning font-weight-bold">${wVal}</span></td>
            <td>${diff > 0 ? `+${diff}` : diff} pts (${diff > 10 ? 'Workload Divergence' : 'Equilibrium'})</td>
            <td>${idx === 3 ? '<span class="text-danger font-weight-bold">Anomaly Peak</span>' : 'Standard'}</td>
          </tr>
        `;
      });

      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel full-span">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-dark">timeline</span> Monthly Longitudinal Performance Data Matrix</h4>
            <table class="detail-metrics-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Professional Impact Index</th>
                  <th>Personal Well-being Index</th>
                  <th>Spread / Variance</th>
                  <th>Diagnosis Note</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div id="detail-doc-editor-container"></div>
            <div id="detail-static-narrative" style="margin-top:16px;">
              <div class="doc-callout info">
                <strong>Executive Trend Takeaway:</strong> Sustained professional impact is maintained above the 60 index baseline. Well-being exhibits dynamic resilience with rapid recovery cycles following peak academic-military workload intersections.
              </div>
              <div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin-top:8px;">
                <span class="doc-check-icon">✓</span> <span>Rolling correlation index tracked across institutional quarters</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeDetailCardKey === 'e') {
      // Anomaly
      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel full-span">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-warning">report_problem</span> Incident Post-Mortem: Workload Convergence</h4>
            <div class="doc-callout warning">
              <strong>Root Cause:</strong> Academic mid-term grading and thesis committee reviews overlapped simultaneously with mandatory battalion field exercises.
            </div>
            <div id="detail-doc-editor-container"></div>
            <div id="detail-static-narrative">
              <h5 style="margin-top:14px;">Preventive Safeguards Instituted:</h5>
              <div class="doc-checklist-item">
                <span class="doc-check-icon">✓</span> <span>Automated grading rubrics deployed via LMS, saving 18 hrs/week during finals.</span>
              </div>
              <div class="doc-checklist-item">
                <span class="doc-check-icon">✓</span> <span>Delegated administrative reporting to teaching assistants.</span>
              </div>
              <div class="doc-checklist-item">
                <span class="doc-check-icon">✓</span> <span>Protected 7.5 hours minimum nightly sleep window before military field exercises.</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeDetailCardKey === 'g') {
      // Forecast
      const fc = store.forecast || {};
      const labels = fc.labels || [];
      const vals = fc.values || [];
      let rows = '';
      labels.forEach((m, idx) => {
        rows += `<tr><td><strong>${m}</strong></td><td>${vals[idx] || 0}</td><td>Projected +${Math.round((vals[idx] || 50) * 0.12)}%</td><td>H2 Deliverable Phase ${idx + 1}</td></tr>`;
      });

      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel full-span">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-dark">analytics</span> 6-Month Forward Projection Model Breakdown</h4>
            <p class="text-sm text-secondary">The trend trajectory is computed in real time using linear least squares regression across the projected index values.</p>
            <table class="detail-metrics-table">
              <thead><tr><th>Forecast Horizon</th><th>Projected Index Value</th><th>Estimated Impact Growth</th><th>Strategic Milestone</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      // Generic / Other cards (D, F, H, I)
      html = `
        <div class="detail-grid-layout">
          <div class="detail-card-panel full-span">
            <h4 class="detail-panel-title"><span class="material-symbols-rounded text-info">${def.icon}</span> ${def.title}</h4>
            <div id="detail-doc-editor-container"></div>
            <div id="detail-static-narrative">
              <p class="text-sm">${def.subtitle}</p>
              <div class="doc-callout">
                <strong>Executive Notes & Directives:</strong> Document and refine strategic action plans, governance controls, or analytical takeaways below.
              </div>
            </div>
          </div>
        </div>
      `;
    }

    contentArea.innerHTML = html;
  }

  function toggleDetailEditMode() {
    isEditingDetail = !isEditingDetail;
    const btnText = document.getElementById('btnToggleDetailEditText');
    const container = document.getElementById('detail-doc-editor-container');
    const staticDiv = document.getElementById('detail-static-narrative');

    if (!container) return;

    if (isEditingDetail) {
      if (btnText) btnText.textContent = 'View Preview';
      if (staticDiv) staticDiv.style.display = 'none';
      container.style.display = 'block';

      if (!detailDocEditor && window.PbiDocEditor) {
        detailDocEditor = new window.PbiDocEditor('detail-doc-editor-container', staticDiv ? staticDiv.innerHTML : '<p>Enter extended narrative here...</p>');
      }
    } else {
      if (btnText) btnText.textContent = 'Edit Narrative';
      if (detailDocEditor && staticDiv) {
        staticDiv.innerHTML = detailDocEditor.getContent();
      }
      if (staticDiv) staticDiv.style.display = 'block';
      container.style.display = 'none';
    }
  }

  function saveDetailNarrativeAndClose() {
    if (detailDocEditor) {
      const content = detailDocEditor.getContent();
      // Store in localStorage
      localStorage.setItem(`card_detail_narrative_${activeDetailCardKey}`, content);
      if (window.showToast) window.showToast('Card detail narrative saved successfully!');
    }
    closeCardDetail();
  }

  // Export to window
  window.openCardDetail = openCardDetail;
  window.closeCardDetail = closeCardDetail;
  window.toggleDetailEditMode = toggleDetailEditMode;
  window.saveDetailNarrativeAndClose = saveDetailNarrativeAndClose;

})(window);
