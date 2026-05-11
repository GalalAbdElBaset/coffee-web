/**
 * Admin Dashboard Entry Point
 * @version 1.0.0
 */

(function() {
    'use strict';

    /**
     * Initialize admin dashboard
     */
    async function initAdmin() {
        console.log('🛠️ Admin Dashboard Initializing...');
        
        // Wait for supabase service
        await waitForSupabase();
        
        // Admin auth is handled in admin-auth.js
        // Other modules are initialized after successful login
    }

    /**
     * Wait for Supabase service
     */
    function waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabaseService) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabaseService) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('Supabase service timeout');
                    resolve();
                }, 5000);
            }
        });
    }

    // Start admin when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdmin);
    } else {
        initAdmin();
    }
})();