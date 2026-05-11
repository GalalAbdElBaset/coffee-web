/**
 * Auth Module - Fixed Logout
 * @version 2.4.0 - Fixed logout compatibility
 */

const AuthModule = (function() {
    'use strict';

    let isSubmitting = false;
    let submitTimeout = null;

    function init() {
        const currentPage = window.location.pathname.split('/').pop();
        
        console.log('🔐 AuthModule initialized on page:', currentPage || 'index');
        
        if (currentPage === 'sign-in.html') {
            initSignIn();
        } else if (currentPage === 'sign-up.html') {
            initSignUp();
        }
        
        initLogout();
    }

    function initSignIn() {
        const form = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('pswrd');
        const emailInput = document.getElementById('userid');

        if (!form) return;

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                togglePassword.classList.toggle('fa-eye');
                togglePassword.classList.toggle('fa-eye-slash');
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const email = emailInput?.value.trim();
            const password = passwordInput?.value;
            
            if (!email || !password) {
                showFormError('Please fill in all fields');
                return;
            }

            if (!isValidEmail(email)) {
                showFormError('Please enter a valid email address');
                return;
            }
            
            isSubmitting = true;
            
            if (loginBtn) {
                loginBtn.disabled = true;
                if (window.UIModule) window.UIModule.showButtonLoading(loginBtn, 'Signing in...');
            }
            
            try {
                const result = await window.supabaseService.signIn(email, password);
                
                if (result.error && result.error.includes('rate limit')) {
                    showFormError('Too many attempts. Please wait a few seconds.');
                    if (window.UIModule) window.UIModule.showPopup('Too many attempts. Please wait.', 'warning');
                    return;
                }
                
                if (result.success) {
                    if (window.UIModule) window.UIModule.showPopup('Welcome back! 🎉 Login successful', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    let errorMessage = 'Login failed. Please try again.';
                    if (result.error === 'Invalid login credentials') {
                        errorMessage = 'Invalid email or password. Please try again.';
                    }
                    showFormError(errorMessage);
                    if (window.UIModule) window.UIModule.showPopup(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showFormError('Something went wrong. Please try again.');
                if (window.UIModule) window.UIModule.showPopup('Connection error. Please try again.', 'error');
            } finally {
                isSubmitting = false;
                if (loginBtn) {
                    loginBtn.disabled = false;
                    if (window.UIModule) window.UIModule.hideButtonLoading(loginBtn);
                }
            }
        });
    }

    function initSignUp() {
        const form = document.getElementById('signup-form');
        const signUpBtn = document.getElementById('sign-up-btn');
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('pswrd');
        const emailInput = document.getElementById('emailid');
        const usernameInput = document.getElementById('userid');

        if (!form) return;

        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                togglePassword.classList.toggle('fa-eye');
                togglePassword.classList.toggle('fa-eye-slash');
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (isSubmitting) return;
            
            const email = emailInput?.value.trim();
            const username = usernameInput?.value.trim();
            const password = passwordInput?.value.trim();
            
            if (!email || !username || !password) {
                showFormError('Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormError('Please enter a valid email address');
                return;
            }
            
            if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
                showFormError('Username must be 3-20 characters (letters and numbers only)');
                return;
            }
            
            const passwordStrength = checkPasswordStrength(password);
            if (passwordStrength.score < 3) {
                let message = 'Password is too weak. Use at least 8 characters with uppercase and numbers.';
                showFormError(message);
                return;
            }
            
            isSubmitting = true;
            
            if (signUpBtn) {
                signUpBtn.disabled = true;
                if (window.UIModule) window.UIModule.showButtonLoading(signUpBtn, 'Creating account...');
            }
            
            try {
                const result = await window.supabaseService.signUp(email, password, username);
                
                if (result.error && result.error.includes('rate limit')) {
                    showFormError('Too many attempts. Please wait a few seconds.');
                    if (window.UIModule) window.UIModule.showPopup('Too many attempts. Please wait.', 'warning');
                    return;
                }
                
                if (result.success) {
                    const needsConfirmation = result.data?.user?.identities?.length === 0;
                    
                    if (needsConfirmation) {
                        if (window.UIModule) window.UIModule.showPopup('Account created! Please check your email to confirm.', 'success');
                    } else {
                        if (window.UIModule) window.UIModule.showPopup('Account created successfully! 🎉 You can now sign in.', 'success');
                    }
                    
                    form.reset();
                    
                    setTimeout(() => {
                        window.location.href = 'sign-in.html';
                    }, 3000);
                } else {
                    let errorMessage = 'Sign up failed. Please try again.';
                    if (result.error && result.error.includes('already registered')) {
                        errorMessage = 'This email is already registered. Please sign in instead.';
                    }
                    showFormError(errorMessage);
                    if (window.UIModule) window.UIModule.showPopup(errorMessage, 'error');
                }
            } catch (error) {
                console.error('Sign up error:', error);
                showFormError('Something went wrong. Please try again.');
                if (window.UIModule) window.UIModule.showPopup('Connection error. Please try again.', 'error');
            } finally {
                isSubmitting = false;
                if (signUpBtn) {
                    signUpBtn.disabled = false;
                    if (window.UIModule) window.UIModule.hideButtonLoading(signUpBtn);
                }
                if (submitTimeout) clearTimeout(submitTimeout);
            }
        });
    }

    function initLogout() {
        let logoutBtn = document.getElementById('logout-btn');
        
        if (!logoutBtn) {
            setTimeout(() => {
                logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) attachLogoutListener(logoutBtn);
            }, 500);
            return;
        }
        
        attachLogoutListener(logoutBtn);
    }
    
    function attachLogoutListener(logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        let isLoggingOut = false;
        
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isLoggingOut) {
                console.log('Logout already in progress, skipping...');
                return;
            }
            
            isLoggingOut = true;
            
            console.log('🔄 Logging out...');
            
            if (window.UIModule) {
                window.UIModule.showPopup('Logging out...', 'info', 1000);
            }
            
            try {
                newLogoutBtn.disabled = true;
                newLogoutBtn.style.opacity = '0.5';
                
                const result = await window.supabaseService.signOut();
                
                if (result.success) {
                    console.log('✅ Logout successful');
                    
                    if (window.UIModule) {
                        window.UIModule.showPopup('👋 Logged out successfully!', 'success', 2000);
                    }
                    
                    // ✅ استخدام الـ compatibility method الموجودة دلوقتي
                    if (window.supabaseService && window.supabaseService.updateUIForUnauthenticatedUser) {
                        window.supabaseService.updateUIForUnauthenticatedUser();
                        console.log('✅ UI updated via compatibility method');
                    } else if (window.supabaseService && window.supabaseService.uiService) {
                        window.supabaseService.uiService.updateUIForUnauthenticatedUser();
                        console.log('✅ UI updated via uiService');
                    } else {
                        // Final fallback
                        console.log('⚠️ No UI update method found, using manual fallback');
                        const signInLink = document.querySelector('.sign-in');
                        const signUpLink = document.querySelector('.sign-up');
                        const slashSpan = document.getElementById('slash');
                        const logoutBtnEl = document.getElementById('logout-btn');
                        const usernameDisplay = document.getElementById('username-display');
                        
                        if (signInLink) signInLink.style.display = 'inline-block';
                        if (signUpLink) signUpLink.style.display = 'inline-block';
                        if (slashSpan) slashSpan.style.display = 'inline-block';
                        if (logoutBtnEl) logoutBtnEl.style.display = 'none';
                        if (usernameDisplay) usernameDisplay.style.display = 'none';
                    }
                    
                    // تحديث السلة في الواجهة فقط
                    if (window.CartModule && window.CartModule.refreshCart) {
                        setTimeout(async () => {
                            await window.CartModule.refreshCart(true);
                            if (window.CartModule.updateBadge) {
                                window.CartModule.updateBadge();
                            }
                        }, 100);
                    }
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    console.error('Logout failed:', result.error);
                    if (window.UIModule) {
                        window.UIModule.showPopup('Error logging out. Please try again.', 'error');
                    }
                    newLogoutBtn.disabled = false;
                    newLogoutBtn.style.opacity = '1';
                }
            } catch (error) {
                console.error('Logout error:', error);
                // ✅ منع ظهور رسالة Connection error لكل خطأ
                if (!error.message?.includes('Connection') && window.UIModule) {
                    window.UIModule.showPopup('Error during logout. Please try again.', 'error');
                }
                newLogoutBtn.disabled = false;
                newLogoutBtn.style.opacity = '1';
            } finally {
                isLoggingOut = false;
            }
        });
    }

    function showFormError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            setTimeout(() => errorDiv?.remove(), 5000);
        }
    }

    function updatePasswordStrength() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        let strengthBar = document.querySelector('.strength-fill');
        let strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar) {
            const container = this.parentElement;
            const strengthHTML = `
                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-fill"></div>
                    </div>
                    <div class="strength-text"></div>
                </div>
            `;
            container.insertAdjacentHTML('afterend', strengthHTML);
            strengthBar = document.querySelector('.strength-fill');
            strengthText = document.querySelector('.strength-text');
        }
        
        if (strengthBar && strengthText) {
            strengthBar.style.width = `${strength.percentage}%`;
            strengthBar.style.backgroundColor = strength.color;
            strengthText.textContent = strength.text;
            strengthText.style.color = strength.color;
        }
    }

    function checkPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        const maxScore = 5;
        let adjustedScore = Math.min(score, maxScore);
        const percentage = (adjustedScore / maxScore) * 100;
        
        let text, color;
        if (adjustedScore <= 1) { text = 'Very Weak'; color = '#f44336'; }
        else if (adjustedScore === 2) { text = 'Weak'; color = '#ff9800'; }
        else if (adjustedScore === 3) { text = 'Medium'; color = '#ffc107'; }
        else if (adjustedScore === 4) { text = 'Strong'; color = '#4caf50'; }
        else { text = 'Very Strong'; color = '#2e7d32'; }
        
        return { score: adjustedScore, percentage, text, color };
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => AuthModule.init());
window.AuthModule = AuthModule;