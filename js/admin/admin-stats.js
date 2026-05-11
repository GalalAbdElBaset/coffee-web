/**
 * Admin Statistics Module - Update statistics
 * @version 1.0.0
 */

const AdminStats = (function() {
    'use strict';

    let stats = [];

    /**
     * Initialize statistics management
     */
    async function init() {
        await loadStats();
    }

    /**
     * Load statistics from Supabase
     */
    async function loadStats() {
        const grid = document.getElementById('stats-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading statistics...</div>';

        const result = await window.supabaseService.getAll('statistics');

        if (result.success && result.data.length > 0) {
            stats = result.data;
            renderStats();
        } else {
            // Create default stats if none exist
            await createDefaultStats();
        }
    }

    /**
     * Create default statistics
     */
    async function createDefaultStats() {
        const defaultStats = [
            { label: 'Cups of Coffee Served', target_number: 15000, icon: 'fa-solid fa-mug-hot', is_active: true, order: 1 },
            { label: 'Expert Baristas', target_number: 25, icon: 'fa-solid fa-user-chef', is_active: true, order: 2 },
            { label: 'Branches', target_number: 5, icon: 'fa-solid fa-location-dot', is_active: true, order: 3 },
            { label: '5-Star Reviews', target_number: 4890, icon: 'fa-solid fa-star', is_active: true, order: 4 }
        ];

        for (const stat of defaultStats) {
            stat.created_at = new Date().toISOString();
            await window.supabaseService.insert('statistics', stat);
        }

        await loadStats();
    }

    /**
     * Render statistics cards
     */
    function renderStats() {
        const grid = document.getElementById('stats-grid');
        if (!grid) return;

        grid.innerHTML = stats.map(stat => `
            <div class="admin-card" data-id="${stat.id}">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <i class="${stat.icon}" style="font-size: 2rem; color: #e94560;"></i>
                    <h3 style="margin: 0;">${escapeHtml(stat.label)}</h3>
                </div>
                <div class="form-group">
                    <label>Target Number</label>
                    <input type="number" class="stat-target" data-id="${stat.id}" value="${stat.target_number}" style="width: 100%; padding: 0.5rem; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">
                </div>
                <div class="form-group">
                    <label>Icon Class</label>
                    <input type="text" class="stat-icon-input" data-id="${stat.id}" value="${stat.icon}" style="width: 100%; padding: 0.5rem; border-radius: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">
                </div>
                <div class="card-actions">
                    <button class="btn-update" data-id="${stat.id}" style="background: #28a745; padding:0.4rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">Update</button>
                    <button class="btn-toggle" data-id="${stat.id}" style="background:${stat.is_active ? '#dc3545' : '#28a745'}; padding:0.4rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        ${stat.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-update').forEach(btn => {
            btn.addEventListener('click', () => updateStat(btn.dataset.id));
        });

        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => toggleStatStatus(btn.dataset.id));
        });
    }

    /**
     * Update statistic
     */
    async function updateStat(id) {
        const targetInput = document.querySelector(`.stat-target[data-id="${id}"]`);
        const iconInput = document.querySelector(`.stat-icon-input[data-id="${id}"]`);
        
        const updates = {
            target_number: parseInt(targetInput?.value) || 0,
            icon: iconInput?.value || 'fa-solid fa-chart-line',
            updated_at: new Date().toISOString()
        };
        
        const result = await window.supabaseService.update('statistics', id, updates);
        
        if (result.success) {
            UIModule.showPopup('Statistics updated successfully!', 'success');
            await loadStats();
        } else {
            UIModule.showPopup('Failed to update statistics.', 'error');
        }
    }

    /**
     * Toggle statistic status
     */
    async function toggleStatStatus(id) {
        const stat = stats.find(s => s.id === id);
        if (!stat) return;
        
        const result = await window.supabaseService.update('statistics', id, {
            is_active: !stat.is_active,
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            UIModule.showPopup(`Statistics ${!stat.is_active ? 'activated' : 'deactivated'}!`, 'success');
            await loadStats();
        } else {
            UIModule.showPopup('Failed to update status.', 'error');
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        init,
        loadStats
    };
})();

window.AdminStats = AdminStats;