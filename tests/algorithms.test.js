import { fcfs } from '../src/algorithms/fcfs.js';
import { sstf } from '../src/algorithms/sstf.js';
import { scan } from '../src/algorithms/scan.js';
import { cscan } from '../src/algorithms/cscan.js';
import { look } from '../src/algorithms/look.js';
import { clook } from '../src/algorithms/clook.js';
import { runAllAlgorithms } from '../src/algorithms/index.js';
import { validateInput } from '../src/utils/validation.js';
import { SAMPLE_PRESETS, generateRandomDataset } from '../src/data/sampleData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message} (Expected ${expectedStr}, got ${actualStr})`);
    failed++;
  }
}

console.log('================================================================');
console.log('TEST SUITE 1: Prompt Specification Primary Dataset (Direction: Right)');
console.log('Queue: [82, 170, 43, 140, 24, 16, 190], Head: 50, Disk: 200');
console.log('================================================================');

const req1 = [82, 170, 43, 140, 24, 16, 190];
const head1 = 50;
const disk1 = 200;
const dir1 = 'right';

// Test 1: FCFS
const r_fcfs = fcfs(head1, req1, disk1, dir1);
assertEqual(r_fcfs.totalHeadMovement, 642, 'FCFS Total Head Movement must be exactly 642');
assertEqual(r_fcfs.seekSequence, [50, 82, 170, 43, 140, 24, 16, 190], 'FCFS Seek Sequence');
assertEqual(r_fcfs.averageHeadMovement, 91.71, 'FCFS Average Head Movement');

// Test 2: SSTF
const r_sstf = sstf(head1, req1, disk1, dir1);
assertEqual(r_sstf.totalHeadMovement, 208, 'SSTF Total Head Movement must be 208');
assertEqual(r_sstf.seekSequence, [50, 43, 24, 16, 82, 140, 170, 190], 'SSTF Seek Sequence');
assertEqual(r_sstf.averageHeadMovement, 29.71, 'SSTF Average Head Movement');

// Test 3: SCAN (Right -> reaches 199, reverses to 16)
const r_scan = scan(head1, req1, disk1, dir1);
assertEqual(r_scan.totalHeadMovement, 332, 'SCAN Total Head Movement must be 332: (199-50) + (199-16) = 149 + 183 = 332');
assertEqual(r_scan.seekSequence, [50, 82, 140, 170, 190, 199, 43, 24, 16], 'SCAN Seek Sequence (includes boundary 199)');

// Test 4: C-SCAN (Right -> 199, jumps to 0, moves right to 43)
const r_cscan = cscan(head1, req1, disk1, dir1);
assertEqual(r_cscan.totalHeadMovement, 391, 'C-SCAN Total Head Movement must be 391: (199-50) + 199 + (43-0) = 149 + 199 + 43 = 391');
assertEqual(r_cscan.seekSequence, [50, 82, 140, 170, 190, 199, 0, 16, 24, 43], 'C-SCAN Seek Sequence (includes 199 and jump to 0)');

// Test 5: LOOK (Right -> 190, reverses to 16)
const r_look = look(head1, req1, disk1, dir1);
assertEqual(r_look.totalHeadMovement, 314, 'LOOK Total Head Movement must be 314: (190-50) + (190-16) = 140 + 174 = 314');
assertEqual(r_look.seekSequence, [50, 82, 140, 170, 190, 43, 24, 16], 'LOOK Seek Sequence (does not reach 199 or 0)');

// Test 6: C-LOOK (Right -> 190, jumps to 16, moves right to 43)
const r_clook = clook(head1, req1, disk1, dir1);
assertEqual(r_clook.totalHeadMovement, 341, 'C-LOOK Total Head Movement must be 341: (190-50) + (190-16) + (43-16) = 140 + 174 + 27 = 341');
assertEqual(r_clook.seekSequence, [50, 82, 140, 170, 190, 16, 24, 43], 'C-LOOK Seek Sequence (direct jump from 190 to 16)');

console.log('\n================================================================');
console.log('TEST SUITE 2: Silberschatz Classic OS Benchmark & Left Direction');
console.log('Queue: [98, 183, 37, 122, 14, 124, 65, 67], Head: 53, Disk: 200');
console.log('================================================================');

const req2 = [98, 183, 37, 122, 14, 124, 65, 67];
const head2 = 53;
const dir2 = 'left';

const r2_fcfs = fcfs(head2, req2, disk1, dir2);
assertEqual(r2_fcfs.totalHeadMovement, 640, 'Silberschatz FCFS Total = 640');

const r2_sstf = sstf(head2, req2, disk1, dir2);
assertEqual(r2_sstf.totalHeadMovement, 236, 'Silberschatz SSTF Total = 236');
assertEqual(r2_sstf.seekSequence, [53, 65, 67, 37, 14, 98, 122, 124, 183], 'Silberschatz SSTF Sequence');

