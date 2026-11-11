# Operating Systems (1BCS304) Mini-Project
## Disk Scheduling Algorithm Simulator – Viva Preparation Guide

**Institution:** Seshadripuram Institute of Technology, Mysuru  
**Department:** Computer Science and Engineering  
**Academic Year:** 2026–2027  
**Project Team:**
- Shariffa Zainab (USN: `4PQ25IS022`)
- Spoorthy CM (USN: `4PQ25IS028`)  
**Project Guide:** Srinidhi H R, Assistant Professor, Dept of CSE  

---

## Part 1: Secondary Storage Structure & Disk Hardware Fundamentals

### Q1. What is the physical architecture of a Hard Disk Drive (HDD)?
**Answer:**  
A traditional magnetic hard disk drive consists of:
1. **Platters:** Circular rigid disks coated with magnetic recording material, stacked on a central spindle.
2. **Spindle:** Rotates the platters at high constant angular velocity (commonly 5400 RPM, 7200 RPM, 10000 RPM, or 15000 RPM).
3. **Tracks:** Concentric circular rings on the surface of each platter where magnetic flux transitions store bits.
4. **Sectors:** Radial subdivisions of a track, typically storing 512 bytes or 4096 bytes (Advanced Format) of data along with sector headers and error-correcting codes (ECC).
5. **Cylinders:** The set of all tracks across all platter surfaces located at the exact same radial arm offset from the spindle. Cylinder numbering begins at 0 (innermost or outermost track) up to $N-1$.
6. **Read/Write Heads & Actuator Arm:** Electromagnetic heads attached to a rigid comb-like actuator arm driven by a voice coil motor. All heads move radially together across the platters in unison.

---

### Q2. What are the components of Disk Access Time?
**Answer:**  
Disk Access Time ($T_{\text{access}}$) is composed of:
$$T_{\text{access}} = T_{\text{seek}} + T_{\text{rotational}} + T_{\text{transfer}} + T_{\text{controller}}$$

1. **Seek Time ($T_{\text{seek}}$):** The mechanical time required for the actuator arm to move the read/write head from its current cylinder to the target cylinder. This is the **dominant mechanical bottleneck**, averaging between 3 ms and 10 ms.
2. **Rotational Latency ($T_{\text{rotational}}$):** The time spent waiting for the target sector to rotate beneath the head once the head reaches the cylinder. On average:
   $$T_{\text{rotational}} = \frac{1}{2} \times \left(\frac{60}{\text{RPM}}\right) \text{ seconds}$$
   (e.g., at 7200 RPM, average rotational latency is $\approx 4.17\text{ ms}$).
3. **Transfer Time ($T_{\text{transfer}}$):** The electrical time to magnetically stream the data between the platter surface and the drive controller buffer:
   $$T_{\text{transfer}} = \frac{b}{r \cdot N}$$
   where $b$ is bytes to transfer, $r$ is RPM, and $N$ is bytes per track.
4. **Controller Overhead ($T_{\text{controller}}$):** Time required for the disk controller electronics to decode the command, verify ECC, and manage bus transfer.

---

### Q3. Why do we need Disk Scheduling Algorithms?
**Answer:**  
In a multiprogramming operating system, numerous processes concurrently request disk read and write operations. Because mechanical seek time is orders of magnitude slower than electronic processor execution (milliseconds vs. nanoseconds), servicing requests blindly in arrival order leads to severe arm thrashing across cylinders.  
**Objectives of Disk Scheduling:**
1. Minimize **Total Head Movement (Seek Distance)**.
2. Maximize **Disk Bandwidth / Throughput** (bytes transferred per second).
3. Minimize **Average Waiting Time** and **Response Time**.
4. Guarantee **Fairness** and prevent **Starvation**.

---

### Q4. What is Total Head Movement (THM) and how is it calculated?
**Answer:**  
Total Head Movement represents the cumulative sum of physical radial cylinder displacements traversed by the disk head to service all requests:
$$\text{THM} = \sum_{i=1}^{k} |C_i - C_{i-1}|$$
where $C_0$ is the initial head position, and $C_1, C_2, \dots, C_k$ are the sequential cylinder stops along the path (including boundary visits and circular resets).

---

## Part 2: The Six Disk Scheduling Algorithms

### Q5. Explain First-Come, First-Served (FCFS) Disk Scheduling.
**Answer:**
- **Working Principle:** Requests are serviced in the exact sequential order in which they arrive in the I/O request queue, without reordering.
- **Time Complexity:** $O(N)$
- **Advantages:**
  - Utterly simple to implement in hardware or software.
  - Intrinsically fair; zero possibility of starvation.
- **Disadvantages:**
  - Severe arm thrashing when requests alternate between widely separated cylinders.
  - Produces the highest Total Head Movement and worst average seek time among standard algorithms.
