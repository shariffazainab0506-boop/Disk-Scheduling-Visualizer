import './style.css';
import { runAllAlgorithms } from './algorithms/index.js';
import { DiskInputComponent } from './components/input.js';
import { DiskVisualizer } from './components/visualization.js';
import { ComparisonDashboard } from './components/comparison.js';
import { renderDashboard } from './components/dashboard.js';
import { renderLearnSection } from './components/learn.js';
import { exportComparisonToCSV, printPerformanceReport } from './utils/exportReport.js';

/**
 * Main Application Controller
 * Architecture Flow:
 * USER INPUT -> VALIDATION -> DISK SCHEDULING ENGINE -> MOVEMENT CALCULATION -> VISUALIZATION & COMPARISON -> OUTPUT
 */

class DiskSchedulingApp {
  constructor() {
    this.activeTab = 'dashboard';
    this.activeAlgoId = 'fcfs';

    // Default initial input configuration (VTU 1BCS304 Benchmark)
    this.currentInput = {
      requests: [82, 170, 43, 140, 24, 16, 190],
      initialHead: 50,
      diskSize: 200,
      direction: 'right',
      seekRate: 0.1
    };

    // Load saved settings from localStorage if valid
    this.loadSavedSettings();

    // Computed simulation state across all 6 algorithms
    this.comparisonData = null;

    // Component instances
    this.inputComponent = null;
    this.visualizer = null;
    this.comparisonDashboard = null;
  }

  init() {
    this.initComponents();
    this.bindNavigation();
    this.bindGlobalActions();
    this.runSimulationEngine(this.currentInput);
    renderLearnSection('learn-content');
    this.switchTab('dashboard');
  }

