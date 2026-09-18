# Human BI Executive Dashboard

**Student:** Alwinson Bustamante  
**Instructor / Client:** Mary Jane Sapiendante Legaspi ("Ma'am Jane")  
**Role:** Higher Education Faculty Member & Reserve Military Officer  

---

## 📌 Executive Summary

This enterprise web application provides a tailored, high-fidelity business intelligence cockpit quantifying the multidimensional professional, academic, and military impact of **Mary Jane Sapiendante Legaspi**.

Designed specifically to meet all academic requirements:
1. **View-Only Access (1B):** Publicly viewable web application with zero barrier to entry.
2. **Executive BI Dashboard (2A):** High-fidelity executive cockpit quantifying faculty impact, military readiness, student outcomes, and holistic well-being.
3. **Free Permanent Hosting (3-yes):** Zero-dependency static architecture ready for GitHub Pages and Netlify.
4. **Rapid Data Updates:** In-browser live editor drawer and decoupled JSON state store.
5. **Mobile-Responsive & 1-Click PDF Export:** Optimized for smartphone viewing and single-page A4 landscape report export.
6. **Technical Methodology ("Paano Ginawa"):** Comprehensive defense guide explaining Power BI metrics, index normalization, and data governance ethics.

---

## 🗂️ System Architecture

```
client/
├── index.html                  # Executive Portal Shell (Dossier, Grid, Tabs)
├── assets/
│   ├── css/
│   │   ├── main.css            # Layout resets, header, toast, slide-over drawer
│   │   ├── executive-theme.css # Stately Newsreader + Plus Jakarta Sans styles
│   │   └── print-pdf.css       # Landscape A4 print engine
│   ├── js/
│   │   ├── app.js              # View switcher, hash router, interactive controller
│   │   ├── charts.js           # Chart.js instances (Authentic Trend & Forecast)
│   │   ├── data-manager.js     # Live data editor, LocalStorage persistence, JSON sync
│   │   ├── doc-editor.js       # Strategic dossier editing
│   │   ├── card-detail.js      # Modal deep-dives
│   │   └── pdf-export.js       # 1-click executive PDF generator
│   └── mary_jane.jpg           # Official portrait of Mary Jane Legaspi
├── data/
│   └── dashboard-data.json     # Decoupled primary data store
├── DEPLOY_GITHUB_PAGES.md      # Deployment instructions for GitHub & Netlify
└── README.md                   # Academic project documentation
```

---

## 📊 Dashboard Modules (Cards A–I)

*   **[A] Executive Profile:** Official credentials, faculty role, and reserve military service.
*   **[B] 5 Personal / Prof KPIs:** Learning Hours (142 hrs/mo, ↑12%), Student Impact (268 students, ↑15%), Active Projects (12 active, ↑9%), Physical Readiness (87% score, ↑5%), Well-being Index (8.6/10, ↑7%).
*   **[C] Authentic Trend:** Dual-axis longitudinal line chart tracking *Professional Impact Index* vs *Personal Well-being Index* over the last 6 months.
*   **[D] Insight Behind Data:** Evidence-based deductions connecting discipline to student outcomes.
*   **[E] One Data Anomaly:** Diagnostic root-cause analysis of the April deliverables/military overlap.
*   **[F] Strategic Question:** Transformative inquiry on scaling student success and national service without compromising health.
*   **[G] 6-Month BI Forecast:** Predictive bar chart with upward trend projection and target milestones.
*   **[H] Governance & Privacy:** Ethical compliance, LMS verification, and privacy safeguards.
*   **[I] Your BI Identity:** Core values (*Educator. Soldier. Servant Leader.*).

---

## 🚀 Running Locally & Publishing

### Local Preview
Open `index.html` directly in any web browser or serve via XAMPP Apache:
```text
http://localhost/client/
```

### GitHub Pages Deployment
See [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) for 2-minute setup instructions.