- **Viva Check Calculation:**  
  For Initial Head = $50$, Requests = $[82, 170, 43, 140, 24, 16, 190]$:
  $$\text{Path: } 50 \to 82 \to 170 \to 43 \to 140 \to 24 \to 16 \to 190$$
  $$\text{Seek: } 32 + 88 + 127 + 97 + 116 + 8 + 174 = 642 \text{ cylinders}.$$

---

### Q6. Explain Shortest Seek Time First (SSTF). How does it handle ties?
**Answer:**
- **Working Principle:** A greedy heuristic that evaluates all pending requests and selects the request closest to the current head position ($|C_{\text{candidate}} - C_{\text{current}}|$ is minimum).
- **Time Complexity:** $O(N^2)$ for an unsorted queue, or $O(N \log N)$ with balanced search trees.
- **Tie-Breaking Rule:** When two candidate cylinders are equidistant from the head (e.g. Head at 50, requests at 40 and 60, both $\Delta = 10$), our simulator adheres to the documented standard OS tie-break:
  1. Prefer the candidate lying in the current direction of arm movement.
  2. If direction is neutral or still tied, choose the lower cylinder index.
- **Advantages:** Dramatically reduces Total Head Movement compared to FCFS.
- **Disadvantages:** **Vulnerable to Starvation!** If incoming requests consistently cluster near the head's current cylinder, distant pending requests may wait indefinitely.

---

### Q7. Explain the SCAN (Elevator) Algorithm. Why does it travel to the physical boundary?
**Answer:**
- **Working Principle:** The arm moves in a chosen initial direction (e.g., towards increasing cylinder indices), servicing all requests encountered along the way. Crucially, it continues all the way to the **physical disk boundary** ($0$ or $\text{diskSize} - 1$), reverses direction, and sweeps back servicing remaining requests in the opposite direction.
- **Why travel to the boundary?**  
  In classic hardware controllers with linear potentiometer sensors, physical boundary stops served as calibration endpoints and guaranteed an invariant sweep cycle.
- **Starvation:** Completely eliminates starvation because every cylinder is guaranteed to be visited within at most two sweeps.
- **Viva Check Calculation:**  
  Head = $50$, Queue = $[82, 170, 43, 140, 24, 16, 190]$, Direction = Right, Disk Size = $200$ (0–199):
  $$\text{Path: } 50 \to 82 \to 140 \to 170 \to 190 \to \mathbf{199} \to 43 \to 24 \to 16$$
  $$\text{Total Movement: } (199 - 50) + (199 - 16) = 149 + 183 = 332 \text{ cylinders}.$$

---

### Q8. What is Circular SCAN (C-SCAN) and what problem does it solve?
**Answer:**
- **Motivation:** In standard SCAN, when the head reverses at the boundary, cylinders near the opposite boundary have waited the longest, while cylinders near the reversal point were just serviced. SCAN has an inherent variance in waiting time.
- **Working Principle:** C-SCAN moves in one direction only. When it reaches the physical boundary (e.g., $199$), it immediately performs a **return jump** to the opposite physical boundary ($0$) without servicing any requests along the return trip. It then resumes scanning in the original direction.
- **Result:** Provides a more uniform, equitable waiting time across all cylinders.
- **Accounting for Jump:** In physical head movement calculation, the circular return from boundary to boundary ($|0 - 199| = 199$) is counted as physical head travel.
- **Viva Check Calculation:**  
  Head = $50$, Queue = $[82, 170, 43, 140, 24, 16, 190]$, Direction = Right, Disk Size = $200$:
  $$\text{Path: } 50 \to 82 \to 140 \to 170 \to 190 \to \mathbf{199} \to \mathbf{0} \to 16 \to 24 \to 43$$
  $$\text{Total Movement: } (199 - 50) + (199 - 0) + (43 - 0) = 149 + 199 + 43 = 391 \text{ cylinders}.$$

---

### Q9. What is the fundamental difference between SCAN and LOOK?
**Answer:**
| Feature | SCAN | LOOK |
| :--- | :--- | :--- |
| **Reversal Point** | Continues all the way to the **physical disk boundary** ($0$ or $\text{diskSize}-1$). | Reverses direction at the **final pending request** in the current direction. |
| **Boundary Overhead** | Incurs unnecessary seek overhead traveling to empty boundary tracks. | Eliminates unnecessary boundary seek travel. |
| **Total Movement** | Always $\ge$ LOOK for identical workloads. | Strictly less than or equal to SCAN. |
| **Prompt Sample Check** | Total Movement = **332 cylinders** | Total Movement = **314 cylinders** |

---

### Q10. What is the fundamental difference between C-SCAN and C-LOOK?
**Answer:**
| Feature | C-SCAN | C-LOOK |
| :--- | :--- | :--- |
| **Forward Boundary** | Travels all the way to the physical boundary (e.g. $199$). | Stops at the highest pending request (e.g. $190$). |
| **Return Jump Target** | Jumps directly to the opposite physical boundary ($0$). | Jumps directly to the lowest pending request ($16$). |
| **Jump Distance** | $|199 - 0| = 199$ cylinders. | $|190 - 16| = 174$ cylinders. |
| **Prompt Sample Check** | Total Movement = **391 cylinders** | Total Movement = **341 cylinders** |

