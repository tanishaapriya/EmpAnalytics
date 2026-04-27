document.addEventListener('DOMContentLoaded', () => {
    // Global Chart Defaults for Dark Theme
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = 'Outfit';

    const riskTableBody = document.getElementById('riskTableBody');
    const riskBannerText = document.getElementById('risk-banner-text');

    async function initAttritionIntelligence() {
        try {
            riskBannerText.innerHTML = `<i class="fas fa-microchip fa-spin"></i> Synthesizing AI Risk Models...`;
            
            const response = await fetch(`${API_BASE}/predict/all`);
            if (!response.ok) throw new Error('AI Intelligence Link Offline');
            
            const riskData = await response.json();

            // 1. Process for UI (Add tenure mock if needed for visual)
            const fullData = riskData.map(item => ({
                ...item,
                tenure: ((item.employee_id % 5) + 1.2).toFixed(1) // Visual filler for now
            }));

            // 2. Update Dashboard UI
            updateRiskMetrics(fullData);
            
            // 3. Render Table
            renderRiskTable(fullData);
            
            // 4. Render Chart
            renderRiskDistribution(fullData);

        } catch (err) {
            console.error("Attrition Init Error:", err);
            showError("Intelligence systems failed. Predictive models offline.");
            riskBannerText.innerText = "CRITICAL: Analysis Link Severed.";
        }
    }

    function updateRiskMetrics(data) {
        const high = data.filter(e => e.level === 'HIGH').length;
        const medium = data.filter(e => e.level === 'MEDIUM').length;
        const low = data.filter(e => e.level === 'LOW').length;

        // Banner
        if (riskBannerText) {
            riskBannerText.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i> ${high} employees are currently flagged as High Risk. Immediate HR intervention recommended.`;
        }

        // Stat Cards (using global animateValue if exists)
        if (typeof animateValue === 'function') {
            animateValue("stat-high-risk", 0, high, 800);
            animateValue("stat-medium-risk", 0, medium, 800);
            animateValue("stat-low-risk", 0, low, 800);
        } else {
            document.getElementById('stat-high-risk').innerText = high;
            document.getElementById('stat-medium-risk').innerText = medium;
            document.getElementById('stat-low-risk').innerText = low;
        }
    }

    function renderRiskTable(data) {
        if (!riskTableBody) return;

        riskTableBody.innerHTML = data.map((emp, index) => {
            const riskClass = emp.level.toLowerCase();
            const accentColor = emp.level === 'HIGH' ? 'var(--danger)' : (emp.level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)');
            const actionText = emp.level === 'HIGH' ? 'Intervene' : (emp.level === 'MEDIUM' ? 'Monitor' : 'No Action');

            return `
                <tr class="${emp.level === 'HIGH' ? 'row-high-risk' : ''} fade-up" style="animation-delay: ${0.2 + (index * 0.1)}s">
                    <td style="font-weight: 600;">${emp.employee_name || 'Operative ' + emp.employee_id}</td>
                    <td>${emp.dept || 'Unassigned'}</td>
                    <td>${emp.tenure} yrs</td>
                    <td>₹${emp.salary.toLocaleString()}</td>
                    <td>${(emp.score <= 5 ? emp.score * 20 : emp.score)}%</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="risk-score-bar-container">
                                <div class="risk-score-bar" style="width: ${emp.riskScore}%; background: ${accentColor};"></div>
                            </div>
                            <span>${emp.riskScore}</span>
                        </div>
                    </td>
                    <td><span class="risk-status-badge risk-${riskClass}">${emp.level}</span></td>
                    <td>
                        <button class="btn" onclick="showError('Retention sequence initiated for ${emp.employee_name}. Operational logs updated.')" style="padding: 4px 12px; font-size: 0.8rem; background: ${accentColor}; color: white; border: none; cursor: pointer;">
                            ${actionText}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderRiskDistribution(data) {
        const driversCtx = document.getElementById('driversChart');
        if (!driversCtx) return;

        const lowCount = data.filter(e => e.level === 'LOW').length;
        const highCount = data.filter(e => e.level === 'HIGH').length;
        const medCount = data.filter(e => e.level === 'MEDIUM').length;

        new Chart(driversCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Risk Alert (High)', 'Monitor (Med)'],
                datasets: [{
                    data: [lowCount, highCount, medCount],
                    backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#a1a1aa', usePointStyle: true } }
                }
            }
        });
    }

    initAttritionIntelligence();
});
