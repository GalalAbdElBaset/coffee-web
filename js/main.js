/**
 * Main Application Entry Point
 * @version 3.1.0 - مع دعم كامل للسلة في Supabase
 */

(function() {
    'use strict';

    let cartModuleInitialized = false;

    /**
     * Wait for DOM and all modules to be ready
     */
    async function initApp() {
        console.log('🚀 Coffee Brand App Initializing...');
        
        await waitForSupabase();
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Initialize cart module ONCE for all pages
        if (window.CartModule && !cartModuleInitialized) {
            await window.CartModule.init();
            cartModuleInitialized = true;
        }
        
        // Page-specific modules
        switch(currentPage) {
            case 'index.html':
            case '':
            case '/':
                if (window.ProductsModule) await window.ProductsModule.init();
                break;
                
            case 'menu.html':
                if (window.ProductsModule) await window.ProductsModule.init();
                break;
                
            case 'contact.html':
                if (window.ContactModule) window.ContactModule.init();
                if (window.FaqModule) window.FaqModule.init();
                if (window.StatsModule) window.StatsModule.init();
                break;
                
            case 'services.html':
                if (window.ServicesModule) window.ServicesModule.init();
                break;
                
            case 'about.html':
                break;
        }
        
        if (window.GalleryModule) window.GalleryModule.init();
        
        initMobileMenu();
        
        console.log('✅ Coffee Brand App Ready!');
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
                    console.warn('Supabase service timeout, continuing anyway');
                    resolve();
                }, 5000);
            }
        });
    }

    /**
     * Throttle function
     */
    function throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const menuBtn = document.getElementById('menu-btn') || document.querySelector('.menu-btn');
        const menuNav = document.getElementById('menu-nav') || document.querySelector('.menu-nav');
        const burger = document.querySelector('.menu-btn__burger');
        const menuOverlay = document.getElementById('menu-overlay');
        
        if (!menuBtn || !menuNav || !burger || !menuOverlay) {
            console.warn('Mobile menu elements not found');
            return;
        }
        
        let isMenuOpen = false;
        
        function closeMenu() {
            if (!isMenuOpen) return;
            menuNav.classList.remove('open');
            burger.classList.remove('open');
            menuOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            menuBtn.setAttribute('aria-expanded', 'false');
            isMenuOpen = false;
        }
        
        function openMenu() {
            if (isMenuOpen) return;
            menuNav.classList.add('open');
            burger.classList.add('open');
            menuOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
            menuBtn.setAttribute('aria-expanded', 'true');
            isMenuOpen = true;
        }
        
        function toggleMenu(e) {
            e.stopPropagation();
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        }
        
        menuBtn.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', closeMenu);
        
        if (menuNav) {
            menuNav.addEventListener('click', (e) => {
                const link = e.target.closest('.menu-nav__link');
                if (link && !link.closest('.cart__openBtn')) {
                    closeMenu();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) closeMenu();
        });
        
        const handleResize = throttle(() => {
            if (window.innerWidth > 1024 && isMenuOpen) closeMenu();
        }, 150);
        
        window.addEventListener('resize', handleResize);
    }

    // Start application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();