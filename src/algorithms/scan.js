import { buildMovementDetails } from '../utils/calculations.js';

/**
 * SCAN (Elevator) Disk Scheduling Algorithm.
 * 
 * The disk head moves in the specified direction, servicing requests along the way
 * until it reaches the physical end (boundary) of the disk in that direction.
 * It then reverses direction and services any remaining requests in the opposite direction.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Initial head direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function scan(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'scan',
      name: 'SCAN (Elevator Algorithm)',
      shortName: 'SCAN',
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
      description: 'Sweeps the disk arm to the physical boundary before reversing direction.'
    };
  }

  const maxCylinder = diskSize - 1;
  const minCylinder = 0;

  const seekSequence = [initialHead];
  const servicedRequests = [];

  // Partition requests relative to initialHead
  const exactMatches = requests.filter(r => r === initialHead);
  const strictlyRight = requests.filter(r => r > initialHead).sort((a, b) => a - b);
  const strictlyLeft = requests.filter(r => r < initialHead).sort((a, b) => b - a);

  if (direction === 'right') {
    // Service exact matches at initialHead first
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Service requests to the right
    for (const r of strictlyRight) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Continue to physical upper boundary (diskSize - 1) if not already there
    const lastPos = seekSequence[seekSequence.length - 1];
    if (lastPos !== maxCylinder) {
      seekSequence.push(maxCylinder);
    }
    // Reverse direction and service requests on the left (in descending order)
    for (const r of strictlyLeft) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  } else {
    // Moving left: service exact matches first
    for (const r of exactMatches) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Service requests to the left (descending)
    for (const r of strictlyLeft) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
    // Continue to physical lower boundary (0) if not already there
    const lastPos = seekSequence[seekSequence.length - 1];
    if (lastPos !== minCylinder) {
      seekSequence.push(minCylinder);
    }
    // Reverse direction and service requests on the right (ascending)
    for (const r of strictlyRight) {
      seekSequence.push(r);
      servicedRequests.push(r);
    }
  }

  const metrics = buildMovementDetails(initialHead, seekSequence, requests, seekRate);

  return {
    id: 'scan',
    name: 'SCAN (Elevator Algorithm)',
    shortName: 'SCAN',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests,
    timeComplexity: 'O(N log N)',
    description: 'Moves the disk head in one direction servicing requests until reaching the physical disk boundary, then reverses direction to service remaining requests. Prevents starvation.'
  };
}
