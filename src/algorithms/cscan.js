import { buildMovementDetails } from '../utils/calculations.js';

/**
 * Circular SCAN (C-SCAN) Disk Scheduling Algorithm.
 * 
 * A variant of SCAN designed to provide more uniform wait times.
 * The head moves in one direction only, servicing requests until it reaches
 * the physical boundary. It then immediately jumps to the opposite boundary
 * (without servicing requests during the return sweep) and continues servicing
 * requests in the original direction.
 * 
 * Circular return movement from boundary to opposite boundary is included
 * in the total physical head movement calculation.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Head movement direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function cscan(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'cscan',
      name: 'C-SCAN (Circular SCAN)',
      shortName: 'C-SCAN',
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
      description: 'Treats the disk as a circular list, jumping from one physical boundary to the other.'
    };
  }

  const maxCylinder = diskSize - 1;
  const minCylinder = 0;

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

    // Move to physical upper boundary
    if (seekSequence[seekSequence.length - 1] !== maxCylinder) {
      seekSequence.push(maxCylinder);
    }

    // Only jump to opposite boundary if there are requests waiting on the left side
    if (strictlyLeft.length > 0) {
      seekSequence.push(minCylinder);
      for (const r of strictlyLeft) {
        seekSequence.push(r);
        servicedRequests.push(r);
      }
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

    // Move to physical lower boundary
    if (seekSequence[seekSequence.length - 1] !== minCylinder) {
      seekSequence.push(minCylinder);
    }

    // Only jump to opposite boundary if there are requests waiting on the right side
    if (strictlyRight.length > 0) {
      seekSequence.push(maxCylinder);
      const rightDesc = [...strictlyRight].sort((a, b) => b - a);
      for (const r of rightDesc) {
        seekSequence.push(r);
        servicedRequests.push(r);
      }
    }
  }

  const metrics = buildMovementDetails(initialHead, seekSequence, requests, seekRate);

  return {
    id: 'cscan',
    name: 'C-SCAN (Circular SCAN)',
    shortName: 'C-SCAN',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests,
    timeComplexity: 'O(N log N)',
    description: 'Moves the head in one direction to the physical boundary, jumps back to the opposite boundary, and continues scanning in the same direction for uniform waiting times.'
  };
}
