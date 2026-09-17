/* ==========================================================================
   CHARTS MODULE (Chart.js Integration - Material Dashboard Theme)
   Powers the Authentic Trend dual-line chart and 6-Month Forecast bar chart
   Engineered for clean, fluid responsiveness and Material Design aesthetics.
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
          label: 'Professional Impact',
          data: proImpact,
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.08)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#1a73e8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderDash: []
        },
        {
          label: 'Personal Well-being',
          data: wellbeing,
          borderColor: '#fb8c00',
          backgroundColor: 'transparent',
          borderWidth: 2.2,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: '#fb8c00',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#344767',
          titleFont: { family: 'Inter', size: 12, weight: 'bold' },
          bodyFont: { family: 'Inter', size: 11 },
          padding: 10,
          cornerRadius: 8,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#7b809a',
            font: { family: 'Inter', size: 11, weight: '500' }
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            stepSize: 25,
            color: '#7b809a',
            font: { family: 'Inter', size: 10 }
          }
        }
      }
    }
  });
}

function calculateTargetTrajectory(values) {
  if (!values || values.length === 0) return [];
  // Calculate a smooth smoothed target curve that directly aligns with the tops of the bars
  return values.map((val, idx) => {
    // Slight target elevation representing forward momentum
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
          backgroundColor: '#344767',
          borderRadius: 6,
          barPercentage: 0.65
        },
        {
          type: 'line',
          label: 'Target Trajectory',
          data: trajectoryLine,
          borderColor: '#1a73e8',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 4,
          pointBackgroundColor: '#1a73e8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          tension: 0.35,
          fill: false
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
          backgroundColor: '#344767',
          titleFont: { family: 'Inter', size: 11, weight: 'bold' },
          bodyFont: { family: 'Inter', size: 10 },
          padding: 8,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#7b809a',
            font: { family: 'Inter', size: 10, weight: '600' },
            autoSkip: false,
            maxRotation: 0
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            stepSize: 25,
            color: '#7b809a',
            font: { family: 'Inter', size: 9 }
          }
        }
      }
    }
  });
}

// Global Exports
window.initCharts = initCharts;
window.updateCharts = updateCharts;
window.initTrendChart = initTrendChart;
window.initForecastChart = initForecastChart;
