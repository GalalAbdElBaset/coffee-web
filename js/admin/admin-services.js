/**
 * Admin Services Module - CRUD operations for service cards
 * @version 1.0.0
 */

const AdminServices = (function() {
    'use strict';

    let services = [];
    let editingId = null;

    /**
     * Initialize services management
     */
    async function init() {
        await loadServices();
        initEventListeners();
    }

    /**
     * Load services from Supabase
     */
    async function loadServices() {
        const grid = document.getElementById('services-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading services...</div>';

        const result = await window.supabaseService.getAll('service_cards', {
            orderBy: { column: 'order', ascending: true }
        });

        if (result.success) {
            services = result.data;
            renderServices();
        } else {
            grid.innerHTML = '<div class="error">Failed to load services. Please try again.</div>';
        }
    }

    /**
     * Render services grid
     */
    function renderServices() {
        const grid = document.getElementById('services-grid');
        if (!grid) return;

        if (services.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-concierge-bell fa-3x"></i>
                    <p>No services yet. Click "Add Service" to get started.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = services.map(service => `
            <div class="admin-card" data-id="${service.id}">
                <img src="${service.image_url || 'img/placeholder.png'}" alt="${service.title}" style="height: 150px; object-fit: cover;">
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.description?.substring(0, 100) || '')}...</p>
                <p><strong>Rating:</strong> ${'★'.repeat(Math.floor(service.rating || 0))}${(service.rating % 1) >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(service.rating || 0))}</p>
                <p><strong>Order:</strong> ${service.order}</p>
                <p><strong>Status:</strong> ${service.is_active ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions">
                    <button class="btn-edit" data-id="${service.id}">Edit</button>
                    <button class="btn-delete" data-id="${service.id}">Delete</button>
                    <button class="btn-toggle" data-id="${service.id}" style="background:#17a2b8; padding:0.4rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        ${service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('#services-grid .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editService(btn.dataset.id));
        });

        document.querySelectorAll('#services-grid .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteService(btn.dataset.id));
        });

        document.querySelectorAll('#services-grid .btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => toggleServiceStatus(btn.dataset.id));
        });
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        const addBtn = document.getElementById('add-service-btn');
        const cancelBtn = document.getElementById('cancel-service');
        const serviceForm = document.getElementById('service-form');

        if (addBtn) addBtn.addEventListener('click', () => showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideForms());
        if (serviceForm) serviceForm.addEventListener('submit', handleServiceSubmit);
    }

    /**
     * Show add service form
     */
    function showAddForm() {
        editingId = null;
        const form = document.getElementById('add-service-form');
        const serviceForm = document.getElementById('service-form');
        
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (serviceForm) {
            serviceForm.reset();
            document.getElementById('service-order').value = services.length + 1;
            document.getElementById('service-rating').value = 5;
        }
        
        const submitBtn = document.querySelector('#service-form .btn-submit');
        if (submitBtn) submitBtn.textContent = 'Save Service';
    }

    /**
     * Hide forms
     */
    function hideForms() {
        const addForm = document.getElementById('add-service-form');
        if (addForm) addForm.style.display = 'none';
    }

    /**
     * Edit service
     */
    async function editService(id) {
        const service = services.find(s => s.id === id);
        if (!service) return;

        editingId = id;
        
        document.getElementById('service-title').value = service.title || '';
        document.getElementById('service-description').value = service.description || '';
        document.getElementById('service-image').value = service.image_url || '';
        document.getElementById('service-rating').value = service.rating || 5;
        document.getElementById('service-order').value = service.order || 1;
        
        const form = document.getElementById('add-service-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        const submitBtn = document.querySelector('#service-form .btn-submit');
        if (submitBtn) submitBtn.textContent = 'Update Service';
    }

    /**
     * Handle service form submit
     */
    async function handleServiceSubmit(e) {
        e.preventDefault();
        
        const serviceData = {
            title: document.getElementById('service-title').value.trim(),
            description: document.getElementById('service-description').value.trim(),
            image_url: document.getElementById('service-image').value.trim() || 'img/placeholder.png',
            rating: parseFloat(document.getElementById('service-rating').value),
            order: parseInt(document.getElementById('service-order').value),
            updated_at: new Date().toISOString()
        };
        
        if (!serviceData.title || !serviceData.description) {
            UIModule.showPopup('Please fill in required fields', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#service-form .btn-submit');
        UIModule.showButtonLoading(submitBtn, 'Saving...');
        
        let result;
        if (editingId) {
            result = await window.supabaseService.update('service_cards', editingId, serviceData);
        } else {
            serviceData.created_at = new Date().toISOString();
            serviceData.is_active = true;
            result = await window.supabaseService.insert('service_cards', serviceData);
        }
        
        UIModule.hideButtonLoading(submitBtn);
        
        if (result.success) {
            UIModule.showPopup(editingId ? 'Service updated successfully!' : 'Service added successfully!', 'success');
            hideForms();
            await loadServices();
        } else {
            UIModule.showPopup('Failed to save service. Please try again.', 'error');
        }
    }

    /**
     * Delete service
     */
    async function deleteService(id) {
        if (!confirm('Are you sure you want to delete this service?')) return;
        
        const result = await window.supabaseService.delete('service_cards', id);
        
        if (result.success) {
            UIModule.showPopup('Service deleted successfully!', 'success');
            await loadServices();
        } else {
            UIModule.showPopup('Failed to delete service.', 'error');
        }
    }

    /**
     * Toggle service status
     */
    async function toggleServiceStatus(id) {
        const service = services.find(s => s.id === id);
        if (!service) return;
        
        const result = await window.supabaseService.update('service_cards', id, {
            is_active: !service.is_active,
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            UIModule.showPopup(`Service ${!service.is_active ? 'activated' : 'deactivated'}!`, 'success');
            await loadServices();
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
        loadServices
    };
})();

window.AdminServices = AdminServices;