const r2_scan = scan(head2, req2, disk1, dir2);
assertEqual(r2_scan.totalHeadMovement, 236, 'Silberschatz SCAN Total = 236 (53-0 + 183-0)');
assertEqual(r2_scan.seekSequence, [53, 37, 14, 0, 65, 67, 98, 122, 124, 183], 'Silberschatz SCAN Sequence');

const r2_cscan = cscan(head2, req2, disk1, dir2);
assertEqual(r2_cscan.seekSequence, [53, 37, 14, 0, 199, 183, 124, 122, 98, 67, 65], 'Silberschatz C-SCAN Left Sequence');
assertEqual(r2_cscan.totalHeadMovement, 53 + 199 + (199 - 65), 'Silberschatz C-SCAN Left Total Movement = 386');

const r2_look = look(head2, req2, disk1, dir2);
assertEqual(r2_look.totalHeadMovement, 208, 'Silberschatz LOOK Total = 208 (53-14 + 183-14)');
assertEqual(r2_look.seekSequence, [53, 37, 14, 65, 67, 98, 122, 124, 183], 'Silberschatz LOOK Sequence');

const r2_clook = clook(head2, req2, disk1, dir2);
assertEqual(r2_clook.seekSequence, [53, 37, 14, 183, 124, 122, 98, 67, 65], 'Silberschatz C-LOOK Left Sequence');
assertEqual(r2_clook.totalHeadMovement, (53 - 14) + (183 - 14) + (183 - 65), 'Silberschatz C-LOOK Left Total Movement = 326');

console.log('\n================================================================');
console.log('TEST SUITE 3: Edge Cases & Boundary Tests');
console.log('================================================================');

// Case A: Initial head itself is in requests
const reqA = [50, 75, 100];
const rA_fcfs = fcfs(50, reqA, 200, 'right');
assert(rA_fcfs.steps[0].distance === 0, 'Distance to initial head is 0 when in requests');
assertEqual(rA_fcfs.totalHeadMovement, 50, 'Head in requests total movement: 0 + 25 + 25 = 50');

// Case B: Duplicate requests
const reqB = [80, 80, 120];
const rB_fcfs = fcfs(50, reqB, 200, 'right');
assertEqual(rB_fcfs.totalHeadMovement, 70, 'Duplicates handled cleanly: 30 + 0 + 40 = 70');

// Case C: Boundary request already at 199 in SCAN
const reqC = [80, 199, 20];
const rC_scan = scan(50, reqC, 200, 'right');
assertEqual(rC_scan.seekSequence, [50, 80, 199, 20], 'SCAN does not duplicate boundary 199 if already requested');

// Case D: Empty requests
const rD_fcfs = fcfs(50, [], 200, 'right');
assertEqual(rD_fcfs.totalHeadMovement, 0, 'Empty queue produces 0 movement and no division by zero');
assertEqual(rD_fcfs.averageHeadMovement, 0, 'Empty queue produces 0 average');

// Case E: Tie detection in comparison engine
const comparison = runAllAlgorithms(50, [60, 70, 80], 200, 'right');
assert(comparison.results.length === 6, 'runAllAlgorithms returns 6 results');
assert(comparison.isTie === true, 'Ties are correctly identified when multiple algorithms achieve same min movement');

console.log('\n================================================================');
console.log('TEST SUITE 4: Input Validation & Presets');
console.log('================================================================');

const v1 = validateInput({
  queueStr: '82, 170, 43',
  initialHeadStr: '50',
  diskSizeStr: '200',
  direction: 'right',
  seekRateStr: '0.1'
});
assert(v1.isValid === true, 'Valid input passes validation');
assertEqual(v1.cleanData.requests, [82, 170, 43], 'Parsed request array matches');

const v_empty = validateInput({
  queueStr: '',
  initialHeadStr: '50',
  diskSizeStr: '200',
  direction: 'right'
});
assert(v_empty.isValid === false, 'Empty request queue fails validation');

const v_negative = validateInput({
  queueStr: '82, -5, 40',
  initialHeadStr: '50',
  diskSizeStr: '200',
  direction: 'right'
});
assert(v_negative.isValid === false, 'Negative request fails validation');

const v_oob = validateInput({
  queueStr: '82, 200, 40',
  initialHeadStr: '50',
  diskSizeStr: '200',
  direction: 'right'
});
assert(v_oob.isValid === false, 'Out-of-bounds request (>= diskSize) fails validation');

const v_head_oob = validateInput({
  queueStr: '82, 40',
  initialHeadStr: '250',
  diskSizeStr: '200',
  direction: 'right'
});
assert(v_head_oob.isValid === false, 'Initial head out of bounds fails validation');

const rnd = generateRandomDataset(10, 200);
assert(rnd.requests.length === 10 && SAMPLE_PRESETS.length >= 4, 'Random dataset & presets valid');

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
