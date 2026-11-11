/**
 * Input validation for Disk Scheduling Simulator.
 */

export function parseRequestQueue(queueStr) {
  if (!queueStr || typeof queueStr !== 'string') {
    return [];
  }
  // Split by commas, spaces, or tabs, filter empty tokens
  return queueStr
    .trim()
    .split(/[\s,]+/)
    .filter(token => token.length > 0)
    .map(token => Number(token));
}

export function validateInput({
  queueStr,
  initialHeadStr,
  diskSizeStr,
  direction,
  seekRateStr
}) {
  const errors = [];
  const warnings = [];

  // 1. Validate Disk Size
  const diskSize = Number(diskSizeStr);
  if (diskSizeStr === '' || isNaN(diskSize)) {
    errors.push('Total disk cylinders (disk size) must be a valid positive integer.');
  } else if (!Number.isInteger(diskSize) || diskSize < 2) {
    errors.push('Disk size must be an integer greater than or equal to 2 (e.g. 200 for cylinders 0–199).');
  } else if (diskSize > 10000) {
    warnings.push('Disk size is very large (> 10,000). Visualizations will scale proportionally.');
  }

  const maxValidCylinder = Number.isInteger(diskSize) && diskSize >= 2 ? diskSize - 1 : Infinity;

  // 2. Validate Initial Head Position
  const initialHead = Number(initialHeadStr);
  if (initialHeadStr === '' || isNaN(initialHead)) {
    errors.push('Initial disk-head position must be a valid integer.');
  } else if (!Number.isInteger(initialHead)) {
    errors.push('Initial head position must be an integer.');
  } else if (initialHead < 0 || (maxValidCylinder !== Infinity && initialHead > maxValidCylinder)) {
    errors.push(`Initial head position (${initialHead}) is out of disk bounds (valid range: 0 to ${maxValidCylinder}).`);
  }

  // 3. Validate Request Queue
  if (!queueStr || queueStr.trim() === '') {
    errors.push('Disk request queue cannot be empty. Please enter cylinder numbers.');
  }

  const parsedQueue = parseRequestQueue(queueStr);
  if (parsedQueue.length === 0 && queueStr && queueStr.trim() !== '') {
    errors.push('Could not parse any valid cylinder numbers from the request queue.');
  }

  const invalidTokens = [];
  const outOfBoundsTokens = [];
  const negativeTokens = [];
  const validRequests = [];
  const seen = new Set();
  const duplicates = [];

  for (const num of parsedQueue) {
    if (isNaN(num) || !Number.isInteger(num)) {
      invalidTokens.push(num);
      continue;
    }
    if (num < 0) {
      negativeTokens.push(num);
      continue;
    }
    if (maxValidCylinder !== Infinity && num > maxValidCylinder) {
      outOfBoundsTokens.push(num);
      continue;
    }

    if (seen.has(num)) {
      duplicates.push(num);
    } else {
      seen.add(num);
    }

    validRequests.push(num);
  }

  if (invalidTokens.length > 0) {
    errors.push(`Non-integer values found in request queue: ${invalidTokens.slice(0, 5).join(', ')}.`);
  }

  if (negativeTokens.length > 0) {
    errors.push(`Negative cylinder numbers are invalid: ${negativeTokens.slice(0, 5).join(', ')}.`);
  }

  if (outOfBoundsTokens.length > 0) {
    errors.push(`Requests exceed disk maximum cylinder ${maxValidCylinder}: ${outOfBoundsTokens.slice(0, 5).join(', ')}.`);
  }

  if (duplicates.length > 0) {
    warnings.push(`Duplicate cylinder requests detected: [${[...new Set(duplicates)].join(', ')}]. All instances will be processed.`);
  }

  if (validRequests.includes(initialHead)) {
    warnings.push(`Initial head position (${initialHead}) is present in the request queue. It will be serviced with 0 seek distance.`);
  }

  // 4. Validate Direction
  const validDirection = direction === 'left' ? 'left' : 'right';

  // 5. Validate Seek Rate
  let seekRate = 0.1;
  if (seekRateStr !== undefined && seekRateStr !== '') {
    const parsedRate = Number(seekRateStr);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      warnings.push('Invalid seek-rate assumption provided. Using default 0.1 ms/cylinder.');
    } else {
      seekRate = parsedRate;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleanData: errors.length === 0 ? {
      requests: validRequests,
      initialHead,
      diskSize,
      direction: validDirection,
      seekRate
    } : null
  };
}
