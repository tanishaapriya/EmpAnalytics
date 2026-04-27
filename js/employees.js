document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('employeeTableBody');
    const searchInput = document.getElementById('employeeSearch');
    const addBtn = document.querySelector('.btn-primary');
    
    let allEmployees = [];

    // 1. Fetch and Render
    async function fetchEmployees() {
        try {
            const response = await fetch(`${API_BASE}/employees`);
            if (!response.ok) throw new Error('Failed to fetch workforce data');
            allEmployees = await response.json();
            renderEmployees(applySearch(allEmployees));
        } catch (err) {
            showError(err.message);
        }
    }

    function renderEmployees(data) {
        if (!tableBody) return;
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No operatives found matching criteria.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(emp => `
            <tr style="border-bottom: 1px solid var(--border); transition: var(--transition); cursor: default;" 
                onmouseover="this.style.background='rgba(255, 107, 0, 0.05)'" 
                onmouseout="this.style.background='transparent'">
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar" style="width: 35px; height: 35px; font-size: 0.8rem; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 700;">
                            ${(emp.employee_name || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <p style="font-weight: 600; font-size: 0.95rem; color: #ffffff;">${emp.employee_name || 'Unknown'}</p>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">ID: #EMP${(emp.employee_id || 0).toString().padStart(3, '0')}</p>
                        </div>
                    </div>
                </td>
                <td style="padding: 1rem; font-size: 0.9rem; color: #ffffff;">${emp.dept}</td>
                <td style="padding: 1rem;">
                    <span style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                        ACTIVE
                    </span>
                </td>
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="flex: 1; height: 6px; background: var(--border); border-radius: 3px; max-width: 60px; overflow: hidden;">
                            <div style="width: ${(emp.salary / 120000) * 100}%; height: 100%; background: var(--primary); border-radius: 3px;"></div>
                        </div>
                        <span style="font-weight: 600; font-size: 0.9rem; color: #ffffff;">₹${(emp.salary/100000).toFixed(1)}L</span>
                    </div>
                </td>
                <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">Operational • Just now</td>
                <td style="padding: 1rem; text-align: right;">
                    <button class="btn delete-btn" data-id="${emp.employee_id}" style="padding: 8px; background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.2); border-radius: 6px; cursor: pointer; transition: 0.3s;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach Delete Listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteEmployee(id);
            };
        });
    }

    // 2. Search Logic
    function applySearch(data) {
        if (!searchInput) return data;
        const query = searchInput.value.toLowerCase();
        return data.filter(emp => 
            emp.employee_name.toLowerCase().includes(query) || 
            emp.dept.toLowerCase().includes(query)
        );
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => renderEmployees(applySearch(allEmployees)));
    }

    // 3. Delete Logic
    async function deleteEmployee(id) {
        tacticalConfirm('Are you sure you want to decommission this operative? This action is irreversible.', async () => {
            try {
                const response = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Authorization required for deletion');
                
                showSuccess('Operative successfully decommissioned.');
                fetchEmployees();
            } catch (err) {
                showError(err.message);
            }
        });
    }

    // 4. Add Logic (Tactical Modal)
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            try {
                // Fetch valid departments to prevent invalid assignment errors
                const deptRes = await fetch(`${API_BASE}/departments`);
                if (!deptRes.ok) throw new Error("Could not retrieve department rosters.");
                const departments = await deptRes.json();

                const deptOptions = departments.map(d => ({
                    label: d.department_name,
                    value: d.department_name
                }));

                tacticalPrompt('REGISTER NEW OPERATIVE', [
                    { key: 'name', label: 'FULL NAME', placeholder: 'e.g., John Doe' },
                    { 
                        key: 'dept', 
                        label: 'DEPARTMENT', 
                        type: 'select', 
                        options: deptOptions 
                    },
                    { key: 'salary', label: 'ANNUAL PAYLOAD (INR)', type: 'number', placeholder: '800000' }
                ], async (results) => {
                    if (!results.name || !results.dept) return showError('All fields required for registration');

                    try {
                        const response = await fetch(`${API_BASE}/employees`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                employee_name: results.name,
                                dept: results.dept,
                                salary: parseInt(results.salary || 0)
                            })
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || 'Failed to register new operative');
                        }
                        
                        showSuccess('New operative registered in database.');
                        fetchEmployees();
                    } catch (err) {
                        showError(err.message);
                    }
                });
            } catch (err) {
                showError(err.message);
            }
        });
    }

    // Success Toast (Small internal helper)
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

    // Initial Load
    fetchEmployees();
});
