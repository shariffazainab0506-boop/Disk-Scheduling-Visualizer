/**
 * Export and Print Utilities for Disk Scheduling Simulation.
 */

/**
 * Exports performance comparison data to a downloadable CSV file.
 */
export function exportComparisonToCSV(comparisonData, inputParams) {
  if (!comparisonData || !comparisonData.results) {
    alert('No simulation results available to export. Please run a simulation first.');
    return;
  }

  const { results, minMovement, bestAlgorithms } = comparisonData;
  const { initialHead, requests, diskSize, direction, seekRate } = inputParams;

  const lines = [];

  // Header and Metadata
  lines.push('DISK SCHEDULING ALGORITHM SIMULATOR - PERFORMANCE REPORT');
  lines.push('Operating Systems (1BCS304) - Department of CSE, Seshadripuram Institute of Technology, Mysuru');
  lines.push(`Generated On: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('--- SIMULATION PARAMETERS ---');
  lines.push(`Initial Head Position,${initialHead}`);
  lines.push(`Disk Size (Cylinders),${diskSize} (Range: 0-${diskSize - 1})`);
  lines.push(`Initial Direction,${direction.toUpperCase()}`);
  lines.push(`Seek Rate Assumption,${seekRate} ms/cylinder`);
  lines.push(`Request Queue,"${requests.join(', ')}"`);
  lines.push(`Total Requests,${requests.length}`);
  lines.push('');

  // Performance Table
  lines.push('--- ALGORITHM PERFORMANCE COMPARISON ---');
  lines.push('Algorithm,Total Head Movement (Cylinders),Average Movement (Cyl/Req),Estimated Seek Time (ms),Time Complexity,Is Best Performer,Seek Sequence');

  for (const r of results) {
    const isBest = r.isBest ? 'YES' : 'NO';
    const seqStr = `"${r.seekSequence.join(' -> ')}"`;
    lines.push(`"${r.name}",${r.totalHeadMovement},${r.averageHeadMovement},${r.estimatedSeekTime},${r.timeComplexity},${isBest},${seqStr}`);
  }

  lines.push('');
  lines.push('--- SUMMARY CONCLUSION ---');
  lines.push(`Best Performing Algorithm(s),${bestAlgorithms.join(' / ')}`);
  lines.push(`Minimum Head Movement,${minMovement} cylinders`);
  lines.push('Note: The best algorithm depends on request queue distribution and head direction. No single algorithm is universally superior.');

  const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(e => e).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `disk_scheduling_report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers clean browser print dialog with styled report view.
 */
export function printPerformanceReport() {
  window.print();
}
