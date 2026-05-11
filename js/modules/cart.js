/**
 * Cart Module - Full E-commerce Version 6.0.0
 * مع نظام Checkout كامل وإنشاء الطلبات في Supabase
 */

const CartModule = (function() {
    'use strict';

    let cartItems = [];
    let cartOverlay = null;
    let cartContainer = null;
    let cartBadge = null;
    let isLoading = false;
    let pendingAdds = new Set();
    let refreshInProgress = false;

    async function init() {
        cartOverlay = document.querySelector('.cart-overlay');
        cartContainer = document.querySelector('.cart-items-container');
        cartBadge = document.getElementById('cart-badge');
        
        if (!cartBadge) {
            cartBadge = document.querySelector('.cart-badge');
        }
        
        await loadCartFromSupabase(true);
        initCartEvents();
        updateCartUI();
        
        setInterval(() => forceBadgeUpdate(), 3000);
        
        console.log('🛒 Cart module initialized v6.0.0');
    }

    async function loadCartFromSupabase(force = false) {
        if (isLoading && !force) {
            console.log('Cart loading already in progress, skipping...');
            return;
        }
        
        if (refreshInProgress && !force) {
            console.log('Cart refresh already in progress, skipping...');
            return;
        }
        
        refreshInProgress = true;
        isLoading = true;
        
        try {
            if (!window.supabaseService) {
                cartItems = [];
                forceBadgeUpdate();
                return;
            }
            
            const result = await window.supabaseService.getCart();
            
            if (result.success && result.data) {
                cartItems = (result.data.items && Array.isArray(result.data.items)) ? result.data.items : [];
                await syncProductDetails();
                console.log('✅ Cart loaded from Supabase, items:', cartItems.length);
            } else {
                console.log('No cart found, initializing empty cart');
                cartItems = [];
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            cartItems = [];
        } finally {
            isLoading = false;
            refreshInProgress = false;
            forceBadgeUpdate();
            updateCartUI();
        }
    }

    async function syncProductDetails() {
        if (!cartItems.length) return;
        if (!window.supabaseService) return;
        
        try {
            const productIds = [...new Set(cartItems.map(item => item.product_id))];
            const { data: products, error } = await window.supabaseService.supabase
                .from('products')
                .select('id, name, price, image_url')
                .in('id', productIds);
            
            if (error) throw error;
            
            let updated = false;
            
            cartItems = cartItems.map(item => {
                const product = products.find(p => p.id === item.product_id);
                if (product && (product.name !== item.name || product.price !== item.price)) {
                    updated = true;
                    return {
                        ...item,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url
                    };
                }
                return item;
            });
            
            if (updated) await saveCartToSupabase();
        } catch (error) {
            console.error('Error syncing product details:', error);
        }
    }

    async function saveCartToSupabase() {
        if (!window.supabaseService) return false;
        
        try {
            const total = calculateTotal(cartItems);
            await window.supabaseService.saveCart(cartItems, total);
            forceBadgeUpdate();
            return true;
        } catch (error) {
            console.error('Error saving cart:', error);
            return false;
        }
    }

    function calculateTotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    async function addToCart(productId, quantity = 1) {
        if (pendingAdds.has(productId)) {
            console.log('Product already being added, skipping duplicate');
            return;
        }
        
        pendingAdds.add(productId);
        
        try {
            let product = null;
            
            if (window.ProductsModule) {
                product = window.ProductsModule.getProductById(productId);
            }
            
            if (!product && window.supabaseService) {
                const { data, error } = await window.supabaseService.supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();
                
                if (!error && data) product = data;
            }
            
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }
            
            const existingItem = cartItems.find(item => item.product_id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cartItems.push({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    quantity: quantity
                });
            }
            
            await saveCartToSupabase();
            updateCartUI();
            forceBadgeUpdate();
            
            if (window.UIModule) {
                window.UIModule.showPopup(`✓ ${product.name} added to cart`, 'success', 2000);
            }
            
            const cartBtn = document.querySelector('.cart__openBtn');
            if (cartBtn) {
                cartBtn.classList.add('cart-animate');
                setTimeout(() => cartBtn.classList.remove('cart-animate'), 500);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setTimeout(() => pendingAdds.delete(productId), 500);
        }
    }

    async function removeFromCart(productId) {
        cartItems = cartItems.filter(item => item.product_id !== productId);
        await saveCartToSupabase();
        updateCartUI();
        forceBadgeUpdate();
    }

    async function updateQuantity(productId, change) {
        const item = cartItems.find(item => item.product_id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                await removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                await saveCartToSupabase();
                updateCartUI();
                forceBadgeUpdate();
            }
        }
    }

    async function clearCart() {
        console.log('🔄 Clearing cart...');
        cartItems = [];
        
        if (window.supabaseService) {
            await window.supabaseService.clearCart();
        }
        
        updateCartUI();
        forceBadgeUpdate();
        
        if (window.UIModule) {
            window.UIModule.showPopup('Cart cleared', 'info');
        }
    }

    function forceBadgeUpdate() {
        const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        let badge = document.getElementById('cart-badge');
        
        if (!badge) {
            badge = document.querySelector('.cart-badge');
        }
        
        if (!badge) {
            const cartBtn = document.querySelector('.cart__openBtn');
            if (cartBtn) {
                badge = cartBtn.querySelector('.cart-badge, #cart-badge');
            }
        }
        
        if (badge) {
            badge.textContent = totalItems;
            
            if (totalItems > 0) {
                badge.classList.remove('hidden');
                badge.style.display = 'inline-block';
                
                badge.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    if (badge) badge.style.transform = 'scale(1)';
                }, 200);
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
            
            cartBadge = badge;
        } else if (totalItems > 0) {
            const cartBtn = document.querySelector('.cart__openBtn');
            if (cartBtn && !cartBtn.querySelector('.cart-badge')) {
                const newBadge = document.createElement('span');
                newBadge.className = 'cart-badge';
                newBadge.id = 'cart-badge';
                newBadge.textContent = totalItems;
                cartBtn.appendChild(newBadge);
                cartBadge = newBadge;
            }
        }
    }

    function updateCartUI() {
        if (!cartContainer) return;
        
        if (!cartItems || cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-cart-shopping fa-3x"></i>
                    <p>Your cart is empty</p>
                    <button class="box__btn continue-shopping">Continue Shopping</button>
                </div>
            `;
            
            const continueBtn = cartContainer.querySelector('.continue-shopping');
            if (continueBtn) continueBtn.addEventListener('click', () => closeCart());
        } else {
            cartContainer.innerHTML = cartItems.map(item => `
                <div class="cart-item" data-id="${item.product_id}">
                    <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" loading="lazy">
                    <div class="cart-item-info">
                        <h3>${escapeHtml(item.name)}</h3>
                        <h4>${formatPrice(item.price)}</h4>
                        <button class="cart-item-remove" data-id="${item.product_id}">
                            <i class="fa-regular fa-trash-can"></i> Remove
                        </button>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-item-up" data-id="${item.product_id}">▲</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="cart-item-down" data-id="${item.product_id}">▼</button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.removeEventListener('click', handleRemoveClick);
                btn.addEventListener('click', handleRemoveClick);
            });
            
            document.querySelectorAll('.cart-item-up').forEach(btn => {
                btn.removeEventListener('click', handleUpClick);
                btn.addEventListener('click', handleUpClick);
            });
            
            document.querySelectorAll('.cart-item-down').forEach(btn => {
                btn.removeEventListener('click', handleDownClick);
                btn.addEventListener('click', handleDownClick);
            });
        }
        
        updateTotal();
    }
    
    async function handleRemoveClick(e) {
        e.stopPropagation();
        await removeFromCart(e.currentTarget.dataset.id);
    }
    
    async function handleUpClick(e) {
        e.stopPropagation();
        await updateQuantity(e.currentTarget.dataset.id, 1);
    }
    
    async function handleDownClick(e) {
        e.stopPropagation();
        await updateQuantity(e.currentTarget.dataset.id, -1);
    }

    function updateTotal() {
        const totalElement = document.querySelector('.total');
        if (!totalElement) return;
        
        const subtotal = calculateTotal(cartItems);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.14;
        const total = subtotal + shipping + tax;
        
        totalElement.innerHTML = `
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (14%):</span>
                    <span>${formatPrice(tax)}</span>
                </div>
                <div class="summary-row total-row">
                    <span><strong>Total:</strong></span>
                    <span><strong>${formatPrice(total)}</strong></span>
                </div>
            </div>
            ${cartItems.length > 0 ? '<button class="checkout-btn">Proceed to Checkout →</button>' : ''}
        `;
        
        const checkoutBtn = totalElement.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.removeEventListener('click', handleCheckoutClick);
            checkoutBtn.addEventListener('click', handleCheckoutClick);
        }
    }
    
    async function handleCheckoutClick() {
        if (cartItems.length === 0) {
            if (window.UIModule) window.UIModule.showPopup('Your cart is empty', 'warning');
            return;
        }
        
        const isAuthenticated = window.supabaseService?.isAuthenticated();
        
        if (!isAuthenticated) {
            if (window.UIModule) window.UIModule.showProtectedPopup();
            return;
        }
        
        openCheckoutModal();
    }
    
    function openCheckoutModal() {
        const subtotal = calculateTotal(cartItems);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.14;
        const total = subtotal + shipping + tax;
        
        const modalHTML = `
            <div id="checkout-modal" class="checkout-modal">
                <div class="checkout-modal-content">
                    <div class="checkout-modal-header">
                        <h2><i class="fa-regular fa-credit-card"></i> Complete Your Order</h2>
                        <button class="checkout-modal-close">&times;</button>
                    </div>
                    <div class="checkout-modal-body">
                        <div class="checkout-sections">
                            <div class="checkout-section">
                                <h3><i class="fa-regular fa-user"></i> Contact Information</h3>
                                <input type="text" id="checkout-name" placeholder="Full Name" required>
                                <input type="email" id="checkout-email" placeholder="Email Address" value="${escapeHtml(window.supabaseService.getCurrentUser()?.email || '')}" readonly disabled>
                                <input type="tel" id="checkout-phone" placeholder="Phone Number" required>
                            </div>
                            
                            <div class="checkout-section">
                                <h3><i class="fa-regular fa-location-dot"></i> Shipping Address</h3>
                                <input type="text" id="checkout-address" placeholder="Street Address" required>
                                <input type="text" id="checkout-city" placeholder="City" required>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <input type="text" id="checkout-state" placeholder="State">
                                    <input type="text" id="checkout-zip" placeholder="ZIP Code">
                                </div>
                            </div>
                            
                            <div class="checkout-section">
                                <h3><i class="fa-regular fa-credit-card"></i> Payment Method</h3>
                                <div class="payment-methods">
                                    <label class="payment-method">
                                        <input type="radio" name="payment" value="card" checked>
                                        <i class="fa-brands fa-cc-visa"></i> Credit Card
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="payment" value="paypal">
                                        <i class="fa-brands fa-paypal"></i> PayPal
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="payment" value="cash">
                                        <i class="fa-solid fa-money-bill"></i> Cash on Delivery
                                    </label>
                                </div>
                            </div>
                            
                            <div class="checkout-section">
                                <h3><i class="fa-regular fa-note"></i> Order Notes (Optional)</h3>
                                <textarea id="checkout-notes" rows="3" placeholder="Special instructions, delivery notes, etc..."></textarea>
                            </div>
                        </div>
                        
                        <div class="checkout-sidebar">
                            <h3>Order Summary</h3>
                            <div class="order-items-preview">
                                ${cartItems.map(item => `
                                    <div class="order-item-preview">
                                        <span>${item.quantity}x ${escapeHtml(item.name)}</span>
                                        <span>${formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="checkout-totals">
                                <div class="checkout-row"><span>Subtotal:</span><span>${formatPrice(subtotal)}</span></div>
                                <div class="checkout-row"><span>Shipping:</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                                <div class="checkout-row"><span>Tax (14%):</span><span>${formatPrice(tax)}</span></div>
                                <div class="checkout-row total"><span>Total:</span><span>${formatPrice(total)}</span></div>
                            </div>
                            <button id="place-order-btn" class="place-order-btn">
                                <i class="fa-regular fa-check-circle"></i> Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('checkout-modal');
        const closeBtn = modal.querySelector('.checkout-modal-close');
        const placeOrderBtn = document.getElementById('place-order-btn');
        
        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        placeOrderBtn.onclick = async () => await placeOrder(modal);
    }
    
    async function placeOrder(modal) {
        const name = document.getElementById('checkout-name')?.value.trim();
        const phone = document.getElementById('checkout-phone')?.value.trim();
        const address = document.getElementById('checkout-address')?.value.trim();
        const city = document.getElementById('checkout-city')?.value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        const notes = document.getElementById('checkout-notes')?.value.trim();
        
        if (!name || !phone || !address || !city) {
            if (window.UIModule) window.UIModule.showPopup('Please fill in all required fields', 'error');
            return;
        }
        
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        
        try {
            const subtotal = calculateTotal(cartItems);
            const shipping = subtotal > 50 ? 0 : 5.99;
            const tax = subtotal * 0.14;
            const total = subtotal + shipping + tax;
            
            const orderData = {
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.image_url,
                    total: item.price * item.quantity
                })),
                subtotal: subtotal,
                shipping_cost: shipping,
                tax: tax,
                discount: 0,
                total_amount: total,
                shipping_address: {
                    name: name,
                    phone: phone,
                    address: address,
                    city: city,
                    state: document.getElementById('checkout-state')?.value,
                    zip: document.getElementById('checkout-zip')?.value
                },
                payment_method: paymentMethod,
                notes: notes
            };
            
            const result = await window.supabaseService.createOrder(orderData);
            
            if (result.success) {
                if (window.UIModule) {
                    window.UIModule.showPopup('🎉 Order placed successfully! Thank you for your purchase!', 'success', 3000);
                }
                
                await clearCart();
                modal.remove();
                closeCart();
                
                setTimeout(() => {
                    showOrderConfirmation(result.data);
                }, 500);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            if (window.UIModule) {
                window.UIModule.showPopup('Failed to place order. Please try again.', 'error');
            }
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fa-regular fa-check-circle"></i> Place Order';
        }
    }
    
    function showOrderConfirmation(order) {
        const confirmationHTML = `
            <div id="order-confirmation" class="order-confirmation">
                <div class="confirmation-content">
                    <div class="confirmation-icon">
                        <i class="fa-regular fa-circle-check"></i>
                    </div>
                    <h2>Order Confirmed!</h2>
                    <p>Thank you for your purchase</p>
                    <div class="order-details">
                        <div class="order-detail-row">
                            <span>Order ID:</span>
                            <strong>${escapeHtml(order.order_id)}</strong>
                        </div>
                        <div class="order-detail-row">
                            <span>Total Amount:</span>
                            <strong>${formatPrice(order.total_amount)}</strong>
                        </div>
                        <div class="order-detail-row">
                            <span>Payment Method:</span>
                            <span>${escapeHtml(order.payment_method)}</span>
                        </div>
                        <div class="order-detail-row">
                            <span>Order Status:</span>
                            <span class="status-${order.order_status}">${order.order_status}</span>
                        </div>
                        <div class="order-detail-row">
                            <span>Payment Status:</span>
                            <span class="payment-${order.payment_status}">${order.payment_status}</span>
                        </div>
                    </div>
                    <div class="confirmation-buttons">
                        <button class="view-orders-btn">View My Orders</button>
                        <button class="close-confirmation-btn">Continue Shopping</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
        
        const confirmation = document.getElementById('order-confirmation');
        const closeBtn = confirmation.querySelector('.close-confirmation-btn');
        const viewOrdersBtn = confirmation.querySelector('.view-orders-btn');
        
        closeBtn.onclick = () => confirmation.remove();
        viewOrdersBtn.onclick = () => {
            confirmation.remove();
            if (window.OrdersModule) {
                window.OrdersModule.openOrdersPage();
            } else {
                window.location.href = 'orders.html';
            }
        };
        confirmation.onclick = (e) => { if (e.target === confirmation) confirmation.remove(); };
        
        setTimeout(() => {
            if (confirmation) confirmation.remove();
        }, 15000);
    }

    function initCartEvents() {
        const openCartBtns = document.querySelectorAll('.cart__openBtn');
        openCartBtns.forEach(btn => {
            btn.removeEventListener('click', handleOpenCart);
            btn.addEventListener('click', handleOpenCart);
        });
        
        const closeCartBtn = document.querySelector('.cart__closeBtn');
        if (closeCartBtn) {
            closeCartBtn.removeEventListener('click', closeCart);
            closeCartBtn.addEventListener('click', closeCart);
        }
        
        if (cartOverlay) {
            cartOverlay.removeEventListener('click', handleOverlayClick);
            cartOverlay.addEventListener('click', handleOverlayClick);
        }
        
        document.removeEventListener('keydown', handleEscapeKey);
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    function handleOpenCart(e) {
        e.preventDefault();
        openCart();
    }
    
    function handleOverlayClick(e) {
        if (e.target === cartOverlay) closeCart();
    }
    
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && cartOverlay?.classList.contains('transparentBcg')) closeCart();
    }

    function openCart() {
        if (cartOverlay) {
            cartOverlay.classList.add('transparentBcg');
            const cart = document.querySelector('.cart');
            if (cart) cart.classList.add('showcart');
            document.body.classList.add('no-scroll');
        }
    }

    function closeCart() {
        if (cartOverlay) {
            cartOverlay.classList.remove('transparentBcg');
            const cart = document.querySelector('.cart');
            if (cart) cart.classList.remove('showcart');
            document.body.classList.remove('no-scroll');
        }
    }

    function formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) return '0.00 EGP';
        return `${price.toFixed(2)} EGP`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        init,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItems: () => cartItems,
        getCartCount: () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
        getCartTotal: () => calculateTotal(cartItems),
        openCart,
        closeCart,
        refreshCart: loadCartFromSupabase,
        updateBadge: forceBadgeUpdate
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    CartModule.init();
});

window.CartModule = CartModule;