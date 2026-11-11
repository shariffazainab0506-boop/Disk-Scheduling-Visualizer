import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * Performance Comparison Dashboard Component.
 * Manages Chart.js visualizations, comparison table, best performer highlight, and detail traces.
 */
export class ComparisonDashboard {
  constructor({
    tableContainerId,
    chartsContainerId,
    bestBannerContainerId,
    tracesContainerId
  }) {
    this.tableContainer = document.getElementById(tableContainerId);
    this.chartsContainer = document.getElementById(chartsContainerId);
    this.bestBannerContainer = document.getElementById(bestBannerContainerId);
    this.tracesContainer = document.getElementById(tracesContainerId);

    this.totalMovementChart = null;
    this.averageMovementChart = null;
    this.currentComparison = null;
    this.onSelectAlgorithmForVisualizer = null;
  }

  render(comparisonData, inputParams) {
    this.currentComparison = comparisonData;
    this.inputParams = inputParams;

    this.renderBestBanner();
    this.renderTable();
    this.renderCharts();
    this.renderStepTraces();
  }

  renderBestBanner() {
    if (!this.bestBannerContainer || !this.currentComparison) return;

    const { results, minMovement, bestAlgorithms, isTie, summaryNote } = this.currentComparison;
    
    // Find best algorithm objects
    const bestAlgos = results.filter(r => r.isBest);
    const worstAlgo = [...results].sort((a, b) => b.totalHeadMovement - a.totalHeadMovement)[0];

    const pctSavings = worstAlgo.totalHeadMovement > 0
      ? Math.round(((worstAlgo.totalHeadMovement - minMovement) / worstAlgo.totalHeadMovement) * 100)
      : 0;

    let bannerHtml = '';

    if (isTie) {
      bannerHtml = `
        <div class="best-banner tie-banner">
          <div class="banner-icon">⚖️</div>
          <div class="banner-content">
            <div class="banner-title">
              <span class="banner-tag">PERFORMANCE TIE</span>
              Multiple Algorithms Achieved Optimal Movement (${minMovement} cylinders)
            </div>
            <p class="banner-desc">
              <strong>${bestAlgorithms.join(' & ')}</strong> tied with identical minimum total head movement of <strong>${minMovement} cylinders</strong>.
            </p>
            <div class="banner-metrics">
              <span class="banner-stat">Optimal Seek: <strong>${minMovement} cyl</strong></span>
              <span class="banner-stat">Seek Reduction vs ${worstAlgo.shortName}: <strong>${pctSavings}%</strong></span>
            </div>
            <div class="banner-note">
              <em>Note:</em> The optimal algorithm varies depending on cylinder clustering, direction, and head position. In Operating Systems, elevator variants (LOOK/SCAN) offer balanced fairness and reduced mechanical wear.
            </div>
          </div>
        </div>
      `;
    } else {
      const winner = bestAlgos[0];
      bannerHtml = `
        <div class="best-banner winner-banner">
          <div class="banner-icon">🏆</div>
          <div class="banner-content">
            <div class="banner-title">
              <span class="banner-tag">BEST PERFORMER</span>
              ${winner.name} achieved Lowest Total Head Movement
            </div>
            <p class="banner-desc">
              For this workload, <strong>${winner.shortName}</strong> achieved minimum arm movement of 
              <strong>${minMovement} cylinders</strong> (Average: <strong>${winner.averageHeadMovement} cyl/req</strong>, Seek Time: <strong>~${winner.estimatedSeekTime} ms</strong>).
            </p>
            <div class="banner-metrics">
              <span class="banner-stat">Optimal Seek: <strong>${minMovement} cyl</strong></span>
              <span class="banner-stat">Savings vs ${worstAlgo.shortName}: <strong>${pctSavings}% less arm travel</strong></span>
              <span class="banner-stat">Time Complexity: <strong>${winner.timeComplexity}</strong></span>
            </div>
            <div class="banner-note">
              <em>Academic Note:</em> While ${winner.shortName} minimizes movement for this input, no disk scheduling algorithm is universally superior under all workloads. SSTF risks starvation; SCAN/LOOK provide starvation-free elevator service.
            </div>
          </div>
        </div>
      `;
    }

    this.bestBannerContainer.innerHTML = bannerHtml;
  }

