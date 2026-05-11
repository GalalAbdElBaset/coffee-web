/**
 * UI Module - Helper functions for UI interactions
 * @version 2.3.0 - Fixed popup notifications
 */

const UIModule = (function() {
    'use strict';

    const elements = {
        loader: null,
        popup: null,
        themeToggle: null,
        backToTop: null,
        body: null,
        footer: null
    };

    let scrollObserver = null;
    let footerObserver = null;
    let imageObserver = null;
    let stylesAdded = false;

    function init() {
        elements.loader = document.getElementById('coffee-loader');
        elements.popup = document.getElementById('popup-box');
        elements.themeToggle = document.getElementById('theme-toggle');
        elements.backToTop = document.getElementById('backToTop');
        elements.body = document.body;
        elements.footer = document.querySelector('.grand-footer, .footer:not(.grand-footer)');

        initTheme();
        initBackToTop();
        initLoader();
        initSmoothScroll();
        initScrollAnimations();
        initFooterAnimation();
        initLazyLoading();
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('coffee_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (elements.themeToggle) {
                elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        }

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                localStorage.setItem('coffee_theme', isLight ? 'light' : 'dark');
                elements.themeToggle.innerHTML = isLight ? 
                    '<i class="fa-solid fa-sun"></i>' : 
                    '<i class="fa-solid fa-moon"></i>';
                
                elements.themeToggle.classList.add('glow');
                setTimeout(() => {
                    elements.themeToggle.classList.remove('glow');
                }, 420);
            });
        }
    }

    function initBackToTop() {
        if (!elements.backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                elements.backToTop.classList.add('show');
            } else {
                elements.backToTop.classList.remove('show');
            }
        });

        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initLoader() {
        if (!elements.loader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                elements.loader.classList.add('fade-out');
                setTimeout(() => {
                    if (elements.loader) {
                        elements.loader.style.display = 'none';
                    }
                }, 800);
            }, 1000);
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '#!' || targetId === '#!') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.animate-left, .animate-right, .animate-up, .animate-card'
        );
        
        if (animatedElements.length === 0) return;

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            
            if (el.classList.contains('animate-left')) {
                el.style.transform = 'translateX(-50px)';
            } else if (el.classList.contains('animate-right')) {
                el.style.transform = 'translateX(50px)';
            } else if (el.classList.contains('animate-up') || el.classList.contains('animate-card')) {
                el.style.transform = 'translateY(50px)';
            }
            
            el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        });

        if (scrollObserver) scrollObserver.disconnect();
        
        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.style.opacity = '1';
                    el.style.transform = 'translate(0, 0)';
                    el.classList.add('show');
                    scrollObserver.unobserve(el);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animatedElements.forEach(el => scrollObserver.observe(el));
    }

    function initFooterAnimation() {
        const footer = elements.footer;
        
        if (!footer) return;

        if (footer.classList.contains('grand-footer')) {
            footer.style.opacity = '0';
            footer.style.transform = 'translateY(40px)';
            footer.style.transition = 'all 0.9s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            footer.style.transitionProperty = 'opacity, transform';
        } else {
            footer.style.opacity = '0';
            footer.style.transform = 'translateY(20px)';
            footer.style.transition = 'all 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        }

        if (footerObserver) footerObserver.disconnect();
        
        footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footer.style.opacity = '1';
                    footer.style.transform = 'translateY(0)';
                    footer.classList.add('show');
                    
                    if (footer.classList.contains('grand-footer')) {
                        footer.style.transition = 'all 0.9s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
                        const footerItems = footer.querySelectorAll('.box, .social li, .links li');
                        footerItems.forEach((item, index) => {
                            item.style.animation = `footerFadeIn 0.5s ease forwards ${index * 0.05}s`;
                        });
                    }
                    
                    footerObserver.unobserve(footer);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

        footerObserver.observe(footer);
    }

    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if (images.length === 0) return;
        
        if ('IntersectionObserver' in window) {
            if (imageObserver) imageObserver.disconnect();
            
            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, { rootMargin: '100px', threshold: 0.01 });
            
            images.forEach(img => {
                if (!img.hasAttribute('data-observer')) {
                    img.setAttribute('data-observer', 'true');
                    imageObserver.observe(img);
                }
            });
        } else {
            images.forEach(img => {
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
            });
        }
    }

    function triggerAnimation(element, animationType = 'fadeIn') {
        if (!element) return;
        
        const animations = {
            fadeIn: () => {
                element.style.opacity = '1';
                element.style.transform = 'translate(0, 0)';
            },
            slideLeft: () => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            },
            slideRight: () => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            },
            slideUp: () => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        };
        
        const animFunc = animations[animationType] || animations.fadeIn;
        animFunc();
        element.classList.add('show');
    }

    function refreshAnimations() {
        if (scrollObserver) scrollObserver.disconnect();
        if (footerObserver) footerObserver.disconnect();
        
        elements.footer = document.querySelector('.grand-footer, .footer:not(.grand-footer)');
        
        initScrollAnimations();
        initFooterAnimation();
        initLazyLoading();
    }

    function showPopup(message, type = 'success', duration = 3000) {
        console.log('📢 Showing popup:', message, type);
        
        let popup = document.getElementById('popup-box');
        
        if (!popup) {
            createPopup();
            popup = document.getElementById('popup-box');
        }
        
        if (!popup) {
            console.error('Popup element not found!');
            alert(message);
            return;
        }
        
        const popupIcon = document.getElementById('popup-icon');
        const popupMessage = document.getElementById('popup-message');
        const popupClose = document.getElementById('popup-close');
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        if (popupIcon) popupIcon.innerHTML = icons[type] || icons.success;
        if (popupMessage) popupMessage.textContent = message;
        
        popup.classList.remove('success', 'error', 'info', 'warning', 'active');
        popup.classList.add(type);
        
        setTimeout(() => {
            popup.classList.add('active');
        }, 10);
        
        const timeout = setTimeout(() => {
            hidePopup();
        }, duration);
        
        if (popupClose) {
            const newClose = popupClose.cloneNode(true);
            popupClose.parentNode.replaceChild(newClose, popupClose);
            
            newClose.onclick = () => {
                clearTimeout(timeout);
                hidePopup();
            };
        }
    }

    function createPopup() {
        const popupHTML = `
            <div id="popup-box">
                <div class="popup-content">
                    <div id="popup-icon"></div>
                    <p id="popup-message"></p>
                    <button id="popup-close">OK</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    function hidePopup() {
        const popup = document.getElementById('popup-box');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    function showButtonLoading(button, text = 'Loading...') {
        if (!button) return;
        button.disabled = true;
        button.dataset.originalText = button.innerText;
        button.innerText = text;
        button.classList.add('loading');
    }

    function hideButtonLoading(button) {
        if (!button) return;
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerText = button.dataset.originalText;
        }
        button.classList.remove('loading');
    }

    function showGlobalLoader() {
        hideGlobalLoader();
        
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="global-loader-content">
                <div class="loader-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        `;
        
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                .loader-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #b6893f;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .global-loader-content {
                    text-align: center;
                    color: white;
                }
                .global-loader-content p {
                    margin-top: 1rem;
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(style);
        }
        document.body.appendChild(loader);
    }

    function hideGlobalLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.remove();
    }

    function showProtectedPopup() {
        let protectedPopup = document.getElementById('protected-popup');
        
        if (!protectedPopup) {
            const popupHTML = `
                <div id="protected-popup" class="popup-protect hidden">
                    <div class="popup-inner">
                        <i class="fa-solid fa-lock fa-2x"></i>
                        <p>🔒 Please sign in to continue</p>
                        <button id="go-login" class="popup-btn">Sign In</button>
                        <button id="go-signup" class="popup-btn secondary">Create Account</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            protectedPopup = document.getElementById('protected-popup');
            
            const goLogin = document.getElementById('go-login');
            const goSignup = document.getElementById('go-signup');
            
            if (goLogin) {
                goLogin.addEventListener('click', () => {
                    window.location.href = 'sign-in.html';
                });
            }
            
            if (goSignup) {
                goSignup.addEventListener('click', () => {
                    window.location.href = 'sign-up.html';
                });
            }
        }
        
        protectedPopup.classList.remove('hidden');
        protectedPopup.style.animation = 'fadeIn 0.3s ease';
        
        protectedPopup.removeEventListener('click', handleProtectedPopupClick);
        protectedPopup.addEventListener('click', handleProtectedPopupClick);
    }
    
    function handleProtectedPopupClick(e) {
        const protectedPopup = document.getElementById('protected-popup');
        if (e.target === protectedPopup && protectedPopup) {
            protectedPopup.classList.add('hidden');
        }
    }

    function hideProtectedPopup() {
        const protectedPopup = document.getElementById('protected-popup');
        if (protectedPopup) {
            protectedPopup.classList.add('hidden');
        }
    }

    function formatPrice(price) {
        if (typeof price !== 'number' || isNaN(price)) {
            return '0.00 EGP';
        }
        return `${price.toFixed(2)} EGP`;
    }

    function createStarRating(rating) {
        const numRating = typeof rating === 'number' ? rating : 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fa-solid fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="fa-regular fa-star"></i>';
        
        return `<div class="product-rating">${stars}</div>`;
    }

    function debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function addFooterAnimationStyles() {
        if (stylesAdded) return;
        if (document.getElementById('footer-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'footer-animation-styles';
        style.textContent = `
            @keyframes footerFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .grand-footer.show .box,
            .grand-footer.show .social li,
            .grand-footer.show .links li {
                animation: footerFadeIn 0.5s ease forwards;
            }
            .grand-footer { will-change: transform, opacity; }
            .animate-left, .animate-right, .animate-up, .animate-card { will-change: transform, opacity; }
            img[data-src] { opacity: 0; transition: opacity 0.3s ease; }
            img[data-src].loaded { opacity: 1; }
        `;
        document.head.appendChild(style);
        stylesAdded = true;
    }

    addFooterAnimationStyles();

    return {
        init,
        showPopup,
        showButtonLoading,
        hideButtonLoading,
        showGlobalLoader,
        hideGlobalLoader,
        showProtectedPopup,
        hideProtectedPopup,
        formatPrice,
        createStarRating,
        debounce,
        initLazyLoading,
        triggerAnimation,
        refreshAnimations
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    UIModule.init();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        if (UIModule.refreshAnimations) UIModule.refreshAnimations();
    }, 100);
});

window.UIModule = UIModule;