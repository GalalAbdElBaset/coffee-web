"use strict";

/**
 * Products Module - Fetch and display products
 * @version 3.1.0 - مع دعم السلة عبر Supabase
 */
var ProductsModule = function () {
  'use strict';

  var allProducts = [];
  var currentFilter = 'all';
  var currentPage = 1;
  var pageSize = 3;
  var menuGrid = null;
  var productViewOverlay = null;
  /**
   * Initialize products module
   */

  function init() {
    return regeneratorRuntime.async(function init$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            menuGrid = document.getElementById('menu-grid');
            productViewOverlay = document.querySelector('.product-view-overlay');

            if (!menuGrid) {
              _context.next = 9;
              break;
            }

            _context.next = 5;
            return regeneratorRuntime.awrap(loadProducts());

          case 5:
            initFilters();
            initProductViewModal();
            initNewsletterForm();
            loadSpecialSections();

          case 9:
            if (!document.querySelector('.menu-container')) {
              _context.next = 12;
              break;
            }

            _context.next = 12;
            return regeneratorRuntime.awrap(loadFeaturedProducts());

          case 12:
          case "end":
            return _context.stop();
        }
      }
    });
  }
  /**
   * Load products from Supabase
   */


  function loadProducts() {
    var result;
    return regeneratorRuntime.async(function loadProducts$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (window.UIModule) window.UIModule.showGlobalLoader();
            _context2.prev = 1;
            _context2.next = 4;
            return regeneratorRuntime.awrap(window.supabaseService.getAll('products', {
              orderBy: {
                column: 'created_at',
                ascending: true
              }
            }));

          case 4:
            result = _context2.sent;

            if (!(result.success && result.data && result.data.length > 0)) {
              _context2.next = 10;
              break;
            }

            allProducts = result.data;
            renderProducts(allProducts);
            _context2.next = 12;
            break;

          case 10:
            _context2.next = 12;
            return regeneratorRuntime.awrap(loadLocalProducts());

          case 12:
            _context2.next = 19;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](1);
            console.error('Error loading products:', _context2.t0);
            _context2.next = 19;
            return regeneratorRuntime.awrap(loadLocalProducts());

          case 19:
            _context2.prev = 19;
            if (window.UIModule) window.UIModule.hideGlobalLoader();
            return _context2.finish(19);

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[1, 14, 19, 22]]);
  }
  /**
   * Load local products (fallback)
   */


  function loadLocalProducts() {
    return regeneratorRuntime.async(function loadLocalProducts$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            allProducts = [{
              id: '1',
              name: 'Caffè Latte',
              price: 4.25,
              image_url: 'img/menu/menu-1.png',
              description: 'Smooth espresso blended with steamed milk.',
              category: 'espresso',
              nutritional_info: {
                calories: 190
              },
              ingredients: ['Espresso', 'Milk'],
              allergens: ['Dairy']
            }, {
              id: '2',
              name: 'Flat White',
              price: 4.75,
              image_url: 'img/menu/menu-2.png',
              description: 'Rich espresso with velvety steamed milk.',
              category: 'espresso',
              nutritional_info: {
                calories: 170
              },
              ingredients: ['Espresso', 'Milk'],
              allergens: ['Dairy']
            }, {
              id: '3',
              name: 'Caffè Mocha',
              price: 5.25,
              image_url: 'img/menu/menu-3.png',
              description: 'Espresso with chocolate and steamed milk.',
              category: 'espresso',
              nutritional_info: {
                calories: 290
              },
              ingredients: ['Espresso', 'Chocolate', 'Milk'],
              allergens: ['Dairy']
            }, {
              id: '4',
              name: 'Blonde Roast',
              price: 3.75,
              image_url: 'img/menu/menu-4.png',
              description: 'Mellow and smooth light roast.',
              category: 'blonde',
              nutritional_info: {
                calories: 5
              },
              ingredients: ['Coffee'],
              allergens: []
            }, {
              id: '5',
              name: 'Dark Roast',
              price: 3.75,
              image_url: 'img/menu/menu-5.png',
              description: 'Bold and rich dark roast.',
              category: 'dark',
              nutritional_info: {
                calories: 5
              },
              ingredients: ['Coffee'],
              allergens: []
            }, {
              id: '6',
              name: 'Decaf Pike Place',
              price: 3.75,
              image_url: 'img/menu/menu-6.png',
              description: 'Smooth decaf coffee.',
              category: 'decaf',
              nutritional_info: {
                calories: 5
              },
              ingredients: ['Decaf Coffee'],
              allergens: []
            }, {
              id: '7',
              name: 'Caramel Macchiato',
              price: 5.50,
              image_url: 'img/menu/menu-1.png',
              description: 'Vanilla syrup with espresso and caramel.',
              category: 'espresso',
              nutritional_info: {
                calories: 250
              },
              ingredients: ['Espresso', 'Milk', 'Caramel'],
              allergens: ['Dairy']
            }, {
              id: '8',
              name: 'Vanilla Latte',
              price: 5.25,
              image_url: 'img/menu/menu-2.png',
              description: 'Espresso with vanilla and steamed milk.',
              category: 'espresso',
              nutritional_info: {
                calories: 220
              },
              ingredients: ['Espresso', 'Milk', 'Vanilla'],
              allergens: ['Dairy']
            }];
            renderProducts(allProducts);

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    });
  }
  /**
   * Render products to grid
   */


  function renderProducts(products) {
    if (!menuGrid) return;
    var filteredProducts = currentFilter === 'all' ? products : products.filter(function (product) {
      return product.category === currentFilter;
    });

    if (filteredProducts.length === 0) {
      menuGrid.innerHTML = "<div class=\"no-products\"><i class=\"fa-solid fa-mug-hot\"></i><p>No products found in \"".concat(currentFilter, "\" category</p></div>");
      var existingPagination = document.getElementById('pagination');
      if (existingPagination) existingPagination.remove();
      return;
    }

    var start = (currentPage - 1) * pageSize;
    var paginatedItems = filteredProducts.slice(start, start + pageSize);
    menuGrid.innerHTML = paginatedItems.map(function (product) {
      return "\n            <div class=\"box\" data-product-id=\"".concat(product.id, "\">\n                <div class=\"img-container\">\n                    <img data-src=\"").concat(escapeHtml(product.image_url), "\" alt=\"").concat(escapeHtml(product.name), "\" loading=\"lazy\">\n                    <div class=\"box__btns\">\n                        <button class=\"box__btn view-product\" data-id=\"").concat(product.id, "\">\n                            <i class=\"fa-regular fa-eye\"></i> View\n                        </button>\n                        <button class=\"box__btn add-to-cart\" data-id=\"").concat(product.id, "\">\n                            <i class=\"fa-solid fa-cart-plus\"></i> Add\n                        </button>\n                    </div>\n                </div>\n                <h2>").concat(escapeHtml(product.name), "</h2>\n                <h3>").concat(formatPrice(product.price), "</h3>\n            </div>\n        ");
    }).join('');

    if (window.UIModule && window.UIModule.initLazyLoading) {
      window.UIModule.initLazyLoading();
    }

    renderPagination(filteredProducts); // ✅ إضافة المستمعين لأزرار الإضافة إلى السلة

    attachAddToCartListeners();
  }
  /**
   * Attach add to cart event listeners
   */


  function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(function (btn) {
      btn.removeEventListener('click', handleAddToCart);
      btn.addEventListener('click', handleAddToCart);
    });
  }
  /**
   * Handle add to cart click
   */


  function handleAddToCart(e) {
    var productId;
    return regeneratorRuntime.async(function handleAddToCart$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            e.preventDefault();
            productId = e.currentTarget.dataset.id;

            if (!(productId && window.CartModule)) {
              _context4.next = 5;
              break;
            }

            _context4.next = 5;
            return regeneratorRuntime.awrap(window.CartModule.addToCart(productId));

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    });
  }
  /**
   * Format price
   */


  function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
      return '0.00 EGP';
    }

    return "".concat(price.toFixed(2), " EGP");
  }
  /**
   * Render pagination
   */


  function renderPagination(products) {
    var totalPages = Math.ceil(products.length / pageSize);

    if (totalPages <= 1) {
      var existingPagination = document.getElementById('pagination');
      if (existingPagination) existingPagination.remove();
      return;
    }

    var paginationContainer = document.getElementById('pagination');

    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'pagination';
      paginationContainer.className = 'pagination-container';

      if (menuGrid && menuGrid.parentNode) {
        menuGrid.insertAdjacentElement('afterend', paginationContainer);
      }
    }

    var paginationHTML = "\n            <button class=\"pagination-btn prev-btn\" data-action=\"prev\" ".concat(currentPage === 1 ? 'disabled' : '', ">\n                <i class=\"fa-solid fa-chevron-left\"></i> Prev\n            </button>\n        ");

    for (var i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i >= currentPage - 1 && i <= currentPage + 1) {
        paginationHTML += "<button class=\"pagination-btn page-btn ".concat(i === currentPage ? 'active' : '', "\" data-page=\"").concat(i, "\">").concat(i, "</button>");
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += "<span class=\"pagination-dots\">...</span>";
      }
    }

    paginationHTML += "\n            <button class=\"pagination-btn next-btn\" data-action=\"next\" ".concat(currentPage === totalPages ? 'disabled' : '', ">\n                Next <i class=\"fa-solid fa-chevron-right\"></i>\n            </button>\n        ");
    paginationContainer.innerHTML = paginationHTML;
    paginationContainer.querySelectorAll('.pagination-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
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
  /**
   * Initialize filter buttons
   */


  function initFilters() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          return b.classList.remove('active');
        });
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        renderProducts(allProducts);
      });
    });
  }
  /**
   * Initialize product view modal
   */


  function initProductViewModal() {
    document.addEventListener('click', function _callee(e) {
      var viewBtn;
      return regeneratorRuntime.async(function _callee$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              viewBtn = e.target.closest('.view-product');

              if (!(viewBtn && viewBtn.dataset.id)) {
                _context5.next = 5;
                break;
              }

              e.preventDefault();
              _context5.next = 5;
              return regeneratorRuntime.awrap(showProductDetails(viewBtn.dataset.id));

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      });
    });

    if (productViewOverlay) {
      var closeBtn = productViewOverlay.querySelector('.product-view__closeBtn');

      if (closeBtn) {
        closeBtn.onclick = function () {
          return productViewOverlay.classList.remove('active');
        };
      }

      productViewOverlay.onclick = function (e) {
        if (e.target === productViewOverlay) {
          productViewOverlay.classList.remove('active');
        }
      };

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && productViewOverlay.classList.contains('active')) {
          productViewOverlay.classList.remove('active');
        }
      });
    }
  }
  /**
   * Show product details in modal
   */


  function showProductDetails(productId) {
    var product, productViewContent, addToCartBtn;
    return regeneratorRuntime.async(function showProductDetails$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            product = allProducts.find(function (p) {
              return p.id === productId;
            });

            if (product) {
              _context7.next = 3;
              break;
            }

            return _context7.abrupt("return");

          case 3:
            productViewContent = document.querySelector('.product-view-content');

            if (productViewContent) {
              _context7.next = 6;
              break;
            }

            return _context7.abrupt("return");

          case 6:
            productViewContent.innerHTML = "\n            <h2>".concat(escapeHtml(product.name), "</h2>\n            <img data-src=\"").concat(escapeHtml(product.image_url), "\" alt=\"").concat(escapeHtml(product.name), "\">\n            <p class=\"description\">").concat(escapeHtml(product.description), "</p>\n            <h3 style=\"color: var(--primary-color, #b6893f); text-align: center;\">").concat(formatPrice(product.price), "</h3>\n            ").concat(product.nutritional_info ? "<div class=\"nutritional_info\"><div class=\"bar-large\">Nutritional Information</div><div class=\"bar-medium\"><span>\uD83D\uDD25 Calories</span><span>".concat(product.nutritional_info.calories || 0, "</span></div></div>") : '', "\n            ").concat(product.ingredients ? "<div class=\"ingredients\"><h2>\uD83C\uDF31 Ingredients</h2><p>".concat(escapeHtml(product.ingredients.join(', ')), "</p></div>") : '', "\n            ").concat(product.allergens ? "<div class=\"allergens\"><h2>\u26A0\uFE0F Allergens</h2><p>Contains: ".concat(escapeHtml(product.allergens.join(', ')), "</p></div>") : '', "\n            <div style=\"display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;\">\n                <button class=\"box__btn add-to-cart-modal\" data-id=\"").concat(product.id, "\">\n                    <i class=\"fa-solid fa-cart-plus\"></i> Add to Cart\n                </button>\n            </div>\n        ");

            if (window.UIModule && window.UIModule.initLazyLoading) {
              window.UIModule.initLazyLoading();
            }

            addToCartBtn = productViewContent.querySelector('.add-to-cart-modal');

            if (addToCartBtn && window.CartModule) {
              addToCartBtn.onclick = function _callee2() {
                return regeneratorRuntime.async(function _callee2$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return regeneratorRuntime.awrap(window.CartModule.addToCart(productId));

                      case 2:
                        productViewOverlay.classList.remove('active');

                      case 3:
                      case "end":
                        return _context6.stop();
                    }
                  }
                });
              };
            }

            if (productViewOverlay) {
              productViewOverlay.classList.add('active');
            }

          case 11:
          case "end":
            return _context7.stop();
        }
      }
    });
  }
  /**
   * Initialize newsletter form
   */


  function initNewsletterForm() {
    var newsletterForm = document.getElementById('menu-newsletter-form');

    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = newsletterForm.querySelector('input[type="email"]').value;

        if (email && window.UIModule) {
          window.UIModule.showPopup('🎉 Thanks for subscribing! 15% off coupon sent to your email!', 'success');
          newsletterForm.reset();
        }
      });
    }
  }
  /**
   * Load special sections
   */


  function loadSpecialSections() {
    if (allProducts.length > 0) {
      var coffeeProducts = allProducts.filter(function (p) {
        return ['espresso', 'blonde', 'dark', 'decaf'].includes(p.category);
      }).slice(0, 3);
      var coffeeGrid = document.getElementById('special-coffee-grid');

      if (coffeeGrid && coffeeProducts.length) {
        coffeeGrid.innerHTML = coffeeProducts.map(function (product) {
          return "\n                    <div class=\"special-card\">\n                        <div class=\"special-card-img\">\n                            <img src=\"".concat(product.image_url, "\" alt=\"").concat(product.name, "\">\n                            <div class=\"special-card-overlay\">\n                                <button class=\"special-order-btn\" data-id=\"").concat(product.id, "\">Order Now</button>\n                            </div>\n                        </div>\n                        <h3>").concat(escapeHtml(product.name), "</h3>\n                        <p>").concat(escapeHtml(product.description.substring(0, 80)), "...</p>\n                        <div class=\"special-price\">").concat(formatPrice(product.price), "</div>\n                    </div>\n                ");
        }).join('');
        document.querySelectorAll('.special-order-btn').forEach(function (btn) {
          btn.addEventListener('click', function _callee3() {
            return regeneratorRuntime.async(function _callee3$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    if (!window.CartModule) {
                      _context8.next = 3;
                      break;
                    }

                    _context8.next = 3;
                    return regeneratorRuntime.awrap(window.CartModule.addToCart(btn.dataset.id));

                  case 3:
                  case "end":
                    return _context8.stop();
                }
              }
            });
          });
        });
      }

      var dessertProducts = allProducts.slice(3, 6);
      var dessertGrid = document.getElementById('special-dessert-grid');

      if (dessertGrid && dessertProducts.length) {
        dessertGrid.innerHTML = dessertProducts.map(function (product) {
          return "\n                    <div class=\"special-card\">\n                        <div class=\"special-card-img\">\n                            <img src=\"".concat(product.image_url, "\" alt=\"").concat(product.name, "\">\n                            <div class=\"special-card-overlay\">\n                                <button class=\"special-order-btn\" data-id=\"").concat(product.id, "\">Order Now</button>\n                            </div>\n                        </div>\n                        <h3>").concat(escapeHtml(product.name), "</h3>\n                        <p>").concat(escapeHtml(product.description.substring(0, 80)), "...</p>\n                        <div class=\"special-price\">").concat(formatPrice(product.price), "</div>\n                    </div>\n                ");
        }).join('');
        document.querySelectorAll('.special-order-btn').forEach(function (btn) {
          btn.addEventListener('click', function _callee4() {
            return regeneratorRuntime.async(function _callee4$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    if (!window.CartModule) {
                      _context9.next = 3;
                      break;
                    }

                    _context9.next = 3;
                    return regeneratorRuntime.awrap(window.CartModule.addToCart(btn.dataset.id));

                  case 3:
                  case "end":
                    return _context9.stop();
                }
              }
            });
          });
        });
      }
    }
  }
  /**
   * Load featured products for homepage
   */


  function loadFeaturedProducts() {
    var featuredProducts, menuContainer;
    return regeneratorRuntime.async(function loadFeaturedProducts$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            featuredProducts = allProducts.slice(0, 3);
            menuContainer = document.querySelector('.menu-container');

            if (menuContainer && featuredProducts.length) {
              menuContainer.innerHTML = featuredProducts.map(function (product) {
                return "\n                <div class=\"menu-card animate-card\">\n                    <img data-src=\"".concat(escapeHtml(product.image_url), "\" alt=\"").concat(escapeHtml(product.name), "\" loading=\"lazy\">\n                    <h3>").concat(escapeHtml(product.name), "</h3>\n                    <p>").concat(escapeHtml(product.description.substring(0, 80)), "...</p>\n                    <div class=\"menu-card-price\">").concat(formatPrice(product.price), "</div>\n                    <button class=\"btn-order add-to-cart-featured\" data-id=\"").concat(product.id, "\">Add to Cart</button>\n                </div>\n            ");
              }).join('');

              if (window.UIModule && window.UIModule.initLazyLoading) {
                window.UIModule.initLazyLoading();
              }

              document.querySelectorAll('.add-to-cart-featured').forEach(function (btn) {
                btn.addEventListener('click', function _callee5() {
                  return regeneratorRuntime.async(function _callee5$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          if (!window.CartModule) {
                            _context10.next = 3;
                            break;
                          }

                          _context10.next = 3;
                          return regeneratorRuntime.awrap(window.CartModule.addToCart(btn.dataset.id));

                        case 3:
                        case "end":
                          return _context10.stop();
                      }
                    }
                  });
                });
              });
            }

          case 3:
          case "end":
            return _context11.stop();
        }
      }
    });
  }
  /**
   * Get product by ID
   */


  function getProductById(id) {
    return allProducts.find(function (p) {
      return p.id === id;
    });
  }
  /**
   * Escape HTML
   */


  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  } // Public API


  return {
    init: init,
    getAllProducts: function getAllProducts() {
      return allProducts;
    },
    getProductById: getProductById,
    loadSpecialSections: loadSpecialSections
  };
}(); // Initialize on DOM load


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    return ProductsModule.init();
  });
} else {
  ProductsModule.init();
}

window.ProductsModule = ProductsModule;
//# sourceMappingURL=products.dev.js.map