  loadSavedSettings() {
    try {
      const saved = localStorage.getItem('disk_sim_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.requests) &&
          parsed.requests.length > 0 &&
          typeof parsed.initialHead === 'number' &&
          typeof parsed.diskSize === 'number'
        ) {
          this.currentInput = parsed;
        }
      }
    } catch (e) {
      // Ignore storage parsing errors and keep defaults
    }
  }

  saveSettings(config) {
    try {
      localStorage.setItem('disk_sim_config_v1', JSON.stringify(config));
    } catch (e) {
      // Ignore storage quota errors
    }
  }

  initComponents() {
    // 1. Input Component
    this.inputComponent = new DiskInputComponent({
      containerId: 'input-component-container',
      onRunSimulation: (cleanData, directToComparison) => {
        this.currentInput = cleanData;
        this.saveSettings(cleanData);
        this.runSimulationEngine(cleanData);

        if (directToComparison) {
          this.switchTab('comparison');
        } else {
          this.switchTab('simulator');
        }
      }
    });

    // Sync initial state to input component
    this.inputComponent.state = {
      queueStr: this.currentInput.requests.join(', '),
      initialHead: this.currentInput.initialHead,
      diskSize: this.currentInput.diskSize,
      direction: this.currentInput.direction,
      seekRate: this.currentInput.seekRate
    };
    this.inputComponent.render();

    // 2. Visualizer Component
    this.visualizer = new DiskVisualizer({
      trackContainerId: 'visualizer-track',
      trajectoryContainerId: 'visualizer-trajectory',
      hudContainerId: 'visualizer-hud',
      controlsContainerId: 'visualizer-controls'
    });

    this.visualizer.onStepChangeCallback = (stepIdx, algoResult) => {
      this.updateWalkthroughSequenceHighlight(stepIdx, algoResult);
    };

    // 3. Comparison Dashboard Component
    this.comparisonDashboard = new ComparisonDashboard({
      tableContainerId: 'comparison-table-container',
      chartsContainerId: 'comparison-charts-container',
      bestBannerContainerId: 'comparison-best-banner',
      tracesContainerId: 'comparison-traces-container'
    });

    this.comparisonDashboard.onSelectAlgorithmForVisualizer = (algoId) => {
      this.selectAlgorithmInSimulator(algoId);
      this.switchTab('simulator');
    };
  }

  runSimulationEngine(inputData) {
    const { initialHead, requests, diskSize, direction, seekRate } = inputData;

    // Run all 6 scheduling algorithms identically
    this.comparisonData = runAllAlgorithms(
      initialHead,
      requests,
      diskSize,
      direction,
      seekRate
    );

    // Update Dashboard Home View
    renderDashboard('dashboard-content', this.comparisonData, inputData, {
      onNavigate: (tab) => this.switchTab(tab),
      onSimulateAlgorithm: (algoId) => {
        this.selectAlgorithmInSimulator(algoId);
        this.switchTab('simulator');
      }
    });

    // Update Comparison View
    this.comparisonDashboard.render(this.comparisonData, inputData);

    // Update Active Visualizer
    this.selectAlgorithmInSimulator(this.activeAlgoId);
  }

  selectAlgorithmInSimulator(algoId) {
    this.activeAlgoId = algoId;

    // Update pill selection states
    const pills = document.querySelectorAll('#algo-pill-group .algo-pill');
    pills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-algo') === algoId);
    });

    if (!this.comparisonData) return;

    const result = this.comparisonData.results.find(r => r.id === algoId);
    if (!result) return;

    this.visualizer.loadAlgorithm(result);
    this.updateWalkthroughCard(result);
  }

  updateWalkthroughCard(result) {
    const titleEl = document.getElementById('walkthrough-title');
    const descEl = document.getElementById('walkthrough-desc');
    const compEl = document.getElementById('walkthrough-complexity');

    if (titleEl) titleEl.textContent = `${result.name} (${result.totalHeadMovement} cylinders total)`;
    if (descEl) descEl.textContent = result.description;
    if (compEl) compEl.innerHTML = `Time Complexity: <strong>${result.timeComplexity}</strong>`;

    this.updateWalkthroughSequenceHighlight(0, result);
  }

  updateWalkthroughSequenceHighlight(currentStepIdx, result) {
    const seqBox = document.getElementById('walkthrough-sequence');
    if (!seqBox || !result) return;

    const chips = result.seekSequence.map((cyl, idx) => {
      let cls = 'seq-chip';
      if (idx === 0) cls += ' chip-initial';
      if (idx < currentStepIdx) cls += ' chip-visited';
      if (idx === currentStepIdx) cls += ' chip-current';

      return `<span class="${cls}" data-step="${idx}">${cyl}</span>`;
    }).join('<span class="seq-chip-arrow">→</span>');

    seqBox.innerHTML = chips;

    // Allow clicking any chip in the sequence to jump straight to that step!
    seqBox.querySelectorAll('.seq-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const sIdx = parseInt(e.currentTarget.getAttribute('data-step'), 10);
        this.visualizer.jumpToStep(sIdx);
      });
    });
  }

  bindNavigation() {
    const navTabs = document.querySelectorAll('.app-nav .nav-tab');
    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-tab');
        this.switchTab(target);
      });
    });

    // Simulator algorithm selector pills
    const pills = document.querySelectorAll('#algo-pill-group .algo-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const algoId = e.currentTarget.getAttribute('data-algo');
        this.selectAlgorithmInSimulator(algoId);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    // Pause animation if navigating away from simulator
    if (tabId !== 'simulator' && this.visualizer && this.visualizer.isPlaying) {
      this.visualizer.pause();
    }

    // Update nav buttons
    document.querySelectorAll('.app-nav .nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Scroll to top cleanly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindGlobalActions() {
    document.getElementById('btn-header-export')?.addEventListener('click', () => {
      exportComparisonToCSV(this.comparisonData, this.currentInput);
    });

    document.getElementById('btn-header-print')?.addEventListener('click', () => {
      this.switchTab('comparison');
      setTimeout(() => printPerformanceReport(), 250);
    });

    document.getElementById('btn-compare-csv')?.addEventListener('click', () => {
      exportComparisonToCSV(this.comparisonData, this.currentInput);
    });

    document.getElementById('btn-compare-print')?.addEventListener('click', () => {
      printPerformanceReport();
    });

    document.getElementById('btn-sim-recalculate')?.addEventListener('click', () => {
      this.switchTab('input');
    });

    document.getElementById('btn-sim-go-compare')?.addEventListener('click', () => {
      this.switchTab('comparison');
    });
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DiskSchedulingApp();
  app.init();
});
