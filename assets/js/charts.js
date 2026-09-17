/* ==========================================================================
   CHARTS MODULE (Chart.js Integration)
   Powers the Authentic Trend dual-line chart and 6-Month Forecast bar chart
   ========================================================================== */

let trendChartInstance = null;
let forecastChartInstance = null;

// Safely register drag-data plugin if available
if (typeof Chart !== 'undefined' && typeof Chart.register === 'function' && window['chartjs-plugin-dragdata']) {
  try {
    Chart.register(window['chartjs-plugin-dragdata']);
  } catch (e) {
    console.warn('dragData registration note:', e);
  }
}

function initCharts(data) {
  if (!data) return;
  if (data.trend) initTrendChart(data.trend);
  if (data.forecast) initForecastChart(data.forecast);
}

function updateCharts(data) {
  if (!data) return;
  if (data.trend) initTrendChart(data.trend);
  if (data.forecast) initForecastChart(data.forecast);
}

function initTrendChart(trendData) {
  const ctx = document.getElementById('trendChartCanvas');
  if (!ctx) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Professional Impact',
          data: trendData.datasets.professionalImpact,
          borderColor: '#0d3b66',
          backgroundColor: '#0d3b66',
          borderWidth: 2.5,
          tension: 0.25,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 18,
          pointBackgroundColor: '#0d3b66',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderDash: [] // solid
        },
        {
          label: 'Personal Well-being',
          data: trendData.datasets.personalWellbeing,
          borderColor: '#64748b',
          backgroundColor: '#64748b',
          borderWidth: 2.2,
          tension: 0.25,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 18,
          pointBackgroundColor: '#64748b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderDash: [5, 5] // dashed line matching reference
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Using custom Power BI styled legend in HTML
        },
        tooltip: {
          backgroundColor: '#0b2545',
          titleFont: { family: 'Segoe UI', size: 12, weight: 'bold' },
          bodyFont: { family: 'Segoe UI', size: 11 },
          padding: 8,
          cornerRadius: 4,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} (Drag dot to adjust)`;
            }
          }
        },
        dragData: {
          round: 0,
          showTooltip: true,
          onDragStart: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'ns-resize';
          },
          onDrag: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'ns-resize';
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleChartPointDrag) {
              window.handleChartPointDrag('trend', datasetIndex, index, clamped);
            }
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'default';
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleChartPointDragEnd) {
              window.handleChartPointDragEnd('trend', datasetIndex, index, clamped);
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            font: { family: 'Segoe UI', size: 10 },
            color: '#64748b'
          },
          grid: {
            color: '#e2e8f0',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            font: { family: 'Segoe UI', size: 10, weight: '600' },
            color: '#475569'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function initForecastChart(forecastData) {
  const ctx = document.getElementById('forecastChartCanvas');
  if (!ctx) return;

  if (forecastChartInstance) {
    forecastChartInstance.destroy();
  }

  forecastChartInstance = new Chart(ctx, {
    data: {
      labels: forecastData.labels || ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          type: 'bar',
          label: 'Projected Index',
          data: forecastData.values,
          backgroundColor: '#123861',
          borderRadius: 2,
          barPercentage: 0.65,
          dragData: true
        },
        {
          type: 'line',
          label: 'Trend Trajectory',
          data: forecastData.trendline,
          borderColor: '#94a3b8',
          borderWidth: 1.8,
          borderDash: [4, 4],
          pointRadius: 3,
          pointBackgroundColor: '#94a3b8',
          tension: 0.3,
          fill: false,
          dragData: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0b2545',
          titleFont: { family: 'Segoe UI', size: 11, weight: 'bold' },
          bodyFont: { family: 'Segoe UI', size: 10 },
          padding: 6,
          cornerRadius: 4,
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `Projection: ${context.parsed.y} (Drag bar to edit)`;
              }
              return `Trend: ${context.parsed.y}`;
            }
          }
        },
        dragData: {
          round: 0,
          showTooltip: true,
          onDragStart: function(e, datasetIndex, index, value) {
            if (datasetIndex !== 0) return false;
            if (e && e.target) e.target.style.cursor = 'ns-resize';
          },
          onDrag: function(e, datasetIndex, index, value) {
            if (datasetIndex !== 0) return;
            if (e && e.target) e.target.style.cursor = 'ns-resize';
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleChartPointDrag) {
              window.handleChartPointDrag('forecast', datasetIndex, index, clamped);
            }
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'default';
            if (datasetIndex !== 0) return;
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleChartPointDragEnd) {
              window.handleChartPointDragEnd('forecast', datasetIndex, index, clamped);
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            font: { family: 'Segoe UI', size: 9 },
            color: '#64748b'
          },
          grid: {
            color: '#f1f5f9',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            font: { family: 'Segoe UI', size: 9 },
            color: '#475569'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

let studioTrendPreviewInstance = null;

function initStudioTrendPreview(canvasOrProData, proOrWellData, maybeWellData) {
  let ctx = null;
  let proData = null;
  let wellData = null;

  if (typeof canvasOrProData === 'string') {
    ctx = document.getElementById(canvasOrProData);
    proData = proOrWellData;
    wellData = maybeWellData;
  } else if (canvasOrProData && canvasOrProData.nodeType) {
    ctx = canvasOrProData;
    proData = proOrWellData;
    wellData = maybeWellData;
  } else {
    ctx = document.getElementById('studioTrendCanvas');
    proData = canvasOrProData;
    wellData = proOrWellData;
  }

  if (!ctx) return;

  if (studioTrendPreviewInstance) {
    studioTrendPreviewInstance.destroy();
  }

  const defaultPro = [56, 61, 66, 80, 71, 86];
  const defaultWell = [69, 58, 54, 68, 55, 75];

  studioTrendPreviewInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Professional Impact',
          data: proData || defaultPro,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 18,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5
        },
        {
          label: 'Personal Well-being',
          data: wellData || defaultWell,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          fill: true,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHitRadius: 18,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          borderDash: [5, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 250
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            font: { family: 'Segoe UI', size: 10.5, weight: '600' },
            color: '#cbd5e1',
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#0b2545',
          padding: 8,
          cornerRadius: 6
        },
        dragData: {
          round: 0,
          showTooltip: true,
          onDragStart: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'ns-resize';
          },
          onDrag: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'ns-resize';
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleStudioPointDrag) {
              window.handleStudioPointDrag(datasetIndex, index, clamped);
            }
          },
          onDragEnd: function(e, datasetIndex, index, value) {
            if (e && e.target) e.target.style.cursor = 'default';
            const clamped = Math.max(0, Math.min(100, Math.round(value)));
            if (window.handleStudioPointDragEnd) {
              window.handleStudioPointDragEnd(datasetIndex, index, clamped);
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            color: '#94a3b8',
            font: { family: 'Segoe UI', size: 9.5 }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.08)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#cbd5e1',
            font: { family: 'Segoe UI', size: 10, weight: '700' }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  window.studioTrendChartInstance = studioTrendPreviewInstance;
}

function updateStudioTrendPreview(proData, wellData) {
  if (!studioTrendPreviewInstance) {
    initStudioTrendPreview(proData, wellData);
    return;
  }
  if (proData) studioTrendPreviewInstance.data.datasets[0].data = proData;
  if (wellData) studioTrendPreviewInstance.data.datasets[1].data = wellData;
  studioTrendPreviewInstance.update('none'); // fast update without full transition lag
}

window.initCharts = initCharts;
window.updateCharts = updateCharts;
window.initStudioTrendPreview = initStudioTrendPreview;
window.updateStudioTrendPreview = updateStudioTrendPreview;
