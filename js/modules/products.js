/**
 * Products Module - Fetch and display products
 * @version 3.3.0 - Fixed button event binding
 */

const ProductsModule = (function() {
    'use strict';

    let allProducts = [];
    let currentFilter = 'all';
    let currentPage = 1;
    let pageSize = 3;
    let menuGrid = null;
    let productViewOverlay = null;

    async function init() {
        menuGrid = document.getElementById('menu-grid');
        productViewOverlay = document.querySelector('.product-view-overlay');
        
        console.log('🛒 ProductsModule initializing...');
        
        if (menuGrid) {
            await loadProducts();
            initFilters();
            initProductViewModal();
            initNewsletterForm();
            loadSpecialSections();
        }
        
        if (document.querySelector('.menu-container')) {
            await loadFeaturedProducts();
        }
        
        // ✅ تأكيد ربط الأزرار بعد تحميل الصفحة بالكامل
        setTimeout(() => {
            bindAllAddToCartButtons();
        }, 500);
    }

    /**
     * ربط جميع أزرار الإضافة إلى السلة في الصفحة
     */
    function bindAllAddToCartButtons() {
        console.log('🔗 Binding all add to cart buttons...');
        
        // الأزرار في شبكة المنتجات الرئيسية
        const addButtons = document.querySelectorAll('.add-to-cart, .add-to-cart-modal, .add-to-cart-featured, .special-order-btn');
        
        console.log(`Found ${addButtons.length} add to cart buttons`);
        
        addButtons.forEach(btn => {
            // إزالة المستمع القديم
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const productId = newBtn.getAttribute('data-id');
                console.log('🛒 Add to cart clicked, productId:', productId);
                
                if (productId && window.CartModule) {
                    await window.CartModule.addToCart(productId, 1);
                } else if (!window.CartModule) {
                    console.error('❌ CartModule not available!');
                } else if (!productId) {
                    console.error('❌ productId not found on button:', newBtn);
                }
            });
        });
    }

    async function loadProducts() {
        if (window.UIModule) window.UIModule.showGlobalLoader();
        
        try {
            const result = await window.supabaseService.getAll('products', {
                orderBy: { column: 'created_at', ascending: true }
            });
            
            if (result.success && result.data && result.data.length > 0) {
                allProducts = result.data;
                renderProducts(allProducts);
                console.log('✅ Products loaded from Supabase:', allProducts.length);
            } else {
                console.log('No products in Supabase, using local data');
                await loadLocalProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            await loadLocalProducts();
        } finally {
            if (window.UIModule) window.UIModule.hideGlobalLoader();
        }
    }

    async function loadLocalProducts() {
        allProducts = [
            { id: '1', name: 'Caffè Latte', price: 4.25, image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=300', description: 'Smooth espresso blended with steamed milk.', category: 'espresso', nutritional_info: { calories: 190 }, ingredients: ['Espresso', 'Milk'], allergens: ['Dairy'] },
            { id: '2', name: 'Flat White', price: 4.75, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', description: 'Rich espresso with velvety steamed milk.', category: 'espresso', nutritional_info: { calories: 170 }, ingredients: ['Espresso', 'Milk'], allergens: ['Dairy'] },
            { id: '3', name: 'Caffè Mocha', price: 5.25, image_url: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=300', description: 'Espresso with chocolate and steamed milk.', category: 'espresso', nutritional_info: { calories: 290 }, ingredients: ['Espresso', 'Chocolate', 'Milk'], allergens: ['Dairy'] },
            { id: '4', name: 'Blonde Roast', price: 3.75, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300', description: 'Mellow and smooth light roast.', category: 'blonde', nutritional_info: { calories: 5 }, ingredients: ['Coffee'], allergens: [] },
            { id: '5', name: 'Dark Roast', price: 3.75, image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300', description: 'Bold and rich dark roast.', category: 'dark', nutritional_info: { calories: 5 }, ingredients: ['Coffee'], allergens: [] },
            { id: '6', name: 'Decaf Pike Place', price: 3.75, image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300', description: 'Smooth decaf coffee.', category: 'decaf', nutritional_info: { calories: 5 }, ingredients: ['Decaf Coffee'], allergens: [] },
            { id: '7', name: 'Caramel Macchiato', price: 5.50, image_url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=300', description: 'Vanilla syrup with espresso and caramel drizzle.', category: 'espresso', nutritional_info: { calories: 250 }, ingredients: ['Espresso', 'Milk', 'Caramel'], allergens: ['Dairy'] },
            { id: '8', name: 'Vanilla Latte', price: 5.25, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300', description: 'Espresso with vanilla and steamed milk.', category: 'espresso', nutritional_info: { calories: 220 }, ingredients: ['Espresso', 'Milk', 'Vanilla'], allergens: ['Dairy'] }
        ];
        renderProducts(allProducts);
        console.log('✅ Local products loaded:', allProducts.length);
    }

    function renderProducts(products) {
        if (!menuGrid) {
            console.error('❌ menuGrid element not found!');
            return;
        }
        
        let filteredProducts = currentFilter === 'all' 
            ? products 
            : products.filter(product => product.category === currentFilter);
        
        if (filteredProducts.length === 0) {
            menuGrid.innerHTML = `<div class="no-products"><i class="fa-solid fa-mug-hot"></i><p>No products found in "${currentFilter}" category</p></div>`;
            const existingPagination = document.getElementById('pagination');
            if (existingPagination) existingPagination.remove();
            return;
        }
        
        const start = (currentPage - 1) * pageSize;
        const paginatedItems = filteredProducts.slice(start, start + pageSize);
        
        menuGrid.innerHTML = paginatedItems.map(product => `
            <div class="box" data-product-id="${product.id}">
                <div class="img-container">
                    <img data-src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy">
                    <div class="box__btns">
                        <button class="box__btn view-product" data-id="${product.id}">
                            <i class="fa-regular fa-eye"></i> View
                        </button>
                        <button class="box__btn add-to-cart" data-id="${product.id}">
                            <i class="fa-solid fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
                <h2>${escapeHtml(product.name)}</h2>
                <h3>${formatPrice(product.price)}</h3>
            </div>
        `).join('');
        
        if (window.UIModule && window.UIModule.initLazyLoading) {
            window.UIModule.initLazyLoading();
        }
        
        renderPagination(filteredProducts);
        
        // ✅ ربط الأزرار بعد كل ريندر
        bindAllAddToCartButtons();
        bindViewButtons();
    }
    
    function bindViewButtons() {
        document.querySelectorAll('.view-product').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const productId = newBtn.getAttribute('data-id');
                if (productId) {
                    await showProductDetails(productId);
                }
            });
        });
    }

    function formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) return '0.00 EGP';
        return `${price.toFixed(2)} EGP`;
    }

    function renderPagination(products) {
        const totalPages = Math.ceil(products.length / pageSize);
        
        if (totalPages <= 1) {
            const existingPagination = document.getElementById('pagination');
            if (existingPagination) existingPagination.remove();
            return;
        }
        
        let paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.className = 'pagination-container';
            if (menuGrid && menuGrid.parentNode) {
                menuGrid.insertAdjacentElement('afterend', paginationContainer);
            }
        }
        
        let paginationHTML = `
            <button class="pagination-btn prev-btn" data-action="prev" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left"></i> Prev
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `<button class="pagination-btn page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }
        
        paginationHTML += `
            <button class="pagination-btn next-btn" data-action="next" ${currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fa-solid fa-chevron-right"></i>
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
        
        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                
                if (btn.dataset.action === 'prev' && currentPage > 1) {
                    currentPage--;
                    renderProducts(allProducts);
                } else if (btn.dataset.action === 'next' && currentPage < totalPages) {
                    currentPage++;
                    renderProducts(allProducts);
                } else if (btn.dataset.page) {
                    currentPage = parseInt(btn.dataset.page);
                    renderProducts(allProducts);
                }
            });
        });
    }

    function initFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                renderProducts(allProducts);
            });
        });
    }

    function initProductViewModal() {
        if (productViewOverlay) {
            const closeBtn = productViewOverlay.querySelector('.product-view__closeBtn');
            if (closeBtn) {
                closeBtn.onclick = () => productViewOverlay.classList.remove('active');
            }
            
            productViewOverlay.onclick = (e) => {
                if (e.target === productViewOverlay) productViewOverlay.classList.remove('active');
            };
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && productViewOverlay.classList.contains('active')) {
                    productViewOverlay.classList.remove('active');
                }
            });
        }
    }

    async function showProductDetails(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const productViewContent = document.querySelector('.product-view-content');
        if (!productViewContent) return;
        
        productViewContent.innerHTML = `
            <h2>${escapeHtml(product.name)}</h2>
            <img data-src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
            <p class="description">${escapeHtml(product.description)}</p>
            <h3 style="color: var(--primary-color, #b6893f); text-align: center;">${formatPrice(product.price)}</h3>
            ${product.nutritional_info ? `<div class="nutritional_info"><div class="bar-large">Nutritional Information</div><div class="bar-medium"><span>🔥 Calories</span><span>${product.nutritional_info.calories || 0}</span></div></div>` : ''}
            ${product.ingredients ? `<div class="ingredients"><h2>🌱 Ingredients</h2><p>${escapeHtml(product.ingredients.join(', '))}</p></div>` : ''}
            ${product.allergens ? `<div class="allergens"><h2>⚠️ Allergens</h2><p>Contains: ${escapeHtml(product.allergens.join(', '))}</p></div>` : ''}
            <div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;">
                <button class="box__btn add-to-cart-modal" data-id="${product.id}">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        if (window.UIModule && window.UIModule.initLazyLoading) {
            window.UIModule.initLazyLoading();
        }
        
        // ربط زر الإضافة في المودال
        const addToCartBtn = productViewContent.querySelector('.add-to-cart-modal');
        if (addToCartBtn && window.CartModule) {
            addToCartBtn.onclick = async () => {
                await window.CartModule.addToCart(productId);
                productViewOverlay.classList.remove('active');
            };
        }
        
        if (productViewOverlay) productViewOverlay.classList.add('active');
    }

    function initNewsletterForm() {
        const newsletterForm = document.getElementById('menu-newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (email && window.UIModule) {
                    window.UIModule.showPopup('🎉 Thanks for subscribing! 15% off coupon sent to your email!', 'success');
                    newsletterForm.reset();
                }
            });
        }
    }

    function loadSpecialSections() {
        if (!allProducts.length) return;
        
        // Coffee section
        const coffeeProducts = allProducts.filter(p => 
            ['espresso', 'blonde', 'dark', 'decaf'].includes(p.category)
        ).slice(0, 3);
        
        const coffeeGrid = document.getElementById('special-coffee-grid');
        if (coffeeGrid && coffeeProducts.length) {
            coffeeGrid.innerHTML = coffeeProducts.map(product => `
                <div class="special-card">
                    <div class="special-card-img">
                        <img src="${product.image_url}" alt="${product.name}">
                        <div class="special-card-overlay">
                            <button class="special-order-btn" data-id="${product.id}">Order Now</button>
                        </div>
                    </div>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description?.substring(0, 80) || 'Delicious coffee')}...</p>
                    <div class="special-price">${formatPrice(product.price)}</div>
                </div>
            `).join('');
        }
        
        // Dessert section
        const dessertProducts = allProducts.slice(3, 6);
        const dessertGrid = document.getElementById('special-dessert-grid');
        if (dessertGrid && dessertProducts.length) {
            dessertGrid.innerHTML = dessertProducts.map(product => `
                <div class="special-card">
                    <div class="special-card-img">
                        <img src="${product.image_url}" alt="${product.name}">
                        <div class="special-card-overlay">
                            <button class="special-order-btn" data-id="${product.id}">Order Now</button>
                        </div>
                    </div>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description?.substring(0, 80) || 'Delicious dessert')}...</p>
                    <div class="special-price">${formatPrice(product.price)}</div>
                </div>
            `).join('');
        }
        
        // بعد إضافة الأزرار، ربطها
        setTimeout(() => {
            bindAllAddToCartButtons();
        }, 100);
    }

    async function loadFeaturedProducts() {
        const featuredProducts = allProducts.slice(0, 3);
        const menuContainer = document.querySelector('.menu-container');
        
        if (menuContainer && featuredProducts.length) {
            menuContainer.innerHTML = featuredProducts.map(product => `
                <div class="menu-card animate-card">
                    <img data-src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.description?.substring(0, 80))}...</p>
                    <div class="menu-card-price">${formatPrice(product.price)}</div>
                    <button class="btn-order add-to-cart-featured" data-id="${product.id}">Add to Cart</button>
                </div>
            `).join('');
            
            if (window.UIModule && window.UIModule.initLazyLoading) {
                window.UIModule.initLazyLoading();
            }
            
            setTimeout(() => {
                bindAllAddToCartButtons();
            }, 100);
        }
    }

    function getProductById(id) {
        return allProducts.find(p => p.id === id);
    }

    function escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        init,
        getAllProducts: () => allProducts,
        getProductById,
        loadSpecialSections,
        bindButtons: bindAllAddToCartButtons
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductsModule.init());
} else {
    ProductsModule.init();
}

window.ProductsModule = ProductsModule;