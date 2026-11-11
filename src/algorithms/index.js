import { fcfs } from './fcfs.js';
import { sstf } from './sstf.js';
import { scan } from './scan.js';
import { cscan } from './cscan.js';
import { look } from './look.js';
import { clook } from './clook.js';

export { fcfs, sstf, scan, cscan, look, clook };

export const ALGORITHM_MAP = {
  fcfs,
  sstf,
  scan,
  cscan,
  look,
  clook
};

export const ALGORITHM_ORDER = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];

/**
 * Runs a single specified algorithm.
 */
export function runAlgorithm(algoId, initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  const fn = ALGORITHM_MAP[algoId];
  if (!fn) {
    throw new Error(`Unknown algorithm ID: ${algoId}`);
  }
  return fn(initialHead, requests, diskSize, direction, seekRate);
}

/**
 * Runs all six disk scheduling algorithms on identical input parameters
 * and identifies the best-performing algorithm(s), including tie detection.
 */
export function runAllAlgorithms(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  const results = ALGORITHM_ORDER.map(id =>
    ALGORITHM_MAP[id](initialHead, requests, diskSize, direction, seekRate)
  );

  // Determine minimum total head movement
  const minMovement = Math.min(...results.map(r => r.totalHeadMovement));
  const bestAlgorithms = results.filter(r => r.totalHeadMovement === minMovement);
  const isTie = bestAlgorithms.length > 1;

  // Annotate each result
  const annotatedResults = results.map(r => ({
    ...r,
    isBest: r.totalHeadMovement === minMovement,
    isTiedBest: isTie && r.totalHeadMovement === minMovement
  }));

  return {
    results: annotatedResults,
    minMovement,
    bestAlgorithms: bestAlgorithms.map(b => b.shortName),
    isTie,
    summaryNote: isTie
      ? `Tie detected between ${bestAlgorithms.map(b => b.shortName).join(' and ')} with ${minMovement} total cylinders.`
      : `${bestAlgorithms[0].shortName} achieved the lowest total head movement (${minMovement} cylinders) for this workload.`
  };
}
