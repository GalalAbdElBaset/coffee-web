"use strict";

/**
 * Main Application Entry Point
 * @version 3.1.0 - مع دعم كامل للسلة في Supabase
 */
(function () {
  'use strict';

  var cartModuleInitialized = false;
  /**
   * Wait for DOM and all modules to be ready
   */

  function initApp() {
    var currentPage;
    return regeneratorRuntime.async(function initApp$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('🚀 Coffee Brand App Initializing...');
            _context.next = 3;
            return regeneratorRuntime.awrap(waitForSupabase());

          case 3:
            currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Initialize cart module ONCE for all pages

            if (!(window.CartModule && !cartModuleInitialized)) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return regeneratorRuntime.awrap(window.CartModule.init());

          case 7:
            cartModuleInitialized = true;

          case 8:
            _context.t0 = currentPage;
            _context.next = _context.t0 === 'index.html' ? 11 : _context.t0 === '' ? 11 : _context.t0 === '/' ? 11 : _context.t0 === 'menu.html' ? 15 : _context.t0 === 'contact.html' ? 19 : _context.t0 === 'services.html' ? 23 : _context.t0 === 'about.html' ? 25 : 26;
            break;

          case 11:
            if (!window.ProductsModule) {
              _context.next = 14;
              break;
            }

            _context.next = 14;
            return regeneratorRuntime.awrap(window.ProductsModule.init());

          case 14:
            return _context.abrupt("break", 26);

          case 15:
            if (!window.ProductsModule) {
              _context.next = 18;
              break;
            }

            _context.next = 18;
            return regeneratorRuntime.awrap(window.ProductsModule.init());

          case 18:
            return _context.abrupt("break", 26);

          case 19:
            if (window.ContactModule) window.ContactModule.init();
            if (window.FaqModule) window.FaqModule.init();
            if (window.StatsModule) window.StatsModule.init();
            return _context.abrupt("break", 26);

          case 23:
            if (window.ServicesModule) window.ServicesModule.init();
            return _context.abrupt("break", 26);

          case 25:
            return _context.abrupt("break", 26);

          case 26:
            if (window.GalleryModule) window.GalleryModule.init();
            initMobileMenu();
            console.log('✅ Coffee Brand App Ready!');

          case 29:
          case "end":
            return _context.stop();
        }
      }
    });
  }
  /**
   * Wait for Supabase service
   */


  function waitForSupabase() {
    return new Promise(function (resolve) {
      if (window.supabaseService) {
        resolve();
      } else {
        var checkInterval = setInterval(function () {
          if (window.supabaseService) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        setTimeout(function () {
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
    var lastCall = 0;
    return function () {
      var now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        func.apply(this, args);
      }
    };
  }
  /**
   * Initialize mobile menu
   */


  function initMobileMenu() {
    var menuBtn = document.getElementById('menu-btn') || document.querySelector('.menu-btn');
    var menuNav = document.getElementById('menu-nav') || document.querySelector('.menu-nav');
    var burger = document.querySelector('.menu-btn__burger');
    var menuOverlay = document.getElementById('menu-overlay');

    if (!menuBtn || !menuNav || !burger || !menuOverlay) {
      console.warn('Mobile menu elements not found');
      return;
    }

    var isMenuOpen = false;

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
      menuNav.addEventListener('click', function (e) {
        var link = e.target.closest('.menu-nav__link');

        if (link && !link.closest('.cart__openBtn')) {
          closeMenu();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen) closeMenu();
    });
    var handleResize = throttle(function () {
      if (window.innerWidth > 1024 && isMenuOpen) closeMenu();
    }, 150);
    window.addEventListener('resize', handleResize);
  } // Start application


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
//# sourceMappingURL=main.dev.js.map
