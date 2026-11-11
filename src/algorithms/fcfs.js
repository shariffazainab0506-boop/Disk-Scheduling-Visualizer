import { buildMovementDetails } from '../utils/calculations.js';

/**
 * First Come First Serve (FCFS) Disk Scheduling Algorithm.
 * 
 * Requests are serviced in the exact sequential order in which they arrived.
 * No reordering or optimization is performed.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Initial head direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function fcfs(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'fcfs',
      name: 'FCFS (First Come First Serve)',
      shortName: 'FCFS',
      initialHead,
      diskSize,
      direction,
      seekSequence: [initialHead],
      servicedRequests: [],
      steps: [],
      totalHeadMovement: 0,
      requestCount: 0,
      averageHeadMovement: 0,
      estimatedSeekTime: 0,
      timeComplexity: 'O(N)',
      description: 'Processes disk requests in the exact order of their arrival without rearranging.'
    };
  }

  const fullSequence = [initialHead, ...requests];
  const metrics = buildMovementDetails(initialHead, fullSequence, requests, seekRate);

  return {
    id: 'fcfs',
    name: 'FCFS (First Come First Serve)',
    shortName: 'FCFS',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests: [...requests],
    timeComplexity: 'O(N)',
    description: 'Services disk requests strictly in their arrival sequence. Simple and starvation-free, but suffers from high average seek time.'
  };
}
