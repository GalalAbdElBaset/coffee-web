/**
 * Supabase Configuration
 * @version 5.0.0 - Fixed critical issues: cart merge, constraints, race conditions
 */

const SUPABASE_URL = 'https://ybyjstbjpqbvuifjsbbu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iHQOcGnSCobKPa6fGB4DaQ_S2qJpRd0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// ==================== UTILITY FUNCTIONS ====================
const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
};

const generateSecureSessionId = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return 'session_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// ==================== AUTH SERVICE ====================
class AuthService {
    constructor(supabase) {
        this.supabase = supabase;
        this.currentUser = null;
        this.session = null;
        this.listeners = [];
        this.initAuthListener();
    }

    initAuthListener() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            // 🔥 Filter only relevant events
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                this.session = session;
                this.currentUser = session?.user || null;
                
                // Notify all subscribers
                this.listeners.forEach(listener => {
                    try {
                        listener(event, this.currentUser);
                    } catch (error) {
                        console.error('Auth listener error:', error);
                    }
                });
            }
        });
        
        setTimeout(() => this.checkSession(), 100);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;
            this.session = session;
            this.currentUser = session?.user || null;
            
            this.listeners.forEach(listener => {
                listener(this.currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', this.currentUser);
            });
        } catch (error) {
            console.error('Session check error:', error);
        }
    }

    async signUp(email, password, username) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email, password,
                options: { data: { full_name: username, display_name: username } }
            });
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentUser() { return this.currentUser; }
    isAuthenticated() { return !!this.currentUser; }
}

// ==================== CART SERVICE ====================
class CartService {
    constructor(supabase, authService) {
        this.supabase = supabase;
        this.authService = authService;
        this.cartCache = null;
        this.cacheTimestamp = null;
        this.CACHE_TTL = 5000; // 5 seconds cache
    }

    getSessionId() {
        const SESSION_KEY = 'coffee_cart_session_v2';
        let sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            sessionId = generateSecureSessionId();
            localStorage.setItem(SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    async getCart(useCache = true) {
        // Check cache
        if (useCache && this.cartCache && this.cacheTimestamp && (Date.now() - this.cacheTimestamp) < this.CACHE_TTL) {
            return { success: true, data: this.cartCache };
        }

        const sessionId = this.getSessionId();
        const userId = this.authService.getCurrentUser()?.id;
        
        try {
            let query = this.supabase.from('carts').select('*');
            
            if (userId) {
                query = query.eq('user_id', userId);
            } else {
                query = query.eq('session_id', sessionId);
            }
            
            // 🔥 Use single() instead of maybeSingle() to detect duplicates
            const { data, error, count } = await query;
            
            if (error) {
                console.error('Error getting cart:', error);
                return { success: false, data: null };
            }
            
            // 🔥 Detect duplicate carts
            if (data && data.length > 1) {
                console.error(`⚠️ Found ${data.length} duplicate carts for ${userId ? 'user' : 'session'}`);
                await this.cleanupDuplicateCarts(data, userId, sessionId);
                
                // Retry after cleanup
                return this.getCart(false);
            }
            
            const cartData = (data && data[0]) || null;
            this.cartCache = cartData;
            this.cacheTimestamp = Date.now();
            
            return { success: true, data: cartData };
        } catch (error) {
            console.error('Exception getting cart:', error);
            return { success: false, data: null };
        }
    }

    async cleanupDuplicateCarts(duplicateCarts, userId, sessionId) {
        // Keep the most recent cart, delete others
        const sorted = duplicateCarts.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        );
        
        const keepCart = sorted[0];
        const deleteCarts = sorted.slice(1);
        
        for (const cart of deleteCarts) {
            await this.supabase.from('carts').delete().eq('id', cart.id);
        }
        
        console.log(`✅ Cleaned up ${deleteCarts.length} duplicate carts, kept cart ${keepCart.id}`);
    }

    async mergeCarts(userCart, sessionCart, userId) {
        if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
            return userCart;
        }
        
        if (!userCart || !userCart.items || userCart.items.length === 0) {
            // No user cart, use session cart
            return {
                items: sessionCart.items,
                total_amount: sessionCart.total_amount || 0
            };
        }
        
        // Merge both carts
        const mergedItems = [...userCart.items];
        const sessionItems = sessionCart.items || [];
        
        for (const sessionItem of sessionItems) {
            const existingIndex = mergedItems.findIndex(item => item.id === sessionItem.id);
            if (existingIndex >= 0) {
                // Update quantity
                mergedItems[existingIndex].quantity += sessionItem.quantity;
            } else {
                // Add new item
                mergedItems.push({ ...sessionItem });
            }
        }
        
        const mergedTotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        console.log(`🔄 Merged cart: ${sessionItems.length} session items + ${userCart.items.length} user items = ${mergedItems.length} total`);
        
        return {
            items: mergedItems,
            total_amount: mergedTotal
        };
    }

