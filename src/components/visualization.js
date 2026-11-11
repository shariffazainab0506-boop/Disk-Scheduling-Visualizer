/**
 * Disk Head Movement Visualizer.
 * 
 * Features:
 * 1. Physical Cylinder Track (1D linear disk arm track with smooth animated arm).
 * 2. 2D Seek Trajectory Chart (classic OS textbook zig-zag seek graph).
 * 3. Step HUD (Heads-Up Display) with step-by-step distances & cumulative calculations.
 * 4. Comprehensive Playback Controls: Play, Pause, Resume, Reset, Next Step, Prev Step, Speed Slider, Step Scrubber.
 */

export class DiskVisualizer {
  constructor({
    trackContainerId,
    trajectoryContainerId,
    hudContainerId,
    controlsContainerId
  }) {
    this.trackContainer = document.getElementById(trackContainerId);
    this.trajectoryContainer = document.getElementById(trajectoryContainerId);
    this.hudContainer = document.getElementById(hudContainerId);
    this.controlsContainer = document.getElementById(controlsContainerId);

    this.currentResult = null;
    this.currentStepIndex = 0; // 0 is initial head position
    this.isPlaying = false;
    this.speedMultiplier = 1.0; // 1x = 1000ms per step
    this.timerId = null;

    this.onStepChangeCallback = null;
  }

