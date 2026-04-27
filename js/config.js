const API_BASE = 'http://127.0.0.1:5000/api';

/**
 * Tactical Value Animator
 */
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = progress * (end - start) + start;
        
        if (id === 'count-perf') {
            obj.innerHTML = val.toFixed(1) + '%';
        } else {
            obj.innerHTML = Math.floor(val);
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Tactical Error Shower
 */
function showError(message) {
    const existing = document.getElementById('tactical-error');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'tactical-error';
    banner.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; background: #ff4444; color: white;
        padding: 12px 24px; z-index: 100001; display: flex; justify-content: space-between;
        align-items: center; font-family: 'Outfit', sans-serif; font-weight: 600;
        box-shadow: 0 4px 20px rgba(255, 68, 68, 0.4); animation: slideDown 0.4s forwards;
    `;
    banner.innerHTML = `<span><i class="fas fa-exclamation-triangle"></i> ERROR: ${message}</span><i class="fas fa-times" style="cursor:pointer;" onclick="this.parentElement.remove()"></i>`;
    document.body.appendChild(banner);
    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 5000);
}

/**
 * Tactical Confirmation Modal
 */
function tacticalConfirm(message, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(4px);`;
    
    const modal = document.createElement('div');
    modal.style.cssText = `background: #121214; border: 1px solid var(--primary); padding: 30px; border-radius: 12px; width: 400px; text-align: center; border-left: 5px solid var(--primary);`;
    modal.innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 15px; font-family: 'Playfair Display';">CONFIRM DEPLOYMENT</h3>
        <p style="color: #a1a1aa; margin-bottom: 25px;">${message}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="cancelConfirm" style="padding: 10px 20px; background: transparent; border: 1px solid #27272a; color: #a1a1aa; border-radius: 6px; cursor: pointer;">ABORT</button>
            <button id="okConfirm" style="padding: 10px 20px; background: var(--primary); border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">INITIATE</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('cancelConfirm').onclick = () => overlay.remove();
    document.getElementById('okConfirm').onclick = () => { overlay.remove(); callback(); };
}

/**
 * Tactical Prompt Modal
 */
function tacticalPrompt(title, fields, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(4px);`;
    
    const modal = document.createElement('div');
    modal.style.cssText = `background: #121214; border: 1px solid var(--primary); padding: 30px; border-radius: 12px; width: 400px; border-left: 5px solid var(--primary);`;
    
    let fieldsHtml = fields.map(f => {
        if (f.type === 'select') {
            const options = f.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
            return `
                <div style="margin-bottom: 15px; text-align: left;">
                    <label style="color: #a1a1aa; font-size: 0.8rem; display: block; margin-bottom: 5px;">${f.label}</label>
                    <select id="prompt_${f.key}" style="width: 100%; padding: 10px; background: #18181b; border: 1px solid #27272a; border-radius: 6px; color: white; font-family: 'Outfit';">
                        ${options}
                    </select>
                </div>
            `;
        }
        return `
            <div style="margin-bottom: 15px; text-align: left;">
                <label style="color: #a1a1aa; font-size: 0.8rem; display: block; margin-bottom: 5px;">${f.label}</label>
                <input id="prompt_${f.key}" type="${f.type || 'text'}" placeholder="${f.placeholder || ''}" style="width: 100%; padding: 10px; background: #18181b; border: 1px solid #27272a; border-radius: 6px; color: white; font-family: 'Outfit';">
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 20px; font-family: 'Playfair Display'; text-align: center;">${title}</h3>
        ${fieldsHtml}
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button id="cancelPrompt" style="padding: 10px 20px; background: transparent; border: 1px solid #27272a; color: #a1a1aa; border-radius: 6px; cursor: pointer;">CANCEL</button>
            <button id="okPrompt" style="padding: 10px 20px; background: var(--primary); border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: 600;">SAVE</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('cancelPrompt').onclick = () => overlay.remove();
    document.getElementById('okPrompt').onclick = () => {
        const results = {};
        fields.forEach(f => results[f.key] = document.getElementById(`prompt_${f.key}`).value);
        overlay.remove();
        callback(results);
    };
}

// Add animation keyframes
if (!document.getElementById('tactical-styles')) {
    const style = document.createElement('style');
    style.id = 'tactical-styles';
    style.textContent = `
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        :root { --primary: #ff6b00; }
    `;
    document.head.appendChild(style);
}
