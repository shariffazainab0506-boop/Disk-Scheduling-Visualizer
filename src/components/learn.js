/**
 * Learn Algorithms Educational Component.
 * Comprehensive academic reference for Operating Systems (1BCS304) VTU Mini-Project.
 */

export function renderLearnSection(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="learn-container">
      <!-- Section Intro Header -->
      <div class="learn-header">
        <span class="learn-eyebrow">Operating Systems (1BCS304) Academic Guide</span>
        <h2 class="learn-main-title">Disk Scheduling Fundamentals & Algorithm Theory</h2>
        <p class="learn-lead">
          In computer operating systems, disk scheduling is the process by which the operating system decides 
          the order in which pending disk Input/Output (I/O) requests are serviced by the mechanical read/write head.
          Because mechanical seek operations are millions of times slower than electronic RAM access, scheduling algorithms 
          play a crucial role in preventing system I/O bottlenecks.
        </p>
      </div>

      <!-- Core Concepts Grid -->
      <div class="concepts-card-section">
        <h3 class="section-subheading"><i class="icon-book"></i> Core Operating System Concepts</h3>
        <div class="concepts-grid">
          <div class="concept-card">
            <div class="concept-icon">💽</div>
            <h4>Disk Cylinders & Platters</h4>
            <p>
              A magnetic Hard Disk Drive (HDD) consists of one or more rotating platters coated with magnetic material.
              Each platter has circular rings called <strong>tracks</strong>. The vertical set of tracks across all platters 
              at a given arm radius is known as a <strong>cylinder</strong>. Numbering starts at 0 (innermost or outermost cylinder) 
              up to <code>diskSize − 1</code>.
            </p>
          </div>

          <div class="concept-card">
            <div class="concept-icon">🎯</div>
            <h4>Disk Read/Write Head</h4>
            <p>
              An electromagnetic head attached to a movable actuator arm. All heads move in unison across the platters.
              Only one cylinder can be read or written at any single instant, requiring the arm to physically move to different 
              radial positions to access data.
            </p>
          </div>

          <div class="concept-card">
            <div class="concept-icon">⏱️</div>
            <h4>Seek Time vs Latency</h4>
            <p>
              Total disk access time is dominated by three mechanical components:
              <br>• <strong>Seek Time:</strong> Time taken for the arm to position the head over the desired cylinder (dominant factor, ~3–10 ms).
              <br>• <strong>Rotational Latency:</strong> Time waiting for the target sector to rotate underneath the head.
              <br>• <strong>Transfer Time:</strong> Time to magnetically read/write the actual bits.
            </p>
          </div>

          <div class="concept-card">
            <div class="concept-icon">📐</div>
            <h4>Total Head Movement</h4>
            <p>
              The fundamental evaluation metric in disk scheduling. It is computed as the sum of absolute cylinder displacements 
              between consecutive serviced requests: <code>Σ |Position_i − Position_{i-1}|</code>. 
              Minimizing total head movement directly minimizes total seek time and mechanical hardware wear.
            </p>
          </div>

          <div class="concept-card">
            <div class="concept-icon">⚠️</div>
            <h4>Starvation Vulnerability</h4>
            <p>
              A scenario where a pending disk request is postponed indefinitely because requests closer to the disk head 
              continually arrive. For example, in <strong>SSTF</strong>, requests for distant cylinders may starve if a steady stream 
              of requests clusters around the head's current cylinder.
            </p>
          </div>

          <div class="concept-card">
            <div class="concept-icon">🛗</div>
            <h4>The Elevator Principle</h4>
            <p>
              Algorithms such as SCAN, C-SCAN, LOOK, and C-LOOK are known as <em>elevator algorithms</em> because they operate 
              analogously to an elevator in a multistory building—servicing requests in one direction until reaching the end, 
              thereby guaranteeing fairness and bounded waiting times.
            </p>
          </div>
        </div>
      </div>

      <!-- The Six Algorithms Deep-Dive -->
      <div class="algorithms-deepdive-section">
        <h3 class="section-subheading"><i class="icon-cpu"></i> Detailed Analysis of the Six Disk Scheduling Algorithms</h3>

        <!-- 1. FCFS -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 1</div>
          <h3>First Come First Serve (FCFS)</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                Requests are processed strictly in their original order of arrival in the disk queue. 
                The disk controller does not rearrange or optimize requests based on cylinder proximity.
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Read requests from the arrival queue sequentially.</li>
                <li>Move the head directly from its current cylinder to the cylinder of the next request.</li>
                <li>Calculate seek distance as <code>|Target − Current|</code>.</li>
                <li>Repeat until all requests in the queue are serviced.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Completely fair; zero starvation.</li>
                    <li>Extremely simple to implement in hardware/software.</li>
                    <li>Minimal CPU overhead (O(N) complexity).</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>Worst average seek performance.</li>
                    <li>Causes severe head thrashing back and forth across platters.</li>
                    <li>High mechanical wear and tear.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50, FCFS travels <strong>642 cylinders</strong>.
          </div>
        </article>

        <!-- 2. SSTF -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 2</div>
          <h3>Shortest Seek Time First (SSTF)</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                A greedy heuristic that chooses the pending request with the minimum seek distance <code>|Request − Current Head|</code> 
                from the current head position. Analogous to SJF (Shortest Job First) in CPU scheduling.
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Inspect all pending requests in the disk queue.</li>
                <li>Compute distance to each pending cylinder from the current position.</li>
                <li>Service the request with the smallest distance.</li>
                <li>In case of equal distance (tie), break tie toward current movement direction or lower cylinder.</li>
                <li>Remove serviced request from queue and repeat until empty.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Dramatically reduces total head movement compared to FCFS.</li>
                    <li>Maximizes short-term disk throughput.</li>
                    <li>Simple greedy concept.</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>High probability of starvation for requests far from the current head cluster.</li>
                    <li>High variance in response times (unfair).</li>
                    <li>O(N²) search complexity if unsorted.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50, SSTF travels only <strong>208 cylinders</strong>.
          </div>
        </article>

        <!-- 3. SCAN -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 3</div>
          <h3>SCAN (Elevator Algorithm)</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                The disk arm starts at the initial cylinder and travels in the chosen direction (e.g. towards higher cylinders), 
                servicing all requests encountered along the way. Crucially, it continues all the way to the <strong>physical disk boundary</strong> 
                (cylinder <code>diskSize − 1</code> or <code>0</code>), reverses direction, and services remaining requests on the return sweep.
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Sort requests into two subsets: in front of head and behind head.</li>
                <li>Move arm in initial direction, servicing requests in ascending/descending order.</li>
                <li>Upon reaching the physical boundary (0 or diskSize − 1), reverse the arm direction.</li>
                <li>Sweep back, servicing the remaining requests in opposite order.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Completely eliminates starvation; every cylinder is visited within two sweeps.</li>
                    <li>Low variance in response times.</li>
                    <li>Smooth mechanical arm motion.</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>Unnecessary arm travel to physical disk boundaries even when no requests exist at the boundary.</li>
                    <li>Biased against cylinders just visited (new requests at start wait longest).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50 (moving right), SCAN travels <strong>332 cylinders</strong> (50→190→199 boundary→16).
          </div>
        </article>

        <!-- 4. C-SCAN -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 4</div>
          <h3>Circular SCAN (C-SCAN)</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                Designed to provide uniform waiting times. The head moves in only one direction servicing requests until it reaches 
                the physical boundary. It then instantly jumps to the opposite physical boundary <strong>without servicing requests on the return trip</strong>, 
                and resumes scanning in the original direction.
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Move in chosen direction, servicing requests sequentially.</li>
                <li>Travel to the physical boundary (e.g., cylinder <code>diskSize − 1</code>).</li>
                <li>Jump directly to opposite boundary (cylinder 0) without servicing any cylinders during the jump.</li>
                <li>Resume moving in the original direction, servicing remaining requests.</li>
                <li>Include return boundary jump in total physical movement calculation.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Provides uniform, equitable waiting times for all cylinders.</li>
                    <li>Cylinders at both extremes receive equal service opportunities.</li>
                    <li>No starvation.</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>Return jump from boundary to boundary adds additional head movement.</li>
                    <li>Still travels all the way to physical boundaries.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50 (moving right), C-SCAN travels <strong>391 cylinders</strong>.
          </div>
        </article>

        <!-- 5. LOOK -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 5</div>
          <h3>LOOK Algorithm</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                An intelligent optimization over SCAN. The disk arm "looks ahead" in the current direction. It travels only as far 
                as the <strong>final pending request</strong> in that direction, then reverses direction immediately without wasting seek time 
                traveling to the unused physical boundary cylinder (0 or <code>diskSize − 1</code>).
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Sort pending requests into direction sets.</li>
                <li>Service requests in current direction up to the maximum/minimum pending cylinder.</li>
                <li>Immediately reverse direction without reaching cylinder 0 or <code>diskSize − 1</code>.</li>
                <li>Service remaining requests in the reverse direction.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Eliminates unnecessary boundary seek overhead.</li>
                    <li>Significantly lower total head movement than SCAN.</li>
                    <li>No starvation.</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>Requires looking ahead at the pending queue to determine reversal point.</li>
                    <li>Slightly more complex controller logic.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50 (moving right), LOOK reverses at 190, traveling only <strong>314 cylinders</strong> (vs 332 in SCAN).
          </div>
        </article>

        <!-- 6. C-LOOK -->
        <article class="algo-detail-card">
          <div class="algo-card-badge">Algorithm 6</div>
          <h3>Circular LOOK (C-LOOK)</h3>
          <div class="algo-grid">
            <div class="algo-col">
              <h4>Working Principle</h4>
              <p>
                An intelligent circular optimization over C-SCAN. The arm moves in one direction up to the last pending request, 
                then jumps directly to the furthest pending request at the opposite end (rather than cylinder 0 or <code>diskSize − 1</code>), 
                and resumes servicing in the same direction.
              </p>
              <h4>Step-by-Step Logic</h4>
              <ol>
                <li>Move in chosen direction servicing requests up to the extreme pending request in that direction.</li>
                <li>Jump directly to the lowest pending request on the opposite end.</li>
                <li>Resume servicing requests in original direction until all are completed.</li>
              </ol>
            </div>
            <div class="algo-col">
              <div class="pros-cons-box">
                <div class="pros">
                  <strong>✓ Advantages:</strong>
                  <ul>
                    <li>Combines uniform waiting times of C-SCAN with boundary avoidance of LOOK.</li>
                    <li>Zero unnecessary seek steps to empty boundary tracks.</li>
                    <li>Predictable, balanced performance.</li>
                  </ul>
                </div>
                <div class="cons">
                  <strong>✗ Disadvantages:</strong>
                  <ul>
                    <li>Circular jump distance is still incurred.</li>
                    <li>Requires continuous tracking of queue extrema.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="algo-bench-note">
            <strong>Benchmark Performance:</strong> For queue [82, 170, 43, 140, 24, 16, 190] starting at 50 (moving right), C-LOOK jumps from 190 directly to 16, traveling <strong>341 cylinders</strong> (vs 391 in C-SCAN).
          </div>
        </article>
      </div>

      <!-- Quick Comparison Matrix Table -->
      <div class="comparison-matrix-section">
        <h3 class="section-subheading"><i class="icon-table"></i> Comprehensive Algorithm Comparison Matrix</h3>
        <div class="table-responsive">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Time Complexity</th>
                <th>Starvation Risk</th>
                <th>Boundary Sweep</th>
                <th>Fairness</th>
                <th>Average Seek Performance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FCFS</strong></td>
                <td>O(N)</td>
                <td><span class="status-good">None</span></td>
                <td>No</td>
                <td>High (Strict Order)</td>
                <td>Poor (High Thrashing)</td>
              </tr>
              <tr>
                <td><strong>SSTF</strong></td>
                <td>O(N²) / O(N log N)</td>
                <td><span class="status-bad">High Risk</span></td>
                <td>No</td>
                <td>Poor (Locality Bias)</td>
                <td>High (Greedy Local Optimum)</td>
              </tr>
              <tr>
                <td><strong>SCAN</strong></td>
                <td>O(N log N)</td>
                <td><span class="status-good">None</span></td>
                <td><span class="status-warn">Yes (Both/One End)</span></td>
                <td>Moderate</td>
                <td>Good (Bounded Motion)</td>
              </tr>
              <tr>
                <td><strong>C-SCAN</strong></td>
                <td>O(N log N)</td>
                <td><span class="status-good">None</span></td>
                <td><span class="status-warn">Yes (Both Ends)</span></td>
                <td>Very High (Uniform)</td>
                <td>Moderate (Jump Cost)</td>
              </tr>
              <tr>
                <td><strong>LOOK</strong></td>
                <td>O(N log N)</td>
                <td><span class="status-good">None</span></td>
                <td><span class="status-good">No (Reverses at Last Req)</span></td>
                <td>Moderate</td>
                <td>Very Good (Optimized SCAN)</td>
              </tr>
              <tr>
                <td><strong>C-LOOK</strong></td>
                <td>O(N log N)</td>
                <td><span class="status-good">None</span></td>
                <td><span class="status-good">No (Jumps between Reqs)</span></td>
                <td>Very High (Uniform)</td>
                <td>Very Good (Optimized C-SCAN)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
