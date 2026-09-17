# Human BI Dashboard & QuakeSpots GIS Spatial Analysis Portal

**Student:** Alwinson Bustamante  
**Instructor / Client:** Mary Jane Sapiendante Legaspi ("Ma'am Jane")  
**Role:** Higher Education Faculty Member & Reserve Military Officer  

---

## 📌 Executive Summary

This enterprise web application provides a unified dual-mode business intelligence and geospatial analytics platform. Designed specifically to meet all academic and functional requirements:
1. **View-Only Access (1B):** Publicly viewable web application with zero login or barrier to entry.
2. **Dual-Mode System (2A & 2B):**
   - **Human BI Dashboard:** High-fidelity executive cockpit quantifying faculty impact, military readiness, student outcomes, and well-being.
   - **QuakeSpots GIS Portal:** 68,545-earthquake dataset spatial analysis map with interactive statistical layers.
3. **Free Permanent Hosting (3-yes):** Zero-dependency static architecture ready for GitHub Pages and Netlify.
4. **Rapid Data Updates:** In-browser live editor drawer and decoupled JSON state store.
5. **Mobile-Responsive & 1-Click PDF Export:** Optimized for smartphone viewing and single-page A4 landscape report export.
6. **Technical Methodology ("Paano Ginawa"):** Comprehensive defense guide explaining Power BI metrics, Getis-Ord $G_i^*$, Anselin Local Moran's I LISA, EHSA, and KDE heatmaps.

---

## 🗂️ System Architecture

```
client/
├── index.html                  # Unified Portal Shell (Tabs, Headers, Views)
├── quakespots3.html            # 68,545-marker Leaflet/Folium GIS Spatial Map
├── assets/
│   ├── css/
│   │   ├── main.css            # Layout resets, header, toast, slide-over drawer
│   │   ├── powerbi-theme.css   # Pixel-perfect 3x3 Power BI card grid & styles
│   │   └── print-pdf.css       # Landscape A4 print engine
│   ├── js/
│   │   ├── app.js              # View switcher, hash router, lazy loader
│   │   ├── charts.js           # Chart.js instances (Authentic Trend & Forecast)
│   │   ├── data-manager.js     # Live data editor, LocalStorage persistence, JSON sync
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

## 🗺️ QuakeSpots GIS Spatial Analysis Engine

*   **Dataset:** 68,545 seismic events across the Philippine Fault System and subduction trenches.
*   **Getis-Ord $G_i^*$:** Identifies statistically significant hot spots ($z > +2.58$, 99% confidence) and cold spots ($z < -2.58$).
*   **Anselin Local Moran's I (LISA):** Classifies spatial autocorrelation into High-High, Low-Low, High-Low, and Low-High outliers.
*   **Emerging Hot Spot Analysis (EHSA):** Evaluates space-time persistence (intensifying, persistent, sporadic).
*   **Dual KDE Heatmaps:** Spatial event frequency vs seismic energy release (moment magnitude).

---

## 🚀 Running Locally & Publishing

### Local Preview
Open `index.html` directly in any web browser or serve via XAMPP Apache:
```text
http://localhost/client/
```

### GitHub Pages Deployment
See [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) for 2-minute setup instructions.
