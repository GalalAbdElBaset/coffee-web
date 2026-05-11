/**
 * Admin Gallery Module - CRUD operations for gallery images
 * @version 1.0.0
 */

const AdminGallery = (function() {
    'use strict';

    let galleryImages = [];
    let editingId = null;

    /**
     * Initialize gallery management
     */
    async function init() {
        await loadGallery();
        initEventListeners();
    }

    /**
     * Load gallery images from Supabase
     */
    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading gallery...</div>';

        const result = await window.supabaseService.getAll('gallery_images', {
            orderBy: { column: 'order', ascending: true }
        });

        if (result.success) {
            galleryImages = result.data;
            renderGallery();
        } else {
            grid.innerHTML = '<div class="error">Failed to load gallery. Please try again.</div>';
        }
    }

    /**
     * Render gallery grid
     */
    function renderGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (galleryImages.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-images fa-3x"></i>
                    <p>No gallery images yet. Click "Add Image" to get started.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = galleryImages.map(img => `
            <div class="admin-card" data-id="${img.id}">
                <img src="${img.image_url}" alt="${img.alt_text}" style="height: 150px; object-fit: cover;">
                <p><strong>Alt Text:</strong> ${escapeHtml(img.alt_text || 'No alt text')}</p>
                <p><strong>Order:</strong> ${img.order}</p>
                <p><strong>Status:</strong> ${img.is_active ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions">
                    <button class="btn-edit" data-id="${img.id}">Edit</button>
                    <button class="btn-delete" data-id="${img.id}">Delete</button>
                    <button class="btn-toggle" data-id="${img.id}" style="background:#17a2b8; padding:0.4rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        ${img.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('#gallery-grid .btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editImage(btn.dataset.id));
        });

        document.querySelectorAll('#gallery-grid .btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteImage(btn.dataset.id));
        });

        document.querySelectorAll('#gallery-grid .btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => toggleImageStatus(btn.dataset.id));
        });
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        const addBtn = document.getElementById('add-gallery-btn');
        const cancelBtn = document.getElementById('cancel-gallery');
        const galleryForm = document.getElementById('gallery-form');

        if (addBtn) addBtn.addEventListener('click', () => showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => hideForms());
        if (galleryForm) galleryForm.addEventListener('submit', handleGallerySubmit);
    }

    /**
     * Show add image form
     */
    function showAddForm() {
        editingId = null;
        const form = document.getElementById('add-gallery-form');
        const galleryForm = document.getElementById('gallery-form');
        
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (galleryForm) {
            galleryForm.reset();
            document.getElementById('gallery-order').value = galleryImages.length + 1;
        }
        
        const submitBtn = document.querySelector('#gallery-form .btn-submit');
        if (submitBtn) submitBtn.textContent = 'Save Image';
    }

    /**
     * Hide forms
     */
    function hideForms() {
        const addForm = document.getElementById('add-gallery-form');
        if (addForm) addForm.style.display = 'none';
    }

    /**
     * Edit image
     */
    async function editImage(id) {
        const image = galleryImages.find(i => i.id === id);
        if (!image) return;

        editingId = id;
        
        document.getElementById('gallery-url').value = image.image_url || '';
        document.getElementById('gallery-alt').value = image.alt_text || '';
        document.getElementById('gallery-order').value = image.order || 1;
        
        const form = document.getElementById('add-gallery-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        const submitBtn = document.querySelector('#gallery-form .btn-submit');
        if (submitBtn) submitBtn.textContent = 'Update Image';
    }

    /**
     * Handle gallery form submit
     */
    async function handleGallerySubmit(e) {
        e.preventDefault();
        
        const galleryData = {
            image_url: document.getElementById('gallery-url').value.trim(),
            alt_text: document.getElementById('gallery-alt').value.trim(),
            order: parseInt(document.getElementById('gallery-order').value),
            updated_at: new Date().toISOString()
        };
        
        if (!galleryData.image_url) {
            UIModule.showPopup('Please enter an image URL', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#gallery-form .btn-submit');
        UIModule.showButtonLoading(submitBtn, 'Saving...');
        
        let result;
        if (editingId) {
            result = await window.supabaseService.update('gallery_images', editingId, galleryData);
        } else {
            galleryData.created_at = new Date().toISOString();
            galleryData.is_active = true;
            result = await window.supabaseService.insert('gallery_images', galleryData);
        }
        
        UIModule.hideButtonLoading(submitBtn);
        
        if (result.success) {
            UIModule.showPopup(editingId ? 'Image updated successfully!' : 'Image added successfully!', 'success');
            hideForms();
            await loadGallery();
        } else {
            UIModule.showPopup('Failed to save image. Please try again.', 'error');
        }
    }

    /**
     * Delete image
     */
    async function deleteImage(id) {
        if (!confirm('Are you sure you want to delete this image?')) return;
        
        const result = await window.supabaseService.delete('gallery_images', id);
        
        if (result.success) {
            UIModule.showPopup('Image deleted successfully!', 'success');
            await loadGallery();
        } else {
            UIModule.showPopup('Failed to delete image.', 'error');
        }
    }

    /**
     * Toggle image status
     */
    async function toggleImageStatus(id) {
        const image = galleryImages.find(i => i.id === id);
        if (!image) return;
        
        const result = await window.supabaseService.update('gallery_images', id, {
            is_active: !image.is_active,
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            UIModule.showPopup(`Image ${!image.is_active ? 'activated' : 'deactivated'}!`, 'success');
            await loadGallery();
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
        loadGallery
    };
})();

window.AdminGallery = AdminGallery;