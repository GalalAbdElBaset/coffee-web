"use strict";

/**
 * UI Module - Helper functions for UI interactions
 * @version 2.3.0 - Fixed popup notifications
 */
var UIModule = function () {
  'use strict';

  var elements = {
    loader: null,
    popup: null,
    themeToggle: null,
    backToTop: null,
    body: null,
    footer: null
  };
  var scrollObserver = null;
  var footerObserver = null;
  var imageObserver = null;
  var stylesAdded = false;

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
    var savedTheme = localStorage.getItem('coffee_theme');

    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');

      if (elements.themeToggle) {
        elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
      }
    }

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('light-mode');
        var isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('coffee_theme', isLight ? 'light' : 'dark');
        elements.themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        elements.themeToggle.classList.add('glow');
        setTimeout(function () {
          elements.themeToggle.classList.remove('glow');
        }, 420);
      });
    }
  }

  function initBackToTop() {
    if (!elements.backToTop) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        elements.backToTop.classList.add('show');
      } else {
        elements.backToTop.classList.remove('show');
      }
    });
    elements.backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initLoader() {
    if (!elements.loader) return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        elements.loader.classList.add('fade-out');
        setTimeout(function () {
          if (elements.loader) {
            elements.loader.style.display = 'none';
          }
        }, 800);
      }, 1000);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#!' || targetId === '#!') return;
        var target = document.querySelector(targetId);

        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll('.animate-left, .animate-right, .animate-up, .animate-card');
    if (animatedElements.length === 0) return;
    animatedElements.forEach(function (el) {
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
    scrollObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translate(0, 0)';
          el.classList.add('show');
          scrollObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    animatedElements.forEach(function (el) {
      return scrollObserver.observe(el);
    });
  }

  function initFooterAnimation() {
    var footer = elements.footer;
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
    footerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          footer.style.opacity = '1';
          footer.style.transform = 'translateY(0)';
          footer.classList.add('show');

          if (footer.classList.contains('grand-footer')) {
            footer.style.transition = 'all 0.9s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            var footerItems = footer.querySelectorAll('.box, .social li, .links li');
            footerItems.forEach(function (item, index) {
              item.style.animation = "footerFadeIn 0.5s ease forwards ".concat(index * 0.05, "s");
            });
          }

          footerObserver.unobserve(footer);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    footerObserver.observe(footer);
  }

  function initLazyLoading() {
    var images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;

    if ('IntersectionObserver' in window) {
      if (imageObserver) imageObserver.disconnect();
      imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            var src = img.dataset.src;

            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }

            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px',
        threshold: 0.01
      });
      images.forEach(function (img) {
        if (!img.hasAttribute('data-observer')) {
          img.setAttribute('data-observer', 'true');
          imageObserver.observe(img);
        }
      });
    } else {
      images.forEach(function (img) {
        var src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
      });
    }
  }

  function triggerAnimation(element) {
    var animationType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'fadeIn';
    if (!element) return;
    var animations = {
      fadeIn: function fadeIn() {
        element.style.opacity = '1';
        element.style.transform = 'translate(0, 0)';
      },
      slideLeft: function slideLeft() {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      },
      slideRight: function slideRight() {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      },
      slideUp: function slideUp() {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    };
    var animFunc = animations[animationType] || animations.fadeIn;
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

  function showPopup(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
    var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
    console.log('📢 Showing popup:', message, type);
    var popup = document.getElementById('popup-box');

    if (!popup) {
      createPopup();
      popup = document.getElementById('popup-box');
    }

    if (!popup) {
      console.error('Popup element not found!');
      alert(message);
      return;
    }

    var popupIcon = document.getElementById('popup-icon');
    var popupMessage = document.getElementById('popup-message');
    var popupClose = document.getElementById('popup-close');
    var icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    if (popupIcon) popupIcon.innerHTML = icons[type] || icons.success;
    if (popupMessage) popupMessage.textContent = message;
    popup.classList.remove('success', 'error', 'info', 'warning', 'active');
    popup.classList.add(type);
    setTimeout(function () {
      popup.classList.add('active');
    }, 10);
    var timeout = setTimeout(function () {
      hidePopup();
    }, duration);

    if (popupClose) {
      var newClose = popupClose.cloneNode(true);
      popupClose.parentNode.replaceChild(newClose, popupClose);

      newClose.onclick = function () {
        clearTimeout(timeout);
        hidePopup();
      };
    }
  }

  function createPopup() {
    var popupHTML = "\n            <div id=\"popup-box\">\n                <div class=\"popup-content\">\n                    <div id=\"popup-icon\"></div>\n                    <p id=\"popup-message\"></p>\n                    <button id=\"popup-close\">OK</button>\n                </div>\n            </div>\n        ";
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  function hidePopup() {
    var popup = document.getElementById('popup-box');

    if (popup) {
      popup.classList.remove('active');
    }
  }

  function showButtonLoading(button) {
    var text = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Loading...';
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
    var loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = "\n            <div class=\"global-loader-content\">\n                <div class=\"loader-spinner\"></div>\n                <p>Loading...</p>\n            </div>\n        ";
    loader.style.cssText = "\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: rgba(0,0,0,0.8);\n            backdrop-filter: blur(5px);\n            z-index: 10000;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            flex-direction: column;\n        ";

    if (!document.getElementById('spinner-styles')) {
      var style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = "\n                .loader-spinner {\n                    width: 50px;\n                    height: 50px;\n                    border: 3px solid rgba(255,255,255,0.3);\n                    border-radius: 50%;\n                    border-top-color: #b6893f;\n                    animation: spin 1s ease-in-out infinite;\n                }\n                @keyframes spin {\n                    to { transform: rotate(360deg); }\n                }\n                .global-loader-content {\n                    text-align: center;\n                    color: white;\n                }\n                .global-loader-content p {\n                    margin-top: 1rem;\n                    font-size: 1rem;\n                }\n            ";
      document.head.appendChild(style);
    }

    document.body.appendChild(loader);
  }

  function hideGlobalLoader() {
    var loader = document.getElementById('global-loader');
    if (loader) loader.remove();
  }

  function showProtectedPopup() {
    var protectedPopup = document.getElementById('protected-popup');

    if (!protectedPopup) {
      var popupHTML = "\n                <div id=\"protected-popup\" class=\"popup-protect hidden\">\n                    <div class=\"popup-inner\">\n                        <i class=\"fa-solid fa-lock fa-2x\"></i>\n                        <p>\uD83D\uDD12 Please sign in to continue</p>\n                        <button id=\"go-login\" class=\"popup-btn\">Sign In</button>\n                        <button id=\"go-signup\" class=\"popup-btn secondary\">Create Account</button>\n                    </div>\n                </div>\n            ";
      document.body.insertAdjacentHTML('beforeend', popupHTML);
      protectedPopup = document.getElementById('protected-popup');
      var goLogin = document.getElementById('go-login');
      var goSignup = document.getElementById('go-signup');

      if (goLogin) {
        goLogin.addEventListener('click', function () {
          window.location.href = 'sign-in.html';
        });
      }

      if (goSignup) {
        goSignup.addEventListener('click', function () {
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
    var protectedPopup = document.getElementById('protected-popup');

    if (e.target === protectedPopup && protectedPopup) {
      protectedPopup.classList.add('hidden');
    }
  }

  function hideProtectedPopup() {
    var protectedPopup = document.getElementById('protected-popup');

    if (protectedPopup) {
      protectedPopup.classList.add('hidden');
    }
  }

  function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0.00 EGP';
    }

    return "".concat(price.toFixed(2), " EGP");
  }

  function createStarRating(rating) {
    var numRating = typeof rating === 'number' ? rating : 0;
    var fullStars = Math.floor(numRating);
    var hasHalfStar = numRating % 1 >= 0.5;
    var emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    var stars = '';

    for (var i = 0; i < fullStars; i++) {
      stars += '<i class="fa-solid fa-star"></i>';
    }

    if (hasHalfStar) stars += '<i class="fa-solid fa-star-half-alt"></i>';

    for (var _i = 0; _i < emptyStars; _i++) {
      stars += '<i class="fa-regular fa-star"></i>';
    }

    return "<div class=\"product-rating\">".concat(stars, "</div>");
  }

  function debounce(func) {
    var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    var timeout;
    return function executedFunction() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var later = function later() {
        clearTimeout(timeout);
        func.apply(void 0, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function addFooterAnimationStyles() {
    if (stylesAdded) return;
    if (document.getElementById('footer-animation-styles')) return;
    var style = document.createElement('style');
    style.id = 'footer-animation-styles';
    style.textContent = "\n            @keyframes footerFadeIn {\n                from { opacity: 0; transform: translateY(10px); }\n                to { opacity: 1; transform: translateY(0); }\n            }\n            .grand-footer.show .box,\n            .grand-footer.show .social li,\n            .grand-footer.show .links li {\n                animation: footerFadeIn 0.5s ease forwards;\n            }\n            .grand-footer { will-change: transform, opacity; }\n            .animate-left, .animate-right, .animate-up, .animate-card { will-change: transform, opacity; }\n            img[data-src] { opacity: 0; transition: opacity 0.3s ease; }\n            img[data-src].loaded { opacity: 1; }\n        ";
    document.head.appendChild(style);
    stylesAdded = true;
  }

  addFooterAnimationStyles();
  return {
    init: init,
    showPopup: showPopup,
    showButtonLoading: showButtonLoading,
    hideButtonLoading: hideButtonLoading,
    showGlobalLoader: showGlobalLoader,
    hideGlobalLoader: hideGlobalLoader,
    showProtectedPopup: showProtectedPopup,
    hideProtectedPopup: hideProtectedPopup,
    formatPrice: formatPrice,
    createStarRating: createStarRating,
    debounce: debounce,
    initLazyLoading: initLazyLoading,
    triggerAnimation: triggerAnimation,
    refreshAnimations: refreshAnimations
  };
}();

document.addEventListener('DOMContentLoaded', function () {
  UIModule.init();
});
window.addEventListener('load', function () {
  setTimeout(function () {
    if (UIModule.refreshAnimations) UIModule.refreshAnimations();
  }, 100);
});
window.UIModule = UIModule;
//# sourceMappingURL=ui.dev.js.map
