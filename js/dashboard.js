document.addEventListener('DOMContentLoaded', () => {
    // Global Chart Defaults for Dark Theme
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = 'Outfit';
    
    let performanceChart, workloadChart;
    let liveSimulationInterval = null;

    // 1. Performance Trend Chart (Line Chart)
    const perfCtx = document.getElementById('performanceTrendChart');
    if (perfCtx) {
        performanceChart = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Engineering',
                        data: [78, 82, 85, 84, 89, 92],
                        borderColor: '#ff6b00',
                        backgroundColor: 'rgba(255, 107, 0, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#ff6b00'
                    },
                    {
                        label: 'Sales',
                        data: [65, 70, 68, 75, 82, 80],
                        borderColor: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#f97316'
                    },
                    {
                        label: 'HR',
                        data: [85, 84, 88, 86, 85, 88],
                        borderColor: '#fb923c',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#fb923c'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 },
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderWidth: 1,
                        titleFont: { size: 14, weight: '700' },
                        bodyFont: { size: 13 },
                        titleColor: '#ff6b00'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        grid: { color: '#27272a', drawBorder: false },
                        ticks: { color: '#a1a1aa' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a1a1aa' }
                    }
                }
            }
        });
    }

    // 2. Department Workload Chart (Horizontal Bar Chart)
    const workCtx = document.getElementById('workloadChart');
    if (workCtx) {
        workloadChart = new Chart(workCtx, {
            type: 'bar',
            data: {
                labels: ['Engineering', 'Product', 'Sales', 'Marketing', 'HR'],
                datasets: [{
                    data: [85, 72, 64, 58, 42],
                    backgroundColor: [
                        '#ff6b00', '#f97316', '#fb923c', '#fdba74', '#fed7aa'
                    ],
                    borderRadius: 8,
                    barThickness: 24
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderWidth: 1,
                        padding: 12,
                        titleColor: '#ff6b00'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#27272a', drawBorder: false },
                        ticks: { color: '#a1a1aa' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#ffffff', font: { weight: '500' } }
                    }
                }
            }
        });
    }

    // Simulation Engine Logic
    const startSimulation = () => {
        if (liveSimulationInterval) return;
        
        liveSimulationInterval = setInterval(() => {
            // Jitter Chart Data
            if (performanceChart) {
                performanceChart.data.datasets.forEach(dataset => {
                    const lastIdx = dataset.data.length - 1;
                    const change = (Math.random() - 0.5) * 4;
                    dataset.data[lastIdx] = Math.min(100, Math.max(50, dataset.data[lastIdx] + change));
                });
                performanceChart.update('none'); // Update without animation for continuous feel
            }

            if (workloadChart) {
                workloadChart.data.datasets[0].data = workloadChart.data.datasets[0].data.map(val => {
                    const change = (Math.random() - 0.5) * 2;
                    return Math.min(100, Math.max(20, val + change));
                });
                workloadChart.update('none');
            }

            // Jitter Stat Counters
            jitterStat("count-tasks", 134, 5);
            jitterStat("count-perf", 76.4, 0.5, true);
            jitterStat("count-attr", 18, 1);
        }, 3000);
    };

    const stopSimulation = () => {
        if (liveSimulationInterval) {
            clearInterval(liveSimulationInterval);
            liveSimulationInterval = null;
        }
    };

    const jitterStat = (id, base, range, isDecimal = false) => {
        const el = document.getElementById(id);
        if (!el) return;
        const offset = (Math.random() - 0.5) * range;
        const val = base + offset;
        el.innerHTML = isDecimal ? val.toFixed(1) + '%' : Math.round(val);
        el.style.color = '#ff6b00';
        setTimeout(() => el.style.color = '', 300);
    };

    // Live Feed Toggle Listener
    const liveToggle = document.getElementById('liveFeedToggle');
    if (liveToggle) {
        liveToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                startSimulation();
                console.log("Live Intel Feed: ACTIVE");
            } else {
                stopSimulation();
                console.log("Live Intel Feed: STANDBY");
            }
        });
    }

    // Fetch All Data and Initialize
    const initDashboard = async () => {
        try {
            const [empRes, taskRes, perfRes, attrRes] = await Promise.all([
                fetch(`${API_BASE}/employees`),
                fetch(`${API_BASE}/tasks`),
                fetch(`${API_BASE}/performance`),
                fetch(`${API_BASE}/attrition/high-risk`)
            ]);

            if (!empRes.ok || !taskRes.ok || !perfRes.ok || !attrRes.ok) 
                throw new Error("Intelligence systems partially offline.");

            const employees = await empRes.json();
            const tasks = await taskRes.json();
            const performance = await perfRes.json();
            const highRisk = await attrRes.json();

            // 1. Calculate Stats
            // 1. Calculate Stats
            const totalEmps = employees.length;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
            const onTrackRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            const avgPerfRaw = performance.length > 0 
                ? (performance.reduce((acc, p) => {
                    const s = p.score || 0;
                    return acc + (s <= 5 ? s * 20 : s);
                }, 0) / performance.length) 
                : 0;
            const avgPerf = avgPerfRaw.toFixed(1); 
            const highRiskCount = highRisk.length;

            // Update UI
            if (typeof animateValue === 'function') {
                animateValue("count-employees", 0, totalEmps, 1500);
                animateValue("count-tasks", 0, totalTasks, 1500);
                document.getElementById('count-perf').innerText = `${avgPerf}%`;
                animateValue("count-attr", 0, highRiskCount, 1500);
            } else {
                document.getElementById('count-employees').innerText = totalEmps;
                document.getElementById('count-tasks').innerText = totalTasks;
                document.getElementById('count-perf').innerText = `${avgPerf}%`;
                document.getElementById('count-attr').innerText = highRiskCount;
            }

            // Update trend chips
            const taskTrend = document.querySelector('#count-tasks + .stat-label + .trend-chip');
            if (taskTrend) taskTrend.innerHTML = `<i class="fas fa-check" style="margin-right: 4px;"></i> ${onTrackRate}% on track`;
            
            const attrTrend = document.querySelector('#count-attr + .stat-label + .trend-chip');
            if (attrTrend) {
                attrTrend.style.background = highRiskCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                attrTrend.style.color = highRiskCount > 0 ? 'var(--danger)' : 'var(--success)';
                attrTrend.innerText = highRiskCount > 0 ? 'Critical Attention' : 'Stable Ops';
            }

            // 2. Update Workload Chart (Tasks per Dept)
            if (workloadChart) {
                const deptWork = {};
                // Count active tasks per department by mapping assigned_to to employee's dept
                tasks.forEach(t => {
                    const emp = employees.find(e => e.employee_id === t.employee_id || e.employee_id === t.assigned_to);
                    if (emp) {
                        deptWork[emp.dept] = (deptWork[emp.dept] || 0) + 1;
                    }
                });
                
                const labels = Object.keys(deptWork);
                const data = Object.values(deptWork);
                
                workloadChart.data.labels = labels.length ? labels : ['No Active Tasks'];
                workloadChart.data.datasets[0].data = data.length ? data : [0];
                workloadChart.update();
            }

            // 2b. Update Performance Trend (Dept Avg)
            if (performanceChart) {
                const deptPerf = {};
                employees.forEach(e => {
                    const p = performance.find(perf => perf.employee_id === e.employee_id);
                    if (p) {
                        if (!deptPerf[e.dept]) deptPerf[e.dept] = { sum: 0, count: 0 };
                        const s = p.score <= 5 ? p.score * 20 : p.score;
                        deptPerf[e.dept].sum += s;
                        deptPerf[e.dept].count++;
                    }
                });

                const datasets = Object.keys(deptPerf).map((dept, i) => {
                    const avg = deptPerf[dept].sum / deptPerf[dept].count;
                    const baseColors = ['#ff6b00', '#f97316', '#fb923c', '#fdba74'];
                    return {
                        label: dept,
                        data: [avg-5, avg-2, avg-3, avg+1, avg-1, avg], // Mock history but ending in real avg
                        borderColor: baseColors[i % 4],
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3
                    };
                });

                if (datasets.length) {
                    performanceChart.data.datasets = datasets;
                    performanceChart.update();
                }
            }

            // 3. Populate Recent Activity (Latest Tasks)
            const activityList = document.getElementById('activity-f-list');
            if (activityList) {
                const latestTasks = [...tasks].reverse().slice(0, 6);
                activityList.innerHTML = latestTasks.map(t => {
                    const statusColor = (t.status || '').toLowerCase() === 'completed' ? 'var(--success)' : 'var(--primary)';
                    return `
                        <div class="activity-item" style="border-color: ${statusColor};">
                            <div>
                                <p style="font-size: 0.9rem; font-weight: 500;">Task: <strong>${t.task_name}</strong> marked as ${t.status}</p>
                                <p style="font-size: 0.75rem; color: var(--text-muted);">Persistence ID: #${t.task_id}</p>
                            </div>
                        </div>
                    `;
                }).join('') || '<p style="padding:1rem; color:var(--text-muted)">No recent intel.</p>';
            }

            // 4. Populate Top Performers
            const performerList = document.getElementById('top-performer-render-list');
            if (performerList) {
                const combined = employees.map(e => {
                    const p = performance.find(perf => perf.employee_id === e.employee_id);
                    let s = p ? (p.score || 0) : 0;
                    const finalScore = s <= 5 ? s * 20 : s;
                    return { ...e, score: finalScore };
                }).sort((a, b) => b.score - a.score).slice(0, 5);

                const colors = ['#4338CA', '#92400E', '#1E40AF', '#065F46', '#6B21A8'];
                const bgs = ['#E0E7FF', '#FEF3C7', '#DBEAFE', '#D1FAE5', '#F3E8FF'];

                performerList.innerHTML = combined.map((emp, i) => {
                    const initials = (emp.employee_name || 'U').split(' ').map(n => n[0]).join('');
                    return `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 40px; height: 40px; border-radius: 12px; background: ${bgs[i % 5]}; color: ${colors[i % 5]}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">${initials}</div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <p style="font-size: 0.9rem; font-weight: 600;">${emp.employee_name}</p>
                                    <p style="font-size: 0.9rem; font-weight: 700; color: ${emp.score >= 80 ? 'var(--success)' : 'var(--primary)'};">${emp.score}%</p>
                                </div>
                                <div style="height: 6px; background: var(--border); border-radius: 3px; position: relative; overflow: hidden;">
                                    <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${emp.score}%; background: ${emp.score >= 80 ? 'var(--success)' : 'var(--primary)'};"></div>
                                </div>
                                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${emp.dept} • Operative</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }

        } catch (err) {
            console.error("Dashboard Init Error:", err);
            // showError is global from config.js
            if (typeof showError === 'function') showError("Failed to initialize dashboard intelligence.");
        }
    };

    initDashboard();
});
