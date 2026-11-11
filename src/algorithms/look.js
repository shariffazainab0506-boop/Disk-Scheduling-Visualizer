import { buildMovementDetails } from '../utils/calculations.js';

/**
 * LOOK Disk Scheduling Algorithm.
 * 
 * An optimized variant of SCAN. The disk head travels in the chosen direction
 * only as far as the final request in that direction, rather than traveling
 * all the way to the physical cylinder boundary (0 or diskSize - 1).
 * It then reverses direction and services the remaining pending requests.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Initial head direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function look(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'look',
      name: 'LOOK Algorithm',
      shortName: 'LOOK',
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
      timeComplexity: 'O(N log N)',
      description: 'Optimized elevator algorithm that reverses at the last request instead of the disk boundary.'
    };
  }

  const seekSequence = [initialHead];
  const servicedRequests = [];

  const exactMatches = requests.filter(r => r === initialHead);
  const strictlyRight = requests.filter(r => r > initialHead).sort((a, b) => a - b);
  const strictlyLeft = requests.filter(r => r < initialHead).sort((a, b) => b - a); // descending

  if (direction === 'right') {
    // Service exact matches
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Service requests to the right (if any)
    for (const r of strictlyRight) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Reverse at the last right request (or head if none) and service left
    for (const r of strictlyLeft) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  } else {
    // Moving left
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Service requests to the left (descending)
    for (const r of strictlyLeft) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Reverse at the lowest request and service right (ascending)
    for (const r of strictlyRight) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  }

  const metrics = buildMovementDetails(initialHead, seekSequence, requests, seekRate);

  return {
    id: 'look',
    name: 'LOOK Algorithm',
    shortName: 'LOOK',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests,
    timeComplexity: 'O(N log N)',
    description: 'Looks ahead and reverses direction immediately after servicing the last request in the current direction, eliminating unnecessary seek travel to disk boundaries.'
  };
}
