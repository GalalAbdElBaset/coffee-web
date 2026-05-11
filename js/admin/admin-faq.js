/**
 * Admin FAQ Module - CRUD operations for FAQ
 * @version 1.0.0
 */

const AdminFaq = (function() {
    'use strict';

    let faqItems = [];
    let editingId = null;

    /**
     * Initialize FAQ management
     */
    async function init() {
        await loadFaq();
        initEventListeners();
    }

    /**
     * Load FAQ from Supabase
     */
    async function loadFaq() {
        const grid = document.getElementById('faq-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading FAQ...</div>';

        const result = await window.supabaseService.getAll('faq_items', {
            orderBy: { column: 'order', ascending: true }
        });

        if (result.success) {
            faqItems = result.data;
            renderFaq();
        } else {
            grid.innerHTML = '<div class="error">Failed to load FAQ. Please try again.</div>';
        }
    }

    /**
     * Render FAQ grid
     */
    function renderFaq() {
        const grid = document.getElementById('faq-grid');
        if (!grid) return;

        if (faqItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-question-circle fa-3x"></i>
                    <p>No FAQ items yet. Click "Add FAQ" to get started.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = faqItems.map(item => `
            <div class="admin-card" data-id="${item.id}">
                <h3>❓ ${escapeHtml(item.question)}</h3>
                <p>${escapeHtml(item.answer?.substring(0, 120) || '')}...</p>
                <p><strong>Order:</strong> ${item.order}</p>
                <p><strong>Status:</strong> ${item.is_active ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions">
                    <button class="btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn-delete" data-id="${item.id}">Delete</button>
                    <button class="btn-toggle" data-id="${item.id}" style="background:#17a2b8; padding:0.4rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        ${item.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('#faq-grid .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editFaq(btn.dataset.id));
        });

        document.querySelectorAll('#faq-grid .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteFaq(btn.dataset.id));
        });

        document.querySelectorAll('#faq-grid .btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => toggleFaqStatus(btn.dataset.id));
        });
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        const addBtn = document.getElementById('add-faq-btn');
        const cancelBtn = document.getElementById('cancel-faq');
        const faqForm = document.getElementById('faq-form');

        if (addBtn) {
            addBtn.addEventListener('click', () => showAddForm());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => hideForms());
        }

        if (faqForm) {
            faqForm.addEventListener('submit', handleFaqSubmit);
        }
    }

    /**
     * Show add FAQ form
     */
    function showAddForm() {
        editingId = null;
        const form = document.getElementById('add-faq-form');
        const faqForm = document.getElementById('faq-form');
        
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (faqForm) {
            faqForm.reset();
            document.getElementById('faq-order').value = faqItems.length + 1;
        }
        
        const submitBtn = document.querySelector('#faq-form .btn-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Save FAQ';
        }
    }

    /**
     * Hide forms
     */
    function hideForms() {
        const addForm = document.getElementById('add-faq-form');
        if (addForm) addForm.style.display = 'none';
    }

    /**
     * Edit FAQ
     */
    async function editFaq(id) {
        const item = faqItems.find(i => i.id === id);
        if (!item) return;

        editingId = id;
        
        document.getElementById('faq-question').value = item.question || '';
        document.getElementById('faq-answer').value = item.answer || '';
        document.getElementById('faq-order').value = item.order || 1;
        
        const form = document.getElementById('add-faq-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        const submitBtn = document.querySelector('#faq-form .btn-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Update FAQ';
        }
    }

    /**
     * Handle FAQ form submit
     */
    async function handleFaqSubmit(e) {
        e.preventDefault();
        
        const faqData = {
            question: document.getElementById('faq-question').value.trim(),
            answer: document.getElementById('faq-answer').value.trim(),
            order: parseInt(document.getElementById('faq-order').value),
            updated_at: new Date().toISOString()
        };
        
        if (!faqData.question || !faqData.answer) {
            UIModule.showPopup('Please fill in all fields', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#faq-form .btn-submit');
        UIModule.showButtonLoading(submitBtn, 'Saving...');
        
        let result;
        if (editingId) {
            result = await window.supabaseService.update('faq_items', editingId, faqData);
        } else {
            faqData.created_at = new Date().toISOString();
            faqData.is_active = true;
            result = await window.supabaseService.insert('faq_items', faqData);
        }
        
        UIModule.hideButtonLoading(submitBtn);
        
        if (result.success) {
            UIModule.showPopup(editingId ? 'FAQ updated successfully!' : 'FAQ added successfully!', 'success');
            hideForms();
            await loadFaq();
        } else {
            UIModule.showPopup('Failed to save FAQ. Please try again.', 'error');
        }
    }

    /**
     * Delete FAQ
     */
    async function deleteFaq(id) {
        if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
            return;
        }
        
        const result = await window.supabaseService.delete('faq_items', id);
        
        if (result.success) {
            UIModule.showPopup('FAQ deleted successfully!', 'success');
            await loadFaq();
        } else {
            UIModule.showPopup('Failed to delete FAQ. Please try again.', 'error');
        }
    }

    /**
     * Toggle FAQ status (activate/deactivate)
     */
    async function toggleFaqStatus(id) {
        const item = faqItems.find(i => i.id === id);
        if (!item) return;
        
        const result = await window.supabaseService.update('faq_items', id, {
            is_active: !item.is_active,
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            UIModule.showPopup(`FAQ ${!item.is_active ? 'activated' : 'deactivated'}!`, 'success');
            await loadFaq();
        } else {
            UIModule.showPopup('Failed to update status. Please try again.', 'error');
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        init,
        loadFaq
    };
})();

window.AdminFaq = AdminFaq;