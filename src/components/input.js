import { validateInput, parseRequestQueue } from '../utils/validation.js';
import { SAMPLE_PRESETS, generateRandomDataset } from '../data/sampleData.js';

/**
 * Disk Input Component.
 * Handles user input forms, presets, validation feedback, and custom request queues.
 */
export class DiskInputComponent {
  constructor({
    containerId,
    onRunSimulation,
    onCompareAll
  }) {
    this.container = document.getElementById(containerId);
    this.onRunSimulation = onRunSimulation;
    this.onCompareAll = onCompareAll;

    // Default active configuration (matching VTU Prompt default)
    this.state = {
      queueStr: '82, 170, 43, 140, 24, 16, 190',
      initialHead: 50,
      diskSize: 200,
      direction: 'right',
      seekRate: 0.1
    };
  }

  render() {
    if (!this.container) return;

    const presetButtonsHtml = SAMPLE_PRESETS.map(p => `
      <button type="button" class="btn-preset-pill" data-preset-id="${p.id}" title="${p.description}">
        ${p.title}
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="input-component-wrapper">
        <div class="input-header-row">
          <div>
            <h2 class="section-title"><i class="icon-sliders"></i> Disk Parameters & Request Configuration</h2>
            <p class="section-desc">Specify disk geometry, starting cylinder, initial direction, and the arrival request queue.</p>
          </div>
          <div class="input-header-actions">
            <button type="button" id="btn-quick-random" class="btn btn-secondary">
              🎲 Generate Random Queue
            </button>
            <button type="button" id="btn-input-reset" class="btn btn-ghost">
              🔄 Reset to Default
            </button>
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="presets-bar">
          <span class="presets-label">Academic Presets:</span>
          <div class="presets-list">
            ${presetButtonsHtml}
          </div>
        </div>

        <!-- Validation Messages Alert Container -->
        <div id="validation-alert-box" class="validation-container" style="display: none;"></div>

        <!-- Main Input Form Grid -->
        <form id="disk-input-form" class="disk-form">
          <div class="form-grid-3">
            <!-- Initial Head Position -->
            <div class="form-group">
              <label for="inp-initial-head" class="form-label">
                Initial Head Position <span class="required">*</span>
                <span class="label-hint">Starting cylinder (0 to Disk Size − 1)</span>
              </label>
              <div class="input-wrapper">
                <input type="number" id="inp-initial-head" class="form-input" 
                       min="0" value="${this.state.initialHead}" required />
                <span class="input-suffix">Cylinder</span>
              </div>
            </div>

            <!-- Total Disk Cylinders (Disk Size) -->
            <div class="form-group">
              <label for="inp-disk-size" class="form-label">
                Total Disk Cylinders <span class="required">*</span>
                <span class="label-hint">e.g. 200 = Cylinders 0 to 199</span>
              </label>
              <div class="input-wrapper">
                <input type="number" id="inp-disk-size" class="form-input" 
                       min="2" value="${this.state.diskSize}" required />
                <span class="input-suffix">Cylinders</span>
              </div>
            </div>

            <!-- Seek Rate Assumption -->
            <div class="form-group">
              <label for="inp-seek-rate" class="form-label">
                Seek Rate Assumption (Optional)
                <span class="label-hint">Estimated hardware seek speed</span>
              </label>
              <div class="input-wrapper">
                <input type="number" id="inp-seek-rate" class="form-input" 
                       step="0.01" min="0.01" value="${this.state.seekRate}" />
                <span class="input-suffix">ms / cyl</span>
              </div>
            </div>
          </div>

          <!-- Initial Direction Selection -->
          <div class="form-group direction-group">
            <label class="form-label">
              Initial Disk-Head Direction <span class="required">*</span>
              <span class="label-hint">Crucial for SCAN, C-SCAN, LOOK, and C-LOOK</span>
            </label>
            <div class="direction-toggle-group">
              <label class="direction-radio-card ${this.state.direction === 'right' ? 'selected' : ''}">
                <input type="radio" name="direction-choice" value="right" ${this.state.direction === 'right' ? 'checked' : ''} />
                <div class="dir-content">
                  <span class="dir-icon">➡️</span>
                  <div class="dir-info">
                    <strong>Right / Increasing</strong>
                    <small>Towards higher cylinder indices (e.g., towards ${this.state.diskSize - 1})</small>
                  </div>
                </div>
              </label>

              <label class="direction-radio-card ${this.state.direction === 'left' ? 'selected' : ''}">
                <input type="radio" name="direction-choice" value="left" ${this.state.direction === 'left' ? 'checked' : ''} />
                <div class="dir-content">
                  <span class="dir-icon">⬅️</span>
                  <div class="dir-info">
                    <strong>Left / Decreasing</strong>
                    <small>Towards lower cylinder indices (e.g., towards cylinder 0)</small>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Request Queue Textarea -->
          <div class="form-group">
            <div class="queue-label-row">
              <label for="inp-queue" class="form-label">
                Disk Request Queue <span class="required">*</span>
                <span class="label-hint">Comma or space-separated list of cylinder numbers</span>
              </label>
              <span id="queue-count-badge" class="queue-badge">7 requests</span>
            </div>
            <textarea id="inp-queue" class="form-textarea" rows="3" 
                      placeholder="e.g. 82, 170, 43, 140, 24, 16, 190">${this.state.queueStr}</textarea>
            <div class="textarea-hint">
              <span>Enter cylinders within range <code>0</code> to <code><span id="max-cyl-hint">${this.state.diskSize - 1}</span></code>.</span>
              <button type="button" id="btn-clean-format" class="btn-clean-text">Format & Clean Input</button>
            </div>
          </div>

          <!-- Action Buttons Bar -->
          <div class="form-actions-bar">
            <button type="submit" id="btn-run-simulation" class="btn btn-primary btn-lg">
              <span>▶</span> Run Simulation & Comparison
            </button>
            <button type="button" id="btn-view-comparison" class="btn btn-secondary btn-lg">
              <span>📊</span> Direct Comparison View
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindEvents();
    this.updateQueueCount();
  }

  bindEvents() {
    const form = document.getElementById('disk-input-form');
    const queueInput = document.getElementById('inp-queue');
    const headInput = document.getElementById('inp-initial-head');
    const sizeInput = document.getElementById('inp-disk-size');
    const rateInput = document.getElementById('inp-seek-rate');
    const maxHint = document.getElementById('max-cyl-hint');
    const resetBtn = document.getElementById('btn-input-reset');
    const randomBtn = document.getElementById('btn-quick-random');
    const cleanBtn = document.getElementById('btn-clean-format');
    const directCompareBtn = document.getElementById('btn-view-comparison');

    // Direction card styling sync
    const dirCards = this.container.querySelectorAll('.direction-radio-card');
    dirCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      radio.addEventListener('change', () => {
        dirCards.forEach(c => c.classList.remove('selected'));
        if (radio.checked) {
          card.classList.add('selected');
          this.state.direction = radio.value;
        }
      });
    });

    // Update max cylinder hint when disk size changes
    sizeInput.addEventListener('input', () => {
      const sizeVal = parseInt(sizeInput.value, 10);
      if (!isNaN(sizeVal) && sizeVal >= 1) {
        maxHint.textContent = `${sizeVal - 1}`;
      }
    });

    // Queue count live badge
    queueInput.addEventListener('input', () => {
      this.updateQueueCount();
    });

    // Clean formatting button
    cleanBtn?.addEventListener('click', () => {
      const parsed = parseRequestQueue(queueInput.value);
      queueInput.value = parsed.join(', ');
      this.updateQueueCount();
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
      this.applyPreset(SAMPLE_PRESETS[0]);
    });

    // Random dataset button
    randomBtn?.addEventListener('click', () => {
      const size = parseInt(sizeInput.value, 10) || 200;
      const rnd = generateRandomDataset(8, size);
      this.applyPreset(rnd);
    });

    // Preset pills
    this.container.querySelectorAll('.btn-preset-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-preset-id');
        const preset = SAMPLE_PRESETS.find(p => p.id === id);
        if (preset) {
          this.applyPreset(preset);
        }
      });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    directCompareBtn?.addEventListener('click', () => {
      this.handleSubmit(true);
    });
  }

  updateQueueCount() {
    const queueInput = document.getElementById('inp-queue');
    const badge = document.getElementById('queue-count-badge');
    if (!queueInput || !badge) return;

    const parsed = parseRequestQueue(queueInput.value);
    badge.textContent = `${parsed.length} request${parsed.length === 1 ? '' : 's'}`;
  }

  applyPreset(preset) {
    const queueInput = document.getElementById('inp-queue');
    const headInput = document.getElementById('inp-initial-head');
    const sizeInput = document.getElementById('inp-disk-size');
    const rateInput = document.getElementById('inp-seek-rate');
    const maxHint = document.getElementById('max-cyl-hint');

    queueInput.value = preset.requests.join(', ');
    headInput.value = preset.initialHead;
    sizeInput.value = preset.diskSize;
    if (rateInput) rateInput.value = preset.seekRate || 0.1;
    if (maxHint) maxHint.textContent = `${preset.diskSize - 1}`;

    // Direction
    const dirRadios = document.getElementsByName('direction-choice');
    dirRadios.forEach(r => {
      r.checked = r.value === preset.direction;
      const parent = r.closest('.direction-radio-card');
      if (parent) {
        parent.classList.toggle('selected', r.value === preset.direction);
      }
    });

    this.state.direction = preset.direction;
    this.updateQueueCount();
    this.hideAlerts();
  }

  handleSubmit(directToComparison = false) {
    const queueInput = document.getElementById('inp-queue');
    const headInput = document.getElementById('inp-initial-head');
    const sizeInput = document.getElementById('inp-disk-size');
    const rateInput = document.getElementById('inp-seek-rate');

    const selectedDir = document.querySelector('input[name="direction-choice"]:checked')?.value || 'right';

    const validation = validateInput({
      queueStr: queueInput.value,
      initialHeadStr: headInput.value,
      diskSizeStr: sizeInput.value,
      direction: selectedDir,
      seekRateStr: rateInput.value
    });

    if (!validation.isValid) {
      this.showAlerts(validation.errors, 'error');
      return;
    }

    if (validation.warnings.length > 0) {
      this.showAlerts(validation.warnings, 'warning');
    } else {
      this.hideAlerts();
    }

    this.state = {
      queueStr: queueInput.value,
      ...validation.cleanData
    };

    if (this.onRunSimulation) {
      this.onRunSimulation(validation.cleanData, directToComparison);
    }
  }

  showAlerts(messages, type = 'error') {
    const box = document.getElementById('validation-alert-box');
    if (!box) return;

    box.style.display = 'block';
    box.className = `validation-container alert-${type}`;

    const icon = type === 'error' ? '❌' : '⚠️';
    const title = type === 'error' ? 'Input Validation Errors' : 'Simulation Notice';

    box.innerHTML = `
      <div class="alert-header">
        <span class="alert-icon">${icon}</span>
        <strong>${title}</strong>
      </div>
      <ul class="alert-list">
        ${messages.map(m => `<li>${m}</li>`).join('')}
      </ul>
    `;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  hideAlerts() {
    const box = document.getElementById('validation-alert-box');
    if (box) {
      box.style.display = 'none';
      box.innerHTML = '';
    }
  }
}
