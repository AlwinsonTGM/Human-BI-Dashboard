/* ==========================================================================
   CHARTS MODULE (Chart.js Integration - High-Stature Executive Brief)
   Powers the Authentic Trend dual-line chart and 6-Month Forecast bar chart
   Engineered for clean, authoritative data visualization.
   ========================================================================== */

let trendChartInstance = null;
let forecastChartInstance = null;

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

  const labels = trendData.labels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const proImpact = trendData.datasets?.professionalImpact || [56, 61, 66, 80, 71, 86];
  const wellbeing = trendData.datasets?.personalWellbeing || [69, 58, 54, 68, 55, 75];

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Professional Impact Index',
          data: proImpact,
          borderColor: '#0E1B2E',
          backgroundColor: 'rgba(14, 27, 46, 0.06)',
          borderWidth: 2.25,
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0E1B2E',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderDash: []
        },
        {
          label: 'Personal Well-being Index',
          data: wellbeing,
          borderColor: '#9B7738',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#9B7738',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderDash: [5, 4]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0E1B2E',
          titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
          padding: 10,
          cornerRadius: 6,
          borderColor: 'rgba(155, 119, 56, 0.4)',
          borderWidth: 1,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#64748B',
            font: { family: 'Plus Jakarta Sans', size: labels.length > 8 ? 9.5 : 11, weight: '600' },
            autoSkip: false
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: '#E2E6EC',
            drawBorder: false,
            borderDash: [3, 3]
          },
          ticks: {
            stepSize: 25,
            color: '#64748B',
            font: { family: 'Plus Jakarta Sans', size: 10, weight: '500' }
          }
        }
      }
    }
  });
  window.trendChartInstance = trendChartInstance;
}

function calculateTargetTrajectory(values) {
  if (!values || values.length === 0) return [];
  return values.map((val) => {
    return Math.min(100, Math.round(val * 1.03));
  });
}

function initForecastChart(forecastData) {
  const ctx = document.getElementById('forecastChartCanvas');
  if (!ctx) return;

  if (forecastChartInstance) {
    forecastChartInstance.destroy();
  }

  const labels = forecastData.labels || ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const values = forecastData.values || [55, 62, 67, 72, 75, 82];
  const trajectoryLine = calculateTargetTrajectory(values);

  forecastChartInstance = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Projected Index',
          data: values,
          backgroundColor: '#0E1B2E',
          hoverBackgroundColor: '#172B48',
          borderRadius: 4,
          barPercentage: 0.65
        },
        {
          type: 'line',
          label: 'Target Trajectory',
          data: trajectoryLine,
          borderColor: '#9B7738',
          borderWidth: 2,
          borderDash: [4, 3],
          pointRadius: 4,
          pointBackgroundColor: '#9B7738',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0E1B2E',
          titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 10, weight: '500' },
          padding: 8,
          cornerRadius: 6,
          borderColor: 'rgba(155, 119, 56, 0.4)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#64748B',
            font: { family: 'Plus Jakarta Sans', size: labels.length > 8 ? 9 : 10, weight: '600' },
            autoSkip: false,
            maxRotation: labels.length > 10 ? 30 : 0
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: '#E2E6EC',
            drawBorder: false,
            borderDash: [3, 3]
          },
          ticks: {
            stepSize: 25,
            color: '#64748B',
            font: { family: 'Plus Jakarta Sans', size: 9, weight: '500' }
          }
        }
      }
    }
  });
  window.forecastChartInstance = forecastChartInstance;
}

// Global Exports
window.initCharts = initCharts;
window.updateCharts = updateCharts;
window.initTrendChart = initTrendChart;
window.initForecastChart = initForecastChart;
