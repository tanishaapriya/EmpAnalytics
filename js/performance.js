document.addEventListener('DOMContentLoaded', () => {
    // Global Chart Defaults for Dark Theme
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = 'Outfit';

    let trendChart, distChart;

    const initPerformance = async () => {
        try {
            const [perfRes, empRes, taskRes] = await Promise.all([
                fetch(`${API_BASE}/performance`),
                fetch(`${API_BASE}/employees`),
                fetch(`${API_BASE}/tasks`)
            ]);

            const performance = await perfRes.json();
            const employees = await empRes.json();
            const tasks = await taskRes.json();

            // 1. Update Summary Analytics
            updateSummaryStats(employees, performance);

            // 2. Process Data by Department (Now with real task counts)
            const deptStats = processDeptStats(employees, performance, tasks);
            renderDeptTable(deptStats);

            // 3. Render Individual Performance Cards
            renderPerformanceCards(employees, performance);

            // 4. Initialize Charts
            initTrendChart(deptStats);
            initDistChart(performance, employees.length);

        } catch (err) {
            console.error("Performance Init Error:", err);
            showError("Intelligence systems failed to synthesize performance metrics.");
        }
    };

    function updateSummaryStats(employees, performance) {
        if (performance.length === 0) return;

        const scores = performance.map(p => {
            const s = p.score || 0;
            return s <= 5 ? s * 20 : s;
        });
        const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        
        // Find top and low performers
        const sortedPerf = [...performance].sort((a, b) => b.score - a.score);
        const top = sortedPerf[0];
        const low = sortedPerf[sortedPerf.length - 1];

        const topEmp = employees.find(e => e.employee_id === top.employee_id);
        const lowEmp = employees.find(e => e.employee_id === low.employee_id);

        if (document.getElementById('stat-avg-score')) {
            document.getElementById('stat-avg-score').innerText = `${avg}%`;
        }

        if (topEmp && document.getElementById('stat-top-performer-val')) {
            const topScore = (top.score <= 5) ? top.score * 20 : top.score;
            document.getElementById('stat-top-performer-val').innerText = topEmp.employee_name;
            document.getElementById('stat-top-performer-label').innerText = `Top Performer (${topScore}%)`;
        }
        if (lowEmp && document.getElementById('stat-low-performer-val')) {
            const lowScore = (low.score <= 5) ? low.score * 20 : low.score;
            document.getElementById('stat-low-performer-val').innerText = lowEmp.employee_name;
            document.getElementById('stat-low-performer-label').innerText = `Lowest Score (${lowScore}%)`;
        }
    }

    function processDeptStats(employees, performance, tasks) {
        const stats = {};
        employees.forEach(emp => {
            if (!stats[emp.dept]) {
                stats[emp.dept] = { scores: [], count: 0, taskCount: 0, topPerformer: { name: '', score: 0 } };
            }
            
            // Performance Score
            const perf = performance.find(p => p.employee_id === emp.employee_id);
            if (perf) {
                let s = perf.score || 0;
                const scorePercent = s <= 5 ? s * 20 : s;
                stats[emp.dept].scores.push(scorePercent);
                stats[emp.dept].count++;
                
                if (scorePercent > stats[emp.dept].topPerformer.score) {
                    stats[emp.dept].topPerformer = { name: emp.employee_name, score: scorePercent };
                }
            }

            // Task Count
            const empTasks = tasks.filter(t => (t.employee_id === emp.employee_id || t.assigned_to === emp.employee_id) && (t.status || '').toLowerCase() === 'completed');
            stats[emp.dept].taskCount += empTasks.length;
        });
        return stats;
    }

    function renderDeptTable(deptStats) {
        const tableBody = document.querySelector('.dept-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = Object.keys(deptStats).map(dept => {
            const data = deptStats[dept];
            const avg = data.scores.length > 0 
                ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
                : 0;
            
            return `
                <tr>
                    <td style="font-weight: 600;">${dept}</td>
                    <td>${avg}%</td>
                    <td><span class="performer-badge">${data.topPerformer.name || 'N/A'}</span></td>
                    <td><span style="color: var(--primary); font-weight: 600;">${data.taskCount}</span></td>
                    <td class="${avg > 75 ? 'trend-up' : 'trend-down'}">${avg > 75 ? '↑' : '↓'} ${(Math.random() * 2).toFixed(1)}%</td>
                </tr>
            `;
        }).join('');
    }

    function renderPerformanceCards(employees, performance) {
        const grid = document.getElementById('performance-grid');
        if (!grid) return;

        grid.innerHTML = employees.map((emp, index) => {
            const perf = performance.find(p => p.employee_id === emp.employee_id);
            let s = perf ? perf.score : 0;
            const score = s <= 5 ? s * 20 : s;
            const initials = (emp.employee_name || 'U').split(' ').map(n => n[0]).join('');
            
            let scoreColor = 'var(--primary)';
            if (score >= 80) scoreColor = 'var(--success)';
            if (score < 60) scoreColor = 'var(--danger)';

            return `
                <div class="score-card fade-up" style="animation-delay: ${0.5 + (index * 0.05)}s">
                    <div class="assignee-img" style="width: 50px; height: 50px; border-radius: 50%; background: var(--border); color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                        ${initials}
                    </div>
                    <h4 style="font-family: 'Outfit'; margin-bottom: 4px;">${emp.employee_name}</h4>
                    <span class="performer-badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">${emp.dept}</span>
                    <div class="score-ring-container">
                        <svg class="score-ring-svg" width="100" height="100">
                            <circle class="score-ring-bg" cx="50" cy="50" r="45"></circle>
                            <circle class="score-ring-progress" cx="50" cy="50" r="45" data-score="${score}" style="stroke: ${scoreColor};"></circle>
                        </svg>
                        <span class="score-text">${score}%</span>
                    </div>
                    <button class="btn update-perf-btn" data-id="${emp.employee_id}" data-name="${emp.employee_name}" style="width: 100%; border: 1px solid var(--primary); background: rgba(255, 107, 0, 0.1); color: var(--primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; border-radius: 6px; padding: 10px;">UPDATE RATING</button>
                </div>
            `;
        }).join('');

        // Attach listeners for dynamic updates
        document.querySelectorAll('.update-perf-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                openPerformanceUpdate(id, name);
            };
        });

        setTimeout(animateRings, 100);
    }

    function openPerformanceUpdate(id, name) {
        tacticalPrompt(`EVALUATE OPERATIVE: ${name}`, [
            { 
                key: 'score', 
                label: 'PERFORMANCE RATING (1-5)', 
                type: 'select',
                options: [
                    { label: '5 - Exceptional', value: 5 },
                    { label: '4 - Commendable', value: 4 },
                    { label: '3 - Satisfactory', value: 3 },
                    { label: '2 - Improvement Needed', value: 2 },
                    { label: '1 - Critical Failure', value: 1 }
                ]
            }
        ], async (data) => {
            try {
                const response = await fetch(`${API_BASE}/performance/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: parseInt(data.score) })
                });

                if (!response.ok) throw new Error("Failed to upload intelligence metric.");
                
                // Real-time refresh
                initPerformance();
                showSuccess(`Operative ${name} re-evaluated.`);
            } catch (err) {
                showError(err.message);
            }
        });
    }

    function showSuccess(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; background: #22c55e; color: white;
            padding: 12px 24px; border-radius: 8px; font-weight: 600; z-index: 10000;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); animation: slideInRight 0.3s forwards;
        `;
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function animateRings() {
        const rings = document.querySelectorAll('.score-ring-progress');
        const circumference = 2 * Math.PI * 45; 

        rings.forEach(ring => {
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = circumference;
            const score = parseInt(ring.getAttribute('data-score'));
            const offset = circumference - (score / 100) * circumference;
            setTimeout(() => { ring.style.strokeDashoffset = offset; }, 50);
        });
    }

    function initTrendChart(deptStats) {
        const trendCtx = document.getElementById('monthlyTrendChart');
        if (!trendCtx) return;

        const depts = Object.keys(deptStats).slice(0, 4);
        const datasets = depts.map((dept, i) => {
            const colors = ['#ff6b00', '#f97316', '#fb923c', '#fdba74'];
            const avg = deptStats[dept].scores.length > 0 
                ? (deptStats[dept].scores.reduce((a, b) => a + b, 0) / deptStats[dept].scores.length)
                : 75;
            const trendData = [avg-5, avg-2, avg-3, avg+1, avg, avg+2].map(v => Math.max(0, Math.min(100, v)));
            
            return {
                label: dept,
                data: trendData,
                borderColor: colors[i],
                backgroundColor: 'transparent',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#121214'
            };
        });

        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#ffffff', usePointStyle: true } },
                    tooltip: { backgroundColor: '#18181b', titleColor: '#ff6b00' }
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: '#27272a' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function initDistChart(performance, empCount) {
        const distCtx = document.getElementById('scoreDistChart');
        if (!distCtx) return;

        // Update the central count
        const countEl = document.getElementById('dist-total-count');
        if (countEl) countEl.innerText = empCount;

        const scores = performance.map(p => p.score);
        const distribution = [
            scores.filter(s => s === 5).length,
            scores.filter(s => s === 4).length,
            scores.filter(s => s === 3).length,
            scores.filter(s => s <= 2).length
        ];

        distChart = new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent (5)', 'Good (4)', 'Average (3)', 'High Risk (1-2)'],
                datasets: [{
                    data: distribution,
                    backgroundColor: ['#22c55e', '#f97316', '#fb923c', '#ff4444'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, color: '#a1a1aa' } }
                }
            }
        });
    }

    // Trigger Initial Load
    initPerformance();
});
