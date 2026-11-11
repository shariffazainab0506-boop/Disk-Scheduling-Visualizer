/**
 * Curated preset datasets and random generation for disk scheduling simulations.
 */

export const SAMPLE_PRESETS = [
  {
    id: 'vtu_default',
    title: 'VTU Exam / Prompt Default',
    description: 'Standard VTU Operating Systems (1BCS304) problem. Expected FCFS total movement = 642 cylinders.',
    initialHead: 50,
    requests: [82, 170, 43, 140, 24, 16, 190],
    diskSize: 200,
    direction: 'right',
    seekRate: 0.1
  },
  {
    id: 'silberschatz_classic',
    title: 'Silberschatz Classic OS Problem',
    description: 'From Operating System Concepts (Silberschatz, Galvin, Gagne). Head moving towards 0.',
    initialHead: 53,
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    diskSize: 200,
    direction: 'left',
    seekRate: 0.1
  },
  {
    id: 'boundary_extremes',
    title: 'Boundary & Extremes Stress Case',
    description: 'Requests placed on the boundary edges (0 and 199) and central tracks.',
    initialHead: 100,
    requests: [0, 199, 10, 185, 95, 45, 150],
    diskSize: 200,
    direction: 'right',
    seekRate: 0.1
  },
  {
    id: 'one_sided_clustering',
    title: 'One-Sided Request Clustering',
    description: 'All pending requests lie strictly to the right of the starting head position.',
    initialHead: 40,
    requests: [120, 145, 160, 175, 185, 195],
    diskSize: 200,
    direction: 'right',
    seekRate: 0.1
  },
  {
    id: 'alternating_thrash',
    title: 'High-Thrashing Ping-Pong Queue',
    description: 'Alternating extremes causing severe arm thrashing in FCFS while SCAN sweeps smoothly.',
    initialHead: 100,
    requests: [15, 185, 25, 175, 35, 165, 45, 155],
    diskSize: 200,
    direction: 'right',
    seekRate: 0.1
  }
];

/**
 * Generates a randomized valid disk request configuration.
 */
export function generateRandomDataset(count = 8, diskSize = 200) {
  const maxCyl = diskSize - 1;
  const initialHead = Math.floor(Math.random() * maxCyl);
  const requests = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random cylinder in [0, maxCyl]
    const cyl = Math.floor(Math.random() * diskSize);
    requests.push(cyl);
  }

  const direction = Math.random() > 0.5 ? 'right' : 'left';

  return {
    id: 'random_' + Date.now(),
    title: `Random Preset (${count} requests)`,
    description: `Randomly generated workload for disk size ${diskSize}.`,
    initialHead,
    requests,
    diskSize,
    direction,
    seekRate: 0.1
  };
}
