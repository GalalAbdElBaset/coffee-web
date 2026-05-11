/**
 * Admin Products Module - CRUD operations for products
 * @version 1.0.0
 */

const AdminProducts = (function() {
    'use strict';

    let products = [];
    let editingId = null;

    /**
     * Initialize products management
     */
    async function init() {
        await loadProducts();
        initEventListeners();
    }

    /**
     * Load products from Supabase
     */
    async function loadProducts() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading">Loading products...</div>';

        const result = await window.supabaseService.getAll('products', {
            orderBy: { column: 'created_at', ascending: false }
        });

        if (result.success) {
            products = result.data;
            renderProducts();
        } else {
            grid.innerHTML = '<div class="error">Failed to load products. Please try again.</div>';
        }
    }

    /**
     * Render products grid
     */
    function renderProducts() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-mug-hot fa-3x"></i>
                    <p>No products yet. Click "Add Product" to get started.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="admin-card" data-id="${product.id}">
                <img src="${product.image_url || 'img/placeholder.png'}" alt="${product.name}">
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description?.substring(0, 100) || '')}...</p>
                <p><strong>Price:</strong> ${product.price} EGP</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <div class="card-actions">
                    <button class="btn-edit" data-id="${product.id}">Edit</button>
                    <button class="btn-delete" data-id="${product.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        const addBtn = document.getElementById('add-product-btn');
        const cancelBtn = document.getElementById('cancel-product');
        const productForm = document.getElementById('product-form');

        if (addBtn) {
            addBtn.addEventListener('click', () => showAddForm());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => hideForms());
        }

        if (productForm) {
            productForm.addEventListener('submit', handleProductSubmit);
        }
    }

    /**
     * Show add product form
     */
    function showAddForm() {
        editingId = null;
        const form = document.getElementById('add-product-form');
        const productForm = document.getElementById('product-form');
        
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (productForm) {
            productForm.reset();
        }
        
        // Change submit button text
        const submitBtn = document.querySelector('#product-form .btn-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Save Product';
        }
    }

    /**
     * Hide forms
     */
    function hideForms() {
        const addForm = document.getElementById('add-product-form');
        if (addForm) addForm.style.display = 'none';
    }

    /**
     * Edit product
     */
    async function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;

        editingId = id;
        
        // Fill form
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-category').value = product.category || 'espresso';
        document.getElementById('product-image').value = product.image_url || '';
        document.getElementById('product-description').value = product.description || '';
        
        // Show form
        const form = document.getElementById('add-product-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Change submit button text
        const submitBtn = document.querySelector('#product-form .btn-submit');
        if (submitBtn) {
            submitBtn.textContent = 'Update Product';
        }
    }

    /**
     * Handle product form submit
     */
    async function handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('product-name').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            image_url: document.getElementById('product-image').value.trim() || 'img/placeholder.png',
            description: document.getElementById('product-description').value.trim(),
            updated_at: new Date().toISOString()
        };
        
        // Validate
        if (!productData.name || !productData.price) {
            UIModule.showPopup('Please fill in required fields', 'warning');
            return;
        }
        
        const submitBtn = document.querySelector('#product-form .btn-submit');
        UIModule.showButtonLoading(submitBtn, 'Saving...');
        
        let result;
        if (editingId) {
            // Update existing product
            result = await window.supabaseService.update('products', editingId, productData);
        } else {
            // Create new product
            productData.created_at = new Date().toISOString();
            result = await window.supabaseService.insert('products', productData);
        }
        
        UIModule.hideButtonLoading(submitBtn);
        
        if (result.success) {
            UIModule.showPopup(editingId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
            hideForms();
            await loadProducts();
        } else {
            UIModule.showPopup('Failed to save product. Please try again.', 'error');
        }
    }

    /**
     * Delete product
     */
    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }
        
        const result = await window.supabaseService.delete('products', id);
        
        if (result.success) {
            UIModule.showPopup('Product deleted successfully!', 'success');
            await loadProducts();
        } else {
            UIModule.showPopup('Failed to delete product. Please try again.', 'error');
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return {
        init,
        loadProducts
    };
})();

window.AdminProducts = AdminProducts;