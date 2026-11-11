/**
 * Utility functions for disk scheduling metrics and step construction.
 */

/**
 * Calculates step-by-step movement details and summary statistics.
 * @param {number} initialHead - Starting head cylinder
 * @param {Array<number>} fullSequence - Complete sequence of cylinders visited
 * @param {Array<number>} originalRequests - The original requested cylinders
 * @param {number} seekRate - Configurable seek rate (ms per cylinder)
 * @returns {Object} Calculated metrics and detailed steps
 */
export function buildMovementDetails(initialHead, fullSequence, originalRequests, seekRate = 0.1) {
  const steps = [];
  let totalHeadMovement = 0;
  let currentPos = initialHead;

  // Track serviced requests to mark which steps actually serviced a cylinder request
  const unservicedSet = [...originalRequests];

  for (let i = 1; i < fullSequence.length; i++) {
    const nextPos = fullSequence[i];
    const distance = Math.abs(nextPos - currentPos);
    totalHeadMovement += distance;

    // Check if nextPos services one of the requests
    const reqIndex = unservicedSet.indexOf(nextPos);
    const isServiced = reqIndex !== -1;
    if (isServiced) {
      unservicedSet.splice(reqIndex, 1);
    }

    steps.push({
      step: i,
      from: currentPos,
      to: nextPos,
      distance,
      cumulativeDistance: totalHeadMovement,
      isServicedRequest: isServiced,
      seekTime: parseFloat((distance * seekRate).toFixed(2))
    });

    currentPos = nextPos;
  }

  const requestCount = originalRequests.length;
  const averageHeadMovement = requestCount > 0 
    ? parseFloat((totalHeadMovement / requestCount).toFixed(2)) 
    : 0;
  
  const estimatedSeekTime = parseFloat((totalHeadMovement * seekRate).toFixed(2));

  return {
    seekSequence: fullSequence,
    steps,
    totalHeadMovement,
    requestCount,
    averageHeadMovement,
    estimatedSeekTime
  };
}