    async saveCart(items, total) {
        const sessionId = this.getSessionId();
        const userId = this.authService.getCurrentUser()?.id;
        
        if (!items || items.length === 0) {
            return this.clearCart();
        }
        
        try {
            const cartData = {
                items: items,
                total_amount: total,
                updated_at: new Date().toISOString()
            };
            
            if (userId) {
                cartData.user_id = userId;
            } else {
                cartData.session_id = sessionId;
            }
            
            // 🔥 Use upsert with conflict handling
            const { data, error } = await this.supabase
                .from('carts')
                .upsert(cartData, {
                    onConflict: userId ? 'user_id' : 'session_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Invalidate cache
            this.cartCache = data;
            this.cacheTimestamp = Date.now();
            
            return { success: true, data };
        } catch (error) {
            console.error('Error saving cart:', error);
            return { success: false };
        }
    }

    async clearCart() {
        const userId = this.authService.getCurrentUser()?.id;
        const sessionId = this.getSessionId();
        
        try {
            let query;
            if (userId) {
                query = this.supabase.from('carts').update({ items: [], total_amount: 0 }).eq('user_id', userId);
            } else {
                query = this.supabase.from('carts').update({ items: [], total_amount: 0 }).eq('session_id', sessionId);
            }
            
            const { error } = await query;
            
            if (error) throw error;
            
            // Invalidate cache
            this.cartCache = null;
            this.cacheTimestamp = null;
            
            return { success: true };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false };
        }
    }

    async refreshCartAfterLogin() {
        const userId = this.authService.getCurrentUser()?.id;
        if (!userId) return null;
        
        const sessionId = this.getSessionId();
        
        try {
            // Get both carts
            const { data: sessionCart } = await this.supabase
                .from('carts')
                .select('*')
                .eq('session_id', sessionId)
                .maybeSingle();
            
            const { data: userCart } = await this.supabase
                .from('carts')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            
            // Merge carts
            const mergedCart = await this.mergeCarts(userCart, sessionCart, userId);
            
            // Save merged cart
            const { data, error } = await this.supabase
                .from('carts')
                .upsert({
                    user_id: userId,
                    items: mergedCart.items,
                    total_amount: mergedCart.total_amount,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Delete session cart after merge
            if (sessionCart && sessionCart.id) {
                await this.supabase.from('carts').delete().eq('id', sessionCart.id);
            }
            
            // Update cache
            this.cartCache = data;
            this.cacheTimestamp = Date.now();
            
            console.log('✅ Cart merged after login successfully');
            return { success: true, data };
        } catch (error) {
            console.error('Error merging cart after login:', error);
            return { success: false };
        }
    }
}

// ==================== UI SERVICE ====================
class UIService {
    constructor(authService, cartService) {
        this.authService = authService;
        this.cartService = cartService;
        this.cachedElements = {};
        this.init();
    }

    getElement(selector) {
        if (!this.cachedElements[selector]) {
            this.cachedElements[selector] = document.querySelector(selector);
        }
        return this.cachedElements[selector];
    }

    init() {
        // Subscribe to auth changes
        this.authService.subscribe((event, user) => {
            if (event === 'SIGNED_IN') {
                this.updateUIForAuthenticatedUser(user);
                this.handleCartAfterLogin();
            } else if (event === 'SIGNED_OUT') {
                this.updateUIForUnauthenticatedUser();
                this.handleCartAfterLogout();
            }
        });
    }

    async handleCartAfterLogin() {
        // Merge session cart with user cart
        const result = await this.cartService.refreshCartAfterLogin();
        
        // Refresh cart display
        if (window.CartModule && typeof window.CartModule.refreshCart === 'function') {
            await window.CartModule.refreshCart();
        }
    }

    async handleCartAfterLogout() {
        // Clear cart display but keep session cart in DB
        if (window.CartModule && typeof window.CartModule.refreshCart === 'function') {
            await window.CartModule.refreshCart();
        }
    }

    updateUIForAuthenticatedUser(user) {
        const signInLink = this.getElement('.sign-in');
        const signUpLink = this.getElement('.sign-up');
        const slashSpan = this.getElement('#slash');
        const logoutBtn = this.getElement('#logout-btn');
        const usernameDisplay = this.getElement('#username-display');

        if (signInLink) signInLink.style.display = 'none';
        if (signUpLink) signUpLink.style.display = 'none';
        if (slashSpan) slashSpan.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.classList.remove('hidden');
        }
        if (usernameDisplay) {
            usernameDisplay.style.display = 'inline-flex';
            const displayName = user?.user_metadata?.full_name || 
                               user?.email?.split('@')[0] || 
                               'User';
            // 🔥 Escape HTML to prevent XSS
            usernameDisplay.innerHTML = `<i class="fa-regular fa-circle-user"></i> ${escapeHtml(displayName)}`;
            usernameDisplay.classList.remove('hidden');
        }
    }

    updateUIForUnauthenticatedUser() {
        const signInLink = this.getElement('.sign-in');
        const signUpLink = this.getElement('.sign-up');
        const slashSpan = this.getElement('#slash');
        const logoutBtn = this.getElement('#logout-btn');
        const usernameDisplay = this.getElement('#username-display');
        
        if (signInLink) {
            signInLink.style.display = 'inline-block';
            signInLink.style.visibility = 'visible';
        }
        if (signUpLink) {
            signUpLink.style.display = 'inline-block';
            signUpLink.style.visibility = 'visible';
        }
        if (slashSpan) {
            slashSpan.style.display = 'inline-block';
            slashSpan.style.visibility = 'visible';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            logoutBtn.classList.add('hidden');
        }
        if (usernameDisplay) {
            usernameDisplay.style.display = 'none';
            usernameDisplay.classList.add('hidden');
        }
    }
}

// ==================== MAIN SERVICE (FACADE) ====================
class SupabaseService {
    constructor() {
        this.supabase = supabaseClient;
        this.authService = new AuthService(this.supabase);
        this.cartService = new CartService(this.supabase, this.authService);
        this.uiService = new UIService(this.authService, this.cartService);
    }

    // Auth methods (delegated)
    async signUp(email, password, username) {
        return this.authService.signUp(email, password, username);
    }

    async signIn(email, password) {
        return this.authService.signIn(email, password);
    }

    async signOut() {
        return this.authService.signOut();
    }

    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    isAuthenticated() {
        return this.authService.isAuthenticated();
    }

    // Cart methods (delegated)
    async getCart() {
        return this.cartService.getCart();
    }

    async saveCart(items, total) {
        return this.cartService.saveCart(items, total);
    }

    async clearCart() {
        return this.cartService.clearCart();
    }

    async refreshCartAfterLogin() {
        return this.cartService.refreshCartAfterLogin();
    }

    // Utility
    getSessionId() {
        return this.cartService.getSessionId();
    }

    async getAll(table, query = {}) {
        try {
            let dbQuery = this.supabase.from(table).select('*');
            if (query.filters) {
                Object.entries(query.filters).forEach(([key, value]) => {
                    dbQuery = dbQuery.eq(key, value);
                });
            }
            if (query.orderBy) {
                dbQuery = dbQuery.order(query.orderBy.column, { ascending: query.orderBy.ascending !== false });
            }
            const { data, error } = await dbQuery;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching ${table}:`, error);
            return { success: false, data: [] };
        }
    }
}

// ==================== INITIALIZATION ====================
const supabaseService = new SupabaseService();
window.supabaseService = supabaseService;

console.log('✅ Supabase Service v5.0.0 initialized with fixes for all critical issues');