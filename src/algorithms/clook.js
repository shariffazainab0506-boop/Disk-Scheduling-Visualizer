import { buildMovementDetails } from '../utils/calculations.js';

/**
 * Circular LOOK (C-LOOK) Disk Scheduling Algorithm.
 * 
 * An optimized variant of C-SCAN. Instead of sweeping to physical disk boundaries,
 * the disk head only goes as far as the final pending request in the current direction,
 * then immediately jumps directly to the first pending request at the opposite end
 * and continues servicing requests in the original direction.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Head movement direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function clook(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'clook',
      name: 'C-LOOK (Circular LOOK)',
      shortName: 'C-LOOK',
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
      description: 'Optimized C-SCAN that jumps directly between extreme pending requests rather than physical disk boundaries.'
    };
  }

  const seekSequence = [initialHead];
  const servicedRequests = [];

  const exactMatches = requests.filter(r => r === initialHead);
  const strictlyRight = requests.filter(r => r > initialHead).sort((a, b) => a - b); // ascending
  const strictlyLeft = requests.filter(r => r < initialHead).sort((a, b) => a - b); // ascending

  if (direction === 'right') {
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    for (const r of strictlyRight) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Jump directly to the lowest pending request on the left and continue right (ascending)
    for (const r of strictlyLeft) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  } else {
    // Moving left (decreasing cylinder order)
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    const leftDesc = [...strictlyLeft].sort((a, b) => b - a);
    for (const r of leftDesc) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Jump directly to the highest pending request on the right and continue left (descending)
    const rightDesc = [...strictlyRight].sort((a, b) => b - a);
    for (const r of rightDesc) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  }

  const metrics = buildMovementDetails(initialHead, seekSequence, requests, seekRate);

  return {
    id: 'clook',
    name: 'C-LOOK (Circular LOOK)',
    shortName: 'C-LOOK',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests,
    timeComplexity: 'O(N log N)',
    description: 'Combines LOOK and C-SCAN: services requests up to the last pending request in one direction, jumps directly to the furthest request at the opposite end, and continues in the same direction.'
  };
}
