import { buildMovementDetails } from '../utils/calculations.js';

/**
 * Shortest Seek Time First (SSTF) Disk Scheduling Algorithm.
 * 
 * Selects the disk I/O request that requires the least head movement
 * from the current head position.
 * 
 * Tie-breaking rule:
 * If two pending requests have identical distances, the algorithm prefers
 * the request lying in the current direction of movement; if direction is
 * neutral or still tied, it chooses the smaller cylinder number.
 *
 * @param {number} initialHead - Starting head position
 * @param {Array<number>} requests - Array of cylinder requests
 * @param {number} diskSize - Total number of cylinders (0 to diskSize - 1)
 * @param {string} direction - Initial head direction ('right' or 'left')
 * @param {number} seekRate - Seek time in ms per cylinder
 * @returns {Object} Algorithm result object
 */
export function sstf(initialHead, requests, diskSize = 200, direction = 'right', seekRate = 0.1) {
  if (!requests || requests.length === 0) {
    return {
      id: 'sstf',
      name: 'SSTF (Shortest Seek Time First)',
      shortName: 'SSTF',
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
      timeComplexity: 'O(N²)',
      description: 'Selects the request closest to the current head position.'
    };
  }

  const pending = [...requests];
  const seekSequence = [initialHead];
  const servicedRequests = [];
  let currentPos = initialHead;
  let currentDirection = direction;

  while (pending.length > 0) {
    let closestIndex = 0;
    let minDistance = Math.abs(pending[0] - currentPos);

    for (let i = 1; i < pending.length; i++) {
      const dist = Math.abs(pending[i] - currentPos);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      } else if (dist === minDistance) {
        // Documented tie-breaking rule:
        // 1. Prefer cylinder in current movement direction
        const cand1 = pending[closestIndex];
        const cand2 = pending[i];
        const cand1InDir = (currentDirection === 'right' && cand1 >= currentPos) || 
                          (currentDirection === 'left' && cand1 <= currentPos);
        const cand2InDir = (currentDirection === 'right' && cand2 >= currentPos) || 
                          (currentDirection === 'left' && cand2 <= currentPos);

        if (cand2InDir && !cand1InDir) {
          closestIndex = i;
        } else if (cand1InDir === cand2InDir) {
          // 2. If still tied, choose lower cylinder number
          if (cand2 < cand1) {
            closestIndex = i;
          }
        }
      }
    }

    const chosen = pending.splice(closestIndex, 1)[0];
    if (chosen > currentPos) {
      currentDirection = 'right';
    } else if (chosen < currentPos) {
      currentDirection = 'left';
    }

    seekSequence.push(chosen);
    servicedRequests.push(chosen);
    currentPos = chosen;
  }

  const metrics = buildMovementDetails(initialHead, seekSequence, requests, seekRate);

  return {
    id: 'sstf',
    name: 'SSTF (Shortest Seek Time First)',
    shortName: 'SSTF',
    initialHead,
    diskSize,
    direction,
    ...metrics,
    servicedRequests,
    timeComplexity: 'O(N²)',
    description: 'Greedily services the closest pending request to minimize individual seek steps. Substantially lowers total head movement compared to FCFS, but may cause starvation for distant requests under heavy loads.'
  };
}