---

## Part 3: Deep Technical Viva Questions & Evaluation Criteria

### Q11. Is one disk scheduling algorithm universally the best?
**Answer:**  
**No!** The optimal algorithm depends heavily on the arrival rate, spatial distribution of cylinder requests, and system priorities:
- Under **light loads**, FCFS or SSTF perform adequately because the queue is short.
- Under **heavy loads**, SCAN, LOOK, C-SCAN, and C-LOOK provide much better throughput and bounded waiting times.
- If the goal is **minimum total movement**, SSTF or LOOK frequently win.
- If the goal is **uniform response time / fairness**, C-LOOK or C-SCAN win.
- In modern enterprise operating systems, hybrid schedulers like Linux **Deadline** and **CFQ (Completely Fair Queuing)** are utilized.

---

### Q12. How does disk scheduling differ between traditional HDDs and modern SSDs?
**Answer:**  
- **Solid State Drives (SSDs)** have **no moving mechanical parts** (no platters, no arm, no spindle). Data is stored in NAND flash memory chips.
- Therefore, in an SSD, **Seek Time is virtually zero ($0\text{ ms}$)** regardless of which logical block address (LBA) is accessed.
- Traditional disk scheduling algorithms designed to minimize mechanical arm travel (SCAN, LOOK) are **not needed** on SSDs.
- Instead, SSD I/O schedulers focus on:
  1. Merging contiguous I/O blocks to maximize bus bandwidth.
  2. Wear leveling to distribute write cycles across flash cells.
  3. Parallelism across multiple flash channels and dies (e.g., NVMe submission/completion queues).
  4. In Linux, SSDs typically use the `none` or `kyber` scheduler.

---

### Q13. What is the elevator algorithm and why is it named so?
**Answer:**  
SCAN and LOOK are called **elevator algorithms** because their behavior mirrors an elevator in a multistory building:
- An elevator travels upwards servicing all passengers who pressed floors above, until it reaches the highest requested floor (LOOK) or the top floor (SCAN).
- It does not immediately drop down to the basement if someone on floor 1 presses a button while it is rising past floor 8; it continues upward, finishes all upward passengers, then reverses and services downward requests.
- This prevents passenger starvation and optimizes motor travel.

---

### Q14. What is Arm Thrashing?
**Answer:**  
Arm Thrashing occurs when the read/write head is forced to repeatedly traverse back and forth across large fractions of the disk platters to service alternating requests (e.g., cylinder 15, then 185, then 20, then 175). FCFS is notoriously vulnerable to arm thrashing under non-sequential workloads, wasting excessive time in mechanical seek rather than data transfer.

---

### Q15. How does the software handle duplicate cylinder requests and requests at the initial head position?
**Answer:**  
1. **Request at Initial Head:** Serviced immediately with an absolute seek distance of $0$ cylinders, accurately contributing $0$ to Total Head Movement.
2. **Duplicate Requests:** In disk controllers, if multiple pending read requests target the exact same cylinder, they can either be coalesced into a single sweep or serviced consecutively with $0$ seek displacement. Our simulator transparently processes all requests while alerting the user with an informational notice.

---

## Part 4: Quick Viva Formula Reference Card

$$\text{Seek Distance between } A \text{ and } B = |B - A|$$
$$\text{Average Head Movement} = \frac{\text{Total Head Movement}}{\text{Total Number of Requests}}$$
$$\text{Estimated Seek Time} = \text{Total Head Movement} \times \text{Seek Rate (ms/cylinder)}$$
$$\text{Rotational Delay at } R \text{ RPM} = \frac{1}{2} \times \frac{60}{R} \times 1000 \text{ ms}$$

### Reference Benchmark Comparison Summary (Head: 50, Queue: [82, 170, 43, 140, 24, 16, 190], Dir: Right, Disk: 200)

| Algorithm | Seek Sequence | Total Head Movement | Avg Movement |
| :--- | :--- | :---: | :---: |
| **FCFS** | 50 → 82 → 170 → 43 → 140 → 24 → 16 → 190 | **642 cyl** | 91.71 cyl/req |
| **SSTF** | 50 → 43 → 24 → 16 → 82 → 140 → 170 → 190 | **208 cyl** | 29.71 cyl/req |
| **SCAN** | 50 → 82 → 140 → 170 → 190 → 199 → 43 → 24 → 16 | **332 cyl** | 47.43 cyl/req |
| **C-SCAN** | 50 → 82 → 140 → 170 → 190 → 199 → 0 → 16 → 24 → 43 | **391 cyl** | 55.86 cyl/req |
| **LOOK** | 50 → 82 → 140 → 170 → 190 → 43 → 24 → 16 | **314 cyl** | 44.86 cyl/req |
| **C-LOOK** | 50 → 82 → 140 → 170 → 190 → 16 → 24 → 43 | **341 cyl** | 48.71 cyl/req |
