/**
 * Admin Authentication Module
 * @version 1.0.0
 */

(function() {
    'use strict';

    const ADMIN_EMAILS = ['admin@coffeebrand.com', 'owner@coffeebrand.com'];

    /**
     * Initialize admin auth
     */
    async function initAdminAuth() {
        const loginOverlay = document.getElementById('admin-login-overlay');
        const dashboard = document.getElementById('admin-dashboard');
        
        // Check if already logged in
        const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
        const isAdmin = window.supabaseService?.isAdmin();
        
        if (isLoggedIn || isAdmin) {
            showDashboard();
        } else {
            showLogin();
        }
        
        // Login button handler
        const loginBtn = document.getElementById('admin-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', handleAdminLogin);
        }
        
        // Logout button handler
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleAdminLogout);
        }
        
        // Enter key on password field
        const passwordInput = document.getElementById('admin-password-input');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleAdminLogin();
            });
        }
    }

    /**
     * Handle admin login
     */
    async function handleAdminLogin() {
        const emailInput = document.getElementById('admin-email-input');
        const passwordInput = document.getElementById('admin-password-input');
        const errorDiv = document.getElementById('admin-login-error');
        
        const email = emailInput?.value.trim();
        const password = passwordInput?.value;
        
        if (!email || !password) {
            showError('Please enter email and password');
            return;
        }
        
        // Check if email is admin
        if (!ADMIN_EMAILS.includes(email)) {
            showError('Access denied. Admin email required.');
            return;
        }
        
        // Show loading
        const loginBtn = document.getElementById('admin-login-btn');
        if (loginBtn) {
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
        }
        
        // Attempt login
        const result = await window.supabaseService.signIn(email, password);
        
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
        
        if (result.success) {
            sessionStorage.setItem('admin_logged_in', 'true');
            showDashboard();
        } else {
            showError('Invalid credentials. Please try again.');
        }
    }

    /**
     * Handle admin logout
     */
    async function handleAdminLogout() {
        await window.supabaseService.signOut();
        sessionStorage.removeItem('admin_logged_in');
        showLogin();
    }

    /**
     * Show dashboard
     */
    function showDashboard() {
        const loginOverlay = document.getElementById('admin-login-overlay');
        const dashboard = document.getElementById('admin-dashboard');
        const adminEmailSpan = document.getElementById('admin-email');
        
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        if (adminEmailSpan && window.supabaseService?.currentUser) {
            adminEmailSpan.textContent = window.supabaseService.currentUser.email;
        }
        
        // Initialize admin modules
        if (window.AdminProducts) window.AdminProducts.init();
        if (window.AdminFaq) window.AdminFaq.init();
        if (window.AdminStats) window.AdminStats.init();
        if (window.AdminGallery) window.AdminGallery.init();
        if (window.AdminServices) window.AdminServices.init();
        if (window.AdminContacts) window.AdminContacts.init();
        
        // Setup sidebar navigation
        setupSidebarNavigation();
    }

    /**
     * Show login screen
     */
    function showLogin() {
        const loginOverlay = document.getElementById('admin-login-overlay');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        
        // Clear form
        const emailInput = document.getElementById('admin-email-input');
        const passwordInput = document.getElementById('admin-password-input');
        const errorDiv = document.getElementById('admin-login-error');
        
        if (emailInput) emailInput.value = 'admin@coffeebrand.com';
        if (passwordInput) passwordInput.value = '';
        if (errorDiv) errorDiv.textContent = '';
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.getElementById('admin-login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            setTimeout(() => {
                errorDiv.textContent = '';
            }, 3000);
        }
    }

    /**
     * Setup sidebar navigation
     */
    function setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.sidebar-nav li a');
        const sections = document.querySelectorAll('.admin-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const sectionId = link.dataset.section;
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show selected section
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${sectionId}-section`) {
                        section.classList.add('active');
                    }
                });
                
                // Close sidebar on mobile
                const sidebar = document.getElementById('sidebar');
                if (sidebar && window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });
        });
        
        // Mobile menu toggle (optional)
        const menuToggle = document.createElement('button');
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        menuToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #e94560;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 300;
            display: none;
        `;
        
        if (window.innerWidth <= 768) {
            menuToggle.style.display = 'flex';
            menuToggle.style.alignItems = 'center';
            menuToggle.style.justifyContent = 'center';
            document.body.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.toggle('open');
            });
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for supabase service
        const checkInterval = setInterval(() => {
            if (window.supabaseService) {
                clearInterval(checkInterval);
                initAdminAuth();
            }
        }, 100);
    });
})();