  renderTable() {
    if (!this.tableContainer || !this.currentComparison) return;

    const { results, minMovement } = this.currentComparison;

    const rowsHtml = results.map(r => {
      const isWinner = r.isBest;
      const rowClass = isWinner ? 'winner-row' : '';
      const badgeHtml = isWinner 
        ? `<span class="badge badge-winner">${this.currentComparison.isTie ? 'Tied Best' : '★ Best Performer'}</span>`
        : `<span class="badge badge-standard">${r.timeComplexity}</span>`;

      // Format seek sequence with arrows
      const formattedSeq = r.seekSequence.map((cyl, i) => {
        const isInit = i === 0;
        return `<span class="seq-node ${isInit ? 'seq-init' : ''}">${cyl}</span>`;
      }).join('<span class="seq-arrow">→</span>');

      return `
        <tr class="${rowClass}">
          <td class="col-algo">
            <div class="algo-name-cell">
              <strong>${r.shortName}</strong>
              <small class="algo-full-title">${r.name}</small>
            </div>
          </td>
          <td class="col-seq">
            <div class="seq-scroll-wrapper">${formattedSeq}</div>
          </td>
          <td class="col-movement text-right">
            <span class="metric-highlight ${isWinner ? 'winner-val' : ''}">${r.totalHeadMovement}</span>
            <span class="metric-unit">cyl</span>
          </td>
          <td class="col-avg text-right">
            <span>${r.averageHeadMovement}</span>
            <span class="metric-unit">cyl/req</span>
          </td>
          <td class="col-seek text-right">
            <span>${r.estimatedSeekTime}</span>
            <span class="metric-unit">ms</span>
          </td>
          <td class="col-status text-center">
            ${badgeHtml}
          </td>
          <td class="col-actions text-center">
            <button class="btn-table-visualize" data-algo-id="${r.id}" title="Visualize this algorithm in the animation pane">
              Inspect ▶
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.tableContainer.innerHTML = `
      <div class="table-responsive">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Seek Sequence</th>
              <th class="text-right">Total Head Movement</th>
              <th class="text-right">Average Movement</th>
              <th class="text-right">Est. Seek Time</th>
              <th class="text-center">Evaluation</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    // Bind visualize buttons in table
    const buttons = this.tableContainer.querySelectorAll('.btn-table-visualize');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const algoId = e.currentTarget.getAttribute('data-algo-id');
        if (this.onSelectAlgorithmForVisualizer) {
          this.onSelectAlgorithmForVisualizer(algoId);
        }
      });
    });
  }

  renderCharts() {
    if (!this.chartsContainer || !this.currentComparison) return;

    this.chartsContainer.innerHTML = `
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h4><i class="icon-bar"></i> Total Head Movement Comparison</h4>
            <span class="chart-subtitle">Lower is better (Cylinders)</span>
          </div>
          <div class="chart-canvas-container">
            <canvas id="chart-total-movement"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <h4><i class="icon-bar"></i> Average Movement per Request</h4>
            <span class="chart-subtitle">Cylinders per I/O Request</span>
          </div>
          <div class="chart-canvas-container">
            <canvas id="chart-average-movement"></canvas>
          </div>
        </div>
      </div>
    `;

    const { results } = this.currentComparison;
    const labels = results.map(r => r.shortName);
    const totalData = results.map(r => r.totalHeadMovement);
    const avgData = results.map(r => r.averageHeadMovement);

    // Color palette matching dark navy theme
    const backgroundColors = results.map(r =>
      r.isBest ? 'rgba(56, 189, 248, 0.85)' : 'rgba(99, 102, 241, 0.65)'
    );
    const borderColors = results.map(r =>
      r.isBest ? '#38bdf8' : '#818cf8'
    );

    // Destroy existing chart instances if any
    if (this.totalMovementChart) this.totalMovementChart.destroy();
    if (this.averageMovementChart) this.averageMovementChart.destroy();

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#38bdf8',
          bodyColor: '#f1f5f9',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => ` Movement: ${ctx.parsed.y} cylinders`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter, sans-serif', size: 12, weight: '600' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter, sans-serif' } }
        }
      }
    };

    const ctxTotal = document.getElementById('chart-total-movement').getContext('2d');
    this.totalMovementChart = new Chart(ctxTotal, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: totalData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` Total Movement: ${ctx.parsed.y} cylinders`
            }
          }
        }
      }
    });

    const ctxAvg = document.getElementById('chart-average-movement').getContext('2d');
    this.averageMovementChart = new Chart(ctxAvg, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: avgData,
          backgroundColor: results.map(r => r.isBest ? 'rgba(52, 211, 153, 0.85)' : 'rgba(168, 85, 247, 0.65)'),
          borderColor: results.map(r => r.isBest ? '#34d399' : '#c084fc'),
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (ctx) => ` Average Movement: ${ctx.parsed.y} cyl/request`
            }
          }
        }
      }
    });
  }

  renderStepTraces() {
    if (!this.tracesContainer || !this.currentComparison) return;

    const { results } = this.currentComparison;

    const cardsHtml = results.map(r => {
      const stepsHtml = r.steps.map(s => `
        <tr class="${s.isServicedRequest ? 'trace-serviced' : 'trace-sweep'}">
          <td>#${s.step}</td>
          <td>${s.from} → <strong>${s.to}</strong></td>
          <td class="text-right">|${s.to} − ${s.from}| = <strong>${s.distance}</strong></td>
          <td class="text-right"><strong>${s.cumulativeDistance}</strong> cyl</td>
          <td><span class="trace-tag ${s.isServicedRequest ? 'tag-service' : 'tag-boundary'}">${s.isServicedRequest ? 'Request Serviced' : 'Boundary Sweep'}</span></td>
        </tr>
      `).join('');

      return `
        <div class="trace-accordion-card">
          <div class="trace-header" data-target="trace-${r.id}">
            <div class="trace-title">
              <span class="trace-badge ${r.isBest ? 'badge-best' : ''}">${r.shortName}</span>
              <strong>${r.name}</strong>
            </div>
            <div class="trace-quick-stats">
              <span>Total: <strong>${r.totalHeadMovement}</strong> cyl</span>
              <span class="accordion-arrow">▼</span>
            </div>
          </div>
          <div id="trace-${r.id}" class="trace-body collapsed">
            <p class="trace-desc">${r.description}</p>
            <div class="table-responsive">
              <table class="trace-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Head Movement Path</th>
                    <th class="text-right">Distance Calculation</th>
                    <th class="text-right">Cumulative Seek</th>
                    <th>Action Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${stepsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.tracesContainer.innerHTML = `
      <div class="traces-wrapper">
        <div class="traces-title-bar">
          <h3><i class="icon-trace"></i> Mathematical Execution Traces</h3>
          <p class="traces-sub">Expand any algorithm below to inspect step-by-step cylinder seek calculations.</p>
        </div>
        ${cardsHtml}
      </div>
    `;

    // Bind accordion toggles
    const headers = this.tracesContainer.querySelectorAll('.trace-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        const body = document.getElementById(targetId);
        const arrow = header.querySelector('.accordion-arrow');
        if (body) {
          const isCollapsed = body.classList.contains('collapsed');
          body.classList.toggle('collapsed', !isCollapsed);
          arrow.textContent = isCollapsed ? '▲' : '▼';
        }
      });
    });
  }
}
