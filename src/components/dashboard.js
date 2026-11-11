/**
 * Home Dashboard Component.
 * Displays project overview, introduction to disk scheduling,
 * live simulation summary metrics, and quick navigation to all 6 algorithms.
 */

export function renderDashboard(containerId, comparisonData, inputParams, callbacks) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { results, minMovement, bestAlgorithms, isTie } = comparisonData;
  const worstResult = [...results].sort((a, b) => b.totalHeadMovement - a.totalHeadMovement)[0];
  const reqCount = inputParams.requests.length;

  const algoCards = [
    {
      id: 'fcfs',
      short: 'FCFS',
      full: 'First Come First Serve',
      tag: 'Baseline Sequential',
      summary: 'Services disk requests in exact arrival sequence. Simple and fair, but prone to high arm movement.',
      color: 'accent-blue'
    },
    {
      id: 'sstf',
      short: 'SSTF',
      full: 'Shortest Seek Time First',
      tag: 'Greedy Local Optimal',
      summary: 'Always picks the pending request nearest to current head. Minimizes immediate seek, risks starvation.',
      color: 'accent-cyan'
    },
    {
      id: 'scan',
      short: 'SCAN',
      full: 'Elevator Algorithm',
      tag: 'Bidirectional Sweep',
      summary: 'Sweeps across the disk until reaching the physical boundary, then reverses direction.',
      color: 'accent-indigo'
    },
    {
      id: 'cscan',
      short: 'C-SCAN',
      full: 'Circular SCAN',
      tag: 'Uniform Wait Time',
      summary: 'Scans in one direction to the boundary, jumps to opposite boundary, and repeats.',
      color: 'accent-purple'
    },
    {
      id: 'look',
      short: 'LOOK',
      full: 'LOOK Algorithm',
      tag: 'Optimized Elevator',
      summary: 'Sweeps only up to the last pending request in the current direction before reversing.',
      color: 'accent-emerald'
    },
    {
      id: 'clook',
      short: 'C-LOOK',
      full: 'Circular LOOK',
      tag: 'Optimized Circular',
      summary: 'Moves to the extreme pending request, jumps directly to the opposite extreme request, and continues.',
      color: 'accent-amber'
    }
  ];

  const cardsHtml = algoCards.map(card => {
    const res = results.find(r => r.id === card.id);
    const isBest = res && res.isBest;
    return `
      <div class="dash-algo-card ${card.color} ${isBest ? 'card-best-glow' : ''}">
        <div class="dash-card-top">
          <span class="dash-algo-badge">${card.short}</span>
          ${isBest ? '<span class="dash-best-pill">★ Optimal</span>' : `<span class="dash-tag-pill">${card.tag}</span>`}
        </div>
        <h4>${card.full}</h4>
        <p>${card.summary}</p>
        <div class="dash-card-metrics">
          <div class="dcm-item">
            <span class="dcm-label">Total Movement</span>
            <span class="dcm-val">${res ? res.totalHeadMovement : 0} cyl</span>
          </div>
          <div class="dcm-item">
            <span class="dcm-label">Average Seek</span>
            <span class="dcm-val">${res ? res.averageHeadMovement : 0} cyl/req</span>
          </div>
        </div>
        <button class="btn-card-sim" data-algo-id="${card.id}">
          Simulate ${card.short} →
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="dashboard-wrapper">
      <!-- Hero Banner -->
      <section class="hero-card">
        <div class="hero-content">
          <div class="hero-badge">VTU Operating Systems Mini-Project (1BCS304)</div>
          <h1 class="hero-title">Disk Scheduling Algorithm Simulator</h1>
          <p class="hero-subtitle">Performance Comparison and Visualization</p>
          <p class="hero-description">
            Disk scheduling determines the order in which pending disk I/O requests are serviced by the mechanical read/write head. 
            Explore, animate, and compare all six classic OS scheduling algorithms on custom disk workloads in real time.
          </p>
          <div class="hero-actions">
            <button id="dash-start-sim" class="btn btn-primary btn-lg">
              <span>▶</span> Start Simulation
            </button>
            <button id="dash-go-compare" class="btn btn-outline btn-lg">
              <span>📊</span> View Performance Comparison
            </button>
            <button id="dash-go-input" class="btn btn-ghost btn-lg">
              <span>⚙️</span> Configure Disk Input
            </button>
          </div>
        </div>
        <div class="hero-visual-graphic">
          <div class="disk-platter-graphic">
            <div class="platter-ring ring-outer"></div>
            <div class="platter-ring ring-mid"></div>
            <div class="platter-ring ring-inner"></div>
            <div class="platter-spindle"></div>
            <div class="platter-arm"></div>
          </div>
        </div>
      </section>

      <!-- Live Statistics Strip (Calculated from active dataset) -->
      <section class="live-stats-strip">
        <div class="stat-box">
          <span class="stat-label">Active Dataset Requests</span>
          <span class="stat-value">${reqCount} <small>Cylinders</small></span>
          <span class="stat-sub">Head @ ${inputParams.initialHead} | Disk 0–${inputParams.diskSize - 1}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Optimal Algorithm(s)</span>
          <span class="stat-value highlight-cyan">${bestAlgorithms.join(' / ')}</span>
          <span class="stat-sub">${isTie ? 'Performance Tie' : 'Lowest Head Movement'}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Minimum Total Seek</span>
          <span class="stat-value highlight-green">${minMovement} <small>Cylinders</small></span>
          <span class="stat-sub">vs ${worstResult.totalHeadMovement} in ${worstResult.shortName}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Algorithms Supported</span>
          <span class="stat-value">6 <small>Engines</small></span>
          <span class="stat-sub">FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK</span>
        </div>
      </section>

      <!-- What is Disk Scheduling Section -->
      <section class="intro-concept-banner">
        <div class="intro-text">
          <h3>Why Does Disk Scheduling Matter?</h3>
          <p>
            In secondary storage systems (HDDs), moving the actuator arm across cylinders—known as <strong>Seek Time</strong>—is 
            the single slowest mechanical operation in the I/O pipeline. Intelligent scheduling reduces mechanical travel distance, 
            lowers latency, improves disk bandwidth throughput, and prevents request starvation.
          </p>
        </div>
        <div class="intro-architecture-flow">
          <span class="flow-pill">1. I/O Queue</span>
          <span class="flow-arrow">→</span>
          <span class="flow-pill">2. Validation</span>
          <span class="flow-arrow">→</span>
          <span class="flow-pill">3. Scheduler Engine</span>
          <span class="flow-arrow">→</span>
          <span class="flow-pill">4. Head Movement</span>
          <span class="flow-arrow">→</span>
          <span class="flow-pill">5. Comparison</span>
        </div>
      </section>

      <!-- Six Algorithm Cards Grid -->
      <section class="dash-algorithms-section">
        <div class="section-title-row">
          <h3>Supported Scheduling Algorithms</h3>
          <span class="section-hint">Showing live calculations for active input queue: [${inputParams.requests.join(', ')}]</span>
        </div>
        <div class="dash-cards-grid">
          ${cardsHtml}
        </div>
      </section>
    </div>
  `;

  // Bind events
  document.getElementById('dash-start-sim')?.addEventListener('click', () => {
    if (callbacks?.onNavigate) callbacks.onNavigate('simulator');
  });

  document.getElementById('dash-go-compare')?.addEventListener('click', () => {
    if (callbacks?.onNavigate) callbacks.onNavigate('comparison');
  });

  document.getElementById('dash-go-input')?.addEventListener('click', () => {
    if (callbacks?.onNavigate) callbacks.onNavigate('input');
  });

  container.querySelectorAll('.btn-card-sim').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const algoId = e.currentTarget.getAttribute('data-algo-id');
      if (callbacks?.onSimulateAlgorithm) {
        callbacks.onSimulateAlgorithm(algoId);
      }
    });
  });
}