  /**
   * Loads a new algorithm result and resets the visualizer.
   */
  loadAlgorithm(algorithmResult) {
    this.pause();
    this.currentResult = algorithmResult;
    this.currentStepIndex = 0;

    this.renderControls();
    this.render();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.2, Math.min(5.0, multiplier));
  }

  play() {
    if (!this.currentResult || this.currentResult.steps.length === 0) return;
    if (this.currentStepIndex >= this.currentResult.steps.length) {
      this.currentStepIndex = 0; // restart if at end
    }

    this.isPlaying = true;
    this.updateControlsState();
    this.scheduleNextStep();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.updateControlsState();
  }

  resume() {
    if (!this.isPlaying) {
      this.play();
    }
  }

  reset() {
    this.pause();
    this.currentStepIndex = 0;
    this.render();
    this.updateControlsState();
  }

  nextStep() {
    this.pause();
    if (!this.currentResult) return;
    if (this.currentStepIndex < this.currentResult.steps.length) {
      this.currentStepIndex++;
      this.render();
      this.updateControlsState();
    }
  }

  prevStep() {
    this.pause();
    if (!this.currentResult) return;
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.render();
      this.updateControlsState();
    }
  }

  jumpToStep(stepIndex) {
    this.pause();
    if (!this.currentResult) return;
    this.currentStepIndex = Math.max(0, Math.min(this.currentResult.steps.length, stepIndex));
    this.render();
    this.updateControlsState();
  }

  scheduleNextStep() {
    if (!this.isPlaying) return;

    if (this.currentStepIndex >= this.currentResult.steps.length) {
      this.pause();
      return;
    }

    const interval = Math.round(1000 / this.speedMultiplier);
    this.timerId = setTimeout(() => {
      if (this.isPlaying && this.currentStepIndex < this.currentResult.steps.length) {
        this.currentStepIndex++;
        this.render();
        this.updateControlsState();

        if (this.currentStepIndex < this.currentResult.steps.length) {
          this.scheduleNextStep();
        } else {
          this.pause();
        }
      }
    }, interval);
  }

  render() {
    if (!this.currentResult) {
      if (this.trackContainer) this.trackContainer.innerHTML = '<div class="empty-state">No simulation loaded. Run a simulation to visualize disk head movement.</div>';
      if (this.trajectoryContainer) this.trajectoryContainer.innerHTML = '';
      if (this.hudContainer) this.hudContainer.innerHTML = '';
      return;
    }

    this.renderHUD();
    this.renderPhysicalTrack();
    this.renderTrajectoryGraph();

    if (this.onStepChangeCallback) {
      this.onStepChangeCallback(this.currentStepIndex, this.currentResult);
    }
  }

  /**
   * Renders the Heads-Up Display (current step, positions, seek distance, cumulative movement).
   */
  renderHUD() {
    if (!this.hudContainer || !this.currentResult) return;

    const { seekSequence, steps, totalHeadMovement, initialHead } = this.currentResult;
    const totalSteps = steps.length;
    const currentStepNum = this.currentStepIndex;

    let currentPos = initialHead;
    let fromPos = initialHead;
    let toPos = initialHead;
    let stepDist = 0;
    let cumulative = 0;
    let stepDesc = 'Disk head positioned at initial cylinder.';
    let directionStr = this.currentResult.direction === 'right' ? 'Right (→ Higher)' : 'Left (← Lower)';

    if (this.currentStepIndex > 0) {
      const stepData = steps[this.currentStepIndex - 1];
      fromPos = stepData.from;
      toPos = stepData.to;
      currentPos = toPos;
      stepDist = stepData.distance;
      cumulative = stepData.cumulativeDistance;

      if (toPos > fromPos) {
        directionStr = 'Moving Right (→ Higher Cylinders)';
      } else if (toPos < fromPos) {
        directionStr = 'Moving Left (← Lower Cylinders)';
      } else {
        directionStr = 'Stationary (Same Cylinder)';
      }

      stepDesc = stepData.isServicedRequest 
        ? `Servicing cylinder ${toPos} (Seek distance: |${toPos} - ${fromPos}| = ${stepDist} cylinders)`
        : `Arm sweep to boundary cylinder ${toPos} (Distance: |${toPos} - ${fromPos}| = ${stepDist} cylinders)`;
    }

    const pct = totalSteps > 0 ? Math.round((currentStepNum / totalSteps) * 100) : 0;

    this.hudContainer.innerHTML = `
      <div class="hud-card">
        <div class="hud-metric">
          <span class="hud-label">Current Step</span>
          <span class="hud-value"><span class="highlight-cyan">${currentStepNum}</span> <span class="dim">/ ${totalSteps}</span></span>
        </div>
        <div class="hud-metric">
          <span class="hud-label">Head Position</span>
          <span class="hud-value highlight-gold">Cylinder ${currentPos}</span>
        </div>
        <div class="hud-metric">
          <span class="hud-label">Step Seek Distance</span>
          <span class="hud-value highlight-purple">${this.currentStepIndex === 0 ? '-' : `|${toPos} − ${fromPos}| = ${stepDist}`}</span>
        </div>
        <div class="hud-metric">
          <span class="hud-label">Cumulative Movement</span>
          <span class="hud-value highlight-green">${cumulative} <span class="hud-unit">/ ${totalHeadMovement} cyl</span></span>
        </div>
        <div class="hud-metric">
          <span class="hud-label">Arm Direction</span>
          <span class="hud-value hud-direction">${directionStr}</span>
        </div>
      </div>
      <div class="hud-description-bar">
        <span class="hud-status-badge ${this.currentStepIndex === totalSteps ? 'complete' : 'active'}">
          ${this.currentStepIndex === totalSteps ? 'COMPLETED' : this.currentStepIndex === 0 ? 'STARTING' : 'IN PROGRESS'}
        </span>
        <span class="hud-step-text">${stepDesc}</span>
        <span class="hud-progress-pct">${pct}%</span>
      </div>
    `;
  }

  /**
   * Renders the 1D physical disk track with platter ruler, cylinders, markers, and disk head arm.
   */
  renderPhysicalTrack() {
    if (!this.trackContainer || !this.currentResult) return;

    const { diskSize, initialHead, seekSequence } = this.currentResult;
    const currentPos = seekSequence[this.currentStepIndex];

    // Collect visited cylinders up to current step
    const visitedSet = new Set(seekSequence.slice(0, this.currentStepIndex + 1));
    const allServicedRequests = this.currentResult.servicedRequests || [];
    const pendingSet = new Set(allServicedRequests.filter(r => !visitedSet.has(r)));

    // Calculate percentage positions
    const maxCyl = diskSize - 1;
    const toPct = (cyl) => ((cyl / maxCyl) * 100).toFixed(2);

    // Generate ruler ticks (e.g., every 25 or 50 cylinders depending on diskSize)
    const tickInterval = diskSize <= 100 ? 10 : diskSize <= 300 ? 25 : 50;
    const ticks = [];
    for (let c = 0; c <= maxCyl; c += tickInterval) {
      ticks.push(c);
    }
    if (ticks[ticks.length - 1] !== maxCyl) {
      ticks.push(maxCyl);
    }

    const ticksHtml = ticks.map(cyl => `
      <div class="track-tick" style="left: ${toPct(cyl)}%">
        <span class="track-tick-line"></span>
        <span class="track-tick-label">${cyl}</span>
      </div>
    `).join('');

    // Unique cylinder requests markers
    const uniqueRequests = [...new Set(this.currentResult.servicedRequests)];
    const markersHtml = uniqueRequests.map(cyl => {
      const isInitial = cyl === initialHead;
      const isCompleted = visitedSet.has(cyl);
      const isCurrent = cyl === currentPos;

      let statusClass = 'pending';
      let title = `Cylinder ${cyl} (Pending Request)`;
      if (isCompleted) {
        statusClass = 'completed';
        title = `Cylinder ${cyl} (Serviced Request)`;
      }
      if (isCurrent) {
        statusClass = 'current';
        title = `Cylinder ${cyl} (Current Head Position)`;
      }

      return `
        <div class="cylinder-marker ${statusClass} ${isInitial ? 'is-initial' : ''}" 
             style="left: ${toPct(cyl)}%" 
             title="${title}"
             data-cylinder="${cyl}">
          <div class="marker-pin"></div>
          <div class="marker-badge">${cyl}</div>
        </div>
      `;
    }).join('');

    // Boundary indicators (0 and maxCyl)
    const boundariesHtml = `
      <div class="boundary-marker start" style="left: 0%" title="Cylinder 0 (Inner Boundary)">
        <div class="boundary-line"></div>
        <span class="boundary-label">0</span>
      </div>
      <div class="boundary-marker end" style="left: 100%" title="Cylinder ${maxCyl} (Outer Boundary)">
        <div class="boundary-line"></div>
        <span class="boundary-label">${maxCyl}</span>
      </div>
    `;

    // Disk Head Slider / Needle
    const headPct = toPct(currentPos);
    const headHtml = `
      <div class="disk-head-arm" style="left: ${headPct}%">
        <div class="head-pointer">
          <div class="head-arrow">▼</div>
          <div class="head-glow"></div>
        </div>
        <div class="head-tag">HEAD: ${currentPos}</div>
      </div>
    `;

    // Covered path track highlight
    let pathSegmentsHtml = '';
    for (let i = 0; i < this.currentStepIndex; i++) {
      const from = seekSequence[i];
      const to = seekSequence[i + 1];
      const left = Math.min(from, to);
      const right = Math.max(from, to);
      const leftPct = toPct(left);
      const widthPct = Math.max(0.5, ((right - left) / maxCyl) * 100).toFixed(2);
      pathSegmentsHtml += `
        <div class="track-history-segment" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
      `;
    }

    this.trackContainer.innerHTML = `
      <div class="track-outer-frame">
        <div class="track-header-meta">
          <span class="track-title"><i class="icon-disk"></i> Physical Cylinder Track (0 – ${maxCyl})</span>
          <span class="track-legend-inline">
            <span class="legend-chip head-chip">● Head (${currentPos})</span>
            <span class="legend-chip pending-chip">● Pending</span>
            <span class="legend-chip completed-chip">● Serviced</span>
          </span>
        </div>
        <div class="track-rail-container">
          <div class="track-rail">
            ${pathSegmentsHtml}
            ${headHtml}
            ${markersHtml}
            ${boundariesHtml}
          </div>
          <div class="track-ticks-ruler">
            ${ticksHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the 2D Seek Trajectory Chart (OS Textbook Classic Graph).
   * X-axis: Cylinder Numbers (0 to diskSize - 1)
   * Y-axis: Time / Step Sequence (Step 0 downwards to Step N)
   */
  renderTrajectoryGraph() {
    if (!this.trajectoryContainer || !this.currentResult) return;

    const { diskSize, seekSequence, steps, initialHead } = this.currentResult;
    const totalSteps = seekSequence.length - 1;
    const maxCyl = diskSize - 1;

    // SVG coordinate space
    const width = 800;
    const height = Math.max(260, Math.min(500, (totalSteps + 1) * 36 + 60));
    const padding = { top: 30, right: 40, bottom: 40, left: 50 };

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const scaleX = (cyl) => padding.left + (cyl / maxCyl) * graphWidth;
    const scaleY = (stepIdx) => padding.top + (totalSteps > 0 ? (stepIdx / totalSteps) * graphHeight : graphHeight / 2);

    // Vertical grid lines (cylinders)
    const tickInterval = diskSize <= 100 ? 10 : diskSize <= 300 ? 25 : 50;
    const ticks = [];
    for (let c = 0; c <= maxCyl; c += tickInterval) ticks.push(c);
    if (ticks[ticks.length - 1] !== maxCyl) ticks.push(maxCyl);

    const vGrid = ticks.map(cyl => {
      const x = scaleX(cyl);
      return `
        <line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}" class="svg-grid-line" />
        <text x="${x}" y="${height - padding.bottom + 18}" class="svg-axis-label" text-anchor="middle">${cyl}</text>
      `;
    }).join('');

    // Horizontal grid lines (steps)
    const hGrid = seekSequence.map((_, idx) => {
      const y = scaleY(idx);
      return `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" class="svg-step-line" />
        <text x="${padding.left - 12}" y="${y + 4}" class="svg-step-label" text-anchor="end">#${idx}</text>
      `;
    }).join('');

    // Build the completed trajectory paths up to currentStepIndex
    let pathData = '';
    const linesHtml = [];
    for (let i = 0; i < this.currentStepIndex; i++) {
      const x1 = scaleX(seekSequence[i]);
      const y1 = scaleY(i);
      const x2 = scaleX(seekSequence[i + 1]);
      const y2 = scaleY(i + 1);

      const step = steps[i];
      // Check if this step is a circular jump (e.g., C-SCAN from boundary to boundary or C-LOOK jump)
      const isJump = (seekSequence[i] === maxCyl && seekSequence[i + 1] === 0) ||
                     (seekSequence[i] === 0 && seekSequence[i + 1] === maxCyl) ||
                     (!step.isServicedRequest && step.distance > diskSize * 0.4);

      linesHtml.push(`
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              class="trajectory-line ${isJump ? 'trajectory-jump' : 'trajectory-active'}" />
      `);
    }

    // Future (unvisited) dotted trajectory lines
    const futureLinesHtml = [];
    for (let i = this.currentStepIndex; i < totalSteps; i++) {
      const x1 = scaleX(seekSequence[i]);
      const y1 = scaleY(i);
      const x2 = scaleX(seekSequence[i + 1]);
      const y2 = scaleY(i + 1);
      futureLinesHtml.push(`
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="trajectory-future" />
      `);
    }

    // Nodes (cylinder points at each step)
    const nodesHtml = seekSequence.map((cyl, idx) => {
      const x = scaleX(cyl);
      const y = scaleY(idx);
      const isPast = idx < this.currentStepIndex;
      const isCurrent = idx === this.currentStepIndex;
      const isFuture = idx > this.currentStepIndex;
      const isInitial = idx === 0;

      let nodeClass = isCurrent ? 'node-current' : isPast ? 'node-past' : 'node-future';
      if (isInitial) nodeClass += ' node-initial';

      return `
        <g class="trajectory-node-group ${nodeClass}" data-step="${idx}">
          ${isCurrent ? `<circle cx="${x}" cy="${y}" r="11" class="node-glow" />` : ''}
          <circle cx="${x}" cy="${y}" r="${isCurrent ? 7 : 5}" class="node-circle" />
          <text x="${x}" y="${y - 9}" class="node-cyl-text" text-anchor="middle">${cyl}</text>
        </g>
      `;
    }).join('');

    this.trajectoryContainer.innerHTML = `
      <div class="trajectory-frame">
        <div class="trajectory-header">
          <span class="trajectory-title"><i class="icon-graph"></i> 2D Seek Trajectory Graph (OS Textbook Visualization)</span>
          <span class="trajectory-caption">Horizontal axis: Cylinder (0–${maxCyl}) | Vertical axis: Step Sequence (#0 to #${totalSteps})</span>
        </div>
        <div class="svg-responsive-wrapper">
          <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" class="trajectory-svg">
            <g class="grid-group">
              ${vGrid}
              ${hGrid}
            </g>
            <g class="future-lines-group">
              ${futureLinesHtml.join('')}
            </g>
            <g class="trajectory-lines-group">
              ${linesHtml.join('')}
            </g>
            <g class="nodes-group">
              ${nodesHtml}
            </g>
          </svg>
        </div>
      </div>
    `;
  }

  /**
   * Renders Play, Pause, Step Next, Step Prev, Speed, Scrubber controls.
   */
  renderControls() {
    if (!this.controlsContainer) return;

    const totalSteps = this.currentResult ? this.currentResult.steps.length : 0;

    this.controlsContainer.innerHTML = `
      <div class="playback-controls-bar">
        <div class="controls-left">
          <button id="ctrl-reset" class="ctrl-btn" title="Reset to start">
            <span class="btn-icon">⏮</span> Reset
          </button>
          <button id="ctrl-prev" class="ctrl-btn" title="Previous step">
            <span class="btn-icon">◀</span> Prev Step
          </button>
          <button id="ctrl-play" class="ctrl-btn btn-primary" title="Play animation">
            <span class="btn-icon">▶</span> Play
          </button>
          <button id="ctrl-pause" class="ctrl-btn btn-secondary" title="Pause animation" style="display: none;">
            <span class="btn-icon">⏸</span> Pause
          </button>
          <button id="ctrl-next" class="ctrl-btn" title="Next step">
            Next Step <span class="btn-icon">▶</span>
          </button>
        </div>

        <div class="controls-center scrubber-wrap">
          <span class="scrubber-label">Seek Step:</span>
          <input type="range" id="ctrl-scrubber" min="0" max="${totalSteps}" value="${this.currentStepIndex}" class="step-scrubber" />
          <span id="scrubber-val" class="scrubber-count">${this.currentStepIndex} / ${totalSteps}</span>
        </div>

        <div class="controls-right speed-wrap">
          <span class="speed-label">Speed:</span>
          <select id="ctrl-speed" class="speed-select">
            <option value="0.25">0.25x (Very Slow)</option>
            <option value="0.5">0.5x (Slow)</option>
            <option value="1" selected>1.0x (Normal)</option>
            <option value="2">2.0x (Fast)</option>
            <option value="4">4.0x (Super Fast)</option>
          </select>
        </div>
      </div>
    `;

    // Bind event listeners
    const btnPlay = document.getElementById('ctrl-play');
    const btnPause = document.getElementById('ctrl-pause');
    const btnReset = document.getElementById('ctrl-reset');
    const btnPrev = document.getElementById('ctrl-prev');
    const btnNext = document.getElementById('ctrl-next');
    const scrubber = document.getElementById('ctrl-scrubber');
    const speedSelect = document.getElementById('ctrl-speed');

    btnPlay.addEventListener('click', () => this.play());
    btnPause.addEventListener('click', () => this.pause());
    btnReset.addEventListener('click', () => this.reset());
    btnPrev.addEventListener('click', () => this.prevStep());
    btnNext.addEventListener('click', () => this.nextStep());

    scrubber.addEventListener('input', (e) => {
      this.jumpToStep(parseInt(e.target.value, 10));
    });

    speedSelect.addEventListener('change', (e) => {
      this.setSpeed(parseFloat(e.target.value));
    });
  }

  updateControlsState() {
    const btnPlay = document.getElementById('ctrl-play');
    const btnPause = document.getElementById('ctrl-pause');
    const btnPrev = document.getElementById('ctrl-prev');
    const btnNext = document.getElementById('ctrl-next');
    const scrubber = document.getElementById('ctrl-scrubber');
    const scrubberVal = document.getElementById('scrubber-val');

    if (!btnPlay || !this.currentResult) return;

    const totalSteps = this.currentResult.steps.length;

    if (this.isPlaying) {
      btnPlay.style.display = 'none';
      btnPause.style.display = 'inline-flex';
    } else {
      btnPlay.style.display = 'inline-flex';
      btnPause.style.display = 'none';
    }

    if (btnPrev) btnPrev.disabled = this.currentStepIndex <= 0;
    if (btnNext) btnNext.disabled = this.currentStepIndex >= totalSteps;

    if (scrubber) {
      scrubber.value = this.currentStepIndex;
    }
    if (scrubberVal) {
      scrubberVal.textContent = `${this.currentStepIndex} / ${totalSteps}`;
    }
  }
}
