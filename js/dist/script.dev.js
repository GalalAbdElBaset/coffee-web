"use strict";

var loginBtn = document.querySelector("#login-btn");
var signUpBtn = document.querySelector("#sign-up-btn");
var usernameIn = document.querySelector("#userid");
var emailIn = document.querySelector("#emailid");
var usernameOut = document.querySelector("#username-display");
var usernameOutNavBar = document.querySelector(".sign-in");
var signUpNavBar = document.querySelector(".sign-up");
var slashNavBar = document.querySelector("#slash");
var passwordIn = document.querySelector("#pswrd");
var loginForm = document.querySelector("#login-form");
var usernameDisplayNav = document.querySelector("#username-display");
var logoutBtn = document.querySelector("#logout-btn");
var loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
var Storage = {
  setAmount: function setAmount(key, value) {
    localStorage.setItem(key, value);
  },
  removeAmount: function removeAmount(key) {
    localStorage.removeItem(key);
  }
};

if (loggedInUser) {
  if (usernameOutNavBar) usernameOutNavBar.style.display = "none";
  if (signUpNavBar) signUpNavBar.style.display = "none";
  if (slashNavBar) slashNavBar.style.display = "none";

  if (usernameDisplayNav) {
    usernameDisplayNav.textContent = "Hi, ".concat(loggedInUser.username);
    usernameDisplayNav.style.display = "inline-block";
  }

  if (logoutBtn) logoutBtn.style.display = "inline-block";
} else {
  if (usernameDisplayNav) usernameDisplayNav.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "none";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    alert("You have successfully logged out!");
    window.location.href = "sign-in.html";
  });
}

var popupBox = document.createElement("div");
popupBox.id = "popup-box";
popupBox.innerHTML = "\n  <div class=\"popup-content\">\n    <div id=\"popup-icon\"></div>\n    <p id=\"popup-message\"></p>\n    <button id=\"popup-close\">OK</button>\n  </div>\n";
document.body.appendChild(popupBox);
var popupMessage = document.querySelector("#popup-message");
var popupClose = document.querySelector("#popup-close");
var popupIcon = document.querySelector("#popup-icon");

function showPopup(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "success";
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  popupMessage.textContent = message;
  popupBox.className = "active";
  popupIcon.className = "";
  if (type === "success") popupIcon.innerHTML = "✅";else if (type === "error") popupIcon.innerHTML = "❌";else if (type === "warning") popupIcon.innerHTML = "⚠️";
  popupBox.classList.add("active");
  var autoClose = setTimeout(function () {
    popupBox.classList.remove("active");
    if (callback) callback();
  }, 3000);

  popupClose.onclick = function () {
    clearTimeout(autoClose);
    popupBox.classList.remove("active");
    if (callback) callback();
  };
}

if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    var username = usernameIn.value.trim();
    var password = passwordIn.value.trim();

    if (username === "" || password === "") {
      showPopup("Please enter your username and password!", "warning");
      return;
    }

    var users = JSON.parse(localStorage.getItem("users")) || [];
    var foundUser = users.find(function (user) {
      return user.username === username && user.password === password;
    });

    if (foundUser) {
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      showPopup("Welcome back, ".concat(foundUser.username, "!"), "success", function () {
        window.location.href = "index.html";
      });
    } else {
      showPopup("Invalid username or password!", "error");
    }
  });
}

if (signUpBtn) {
  signUpBtn.addEventListener("click", function () {
    var email = emailIn.value.trim();
    var username = usernameIn.value.trim();
    var password = passwordIn.value.trim();

    if (email === "" || username === "" || password === "") {
      showPopup("Please fill in all fields!", "warning");
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showPopup("Please enter a valid email address!", "warning");
      return;
    }

    var users = JSON.parse(localStorage.getItem("users")) || [];
    var userExists = users.some(function (user) {
      return user.username === username || user.email === email;
    });

    if (userExists) {
      showPopup("This account already exists. Please log in.", "warning", function () {
        window.location.href = "sign-in.html";
      });
      return;
    }

    var newUser = {
      email: email,
      username: username,
      password: password
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    showPopup("Account created successfully! Welcome, ".concat(username, "."), "success", function () {
      window.location.href = "sign-in.html";
    });
  });
}

window.addEventListener("pageshow", function (e) {
  if (e.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    if (!localStorage.getItem("currentUser")) {
      window.location.replace("sign-in.html");
    }
  }
});
var togglePassword = document.querySelector("#togglePassword");
var passwordField = document.querySelector("#pswrd");

if (togglePassword && passwordField) {
  togglePassword.addEventListener("click", function () {
    var type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
  });
} // Navbar Mobile


var menuBtn = document.querySelector(".menu-btn");
var hamburger = document.querySelector(".menu-btn__burger");
var nav = document.querySelector(".nav");
var menuNav = document.querySelector(".menu-nav");
var navItems = document.querySelectorAll(".menu-nav__item");
var showMenu = false;
menuBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
  if (!showMenu) {
    hamburger.classList.add("open");
    nav.classList.add("open");
    menuNav.classList.add("open");
    html.classList.add("no-scroll");
    navItems.forEach(function (item) {
      return item.classList.add("open");
    });
    showMenu = true;
  } else {
    hamburger.classList.remove("open");
    nav.classList.remove("open");
    menuNav.classList.remove("open");
    html.classList.remove("no-scroll");
    navItems.forEach(function (item) {
      return item.classList.remove("open");
    });
    showMenu = false;
  }
} // Shopping Cart Open and Close Function


var html = document.querySelector("html");
var cart = document.querySelector(".cart");
var cartOpenBtn = document.querySelector(".cart__openBtn");
var cartCloseBtn = document.querySelector(".cart__closeBtn");
var cartOverlay = document.querySelector(".cart-overlay");
cartOpenBtn.addEventListener("click", function () {
  cart.classList.add("showcart");
  cartOverlay.classList.add("transparentBcg");
  html.classList.add("no-scroll");
});
cartCloseBtn.addEventListener("click", function () {
  cart.classList.remove("showcart");
  cartOverlay.classList.remove("transparentBcg");
  html.classList.remove("no-scroll");
}); // Shopping Cart Adding Items to Cart

var total = document.querySelector(".total");
var totalAmount; // Establish totalAmount in local storage if not there already.

if (!localStorage.getItem("total")) {
  localStorage.setItem("total", "0");
} else {
  totalAmount = parseFloat(localStorage.getItem("total"));
  updateTotal(0);
}
/**
 * Updates total in the local storage and class "total" in the DOM
 * @param {Float} moneyChange
 */


function updateTotal(moneyChange) {
  totalAmount += moneyChange;
  localStorage.setItem("total", totalAmount.toString());

  if (totalAmount > 1) {
    total.innerHTML = "<span class=\"span-primary\">Total Amount:</span> $".concat(totalAmount.toFixed(2));
  } else {
    total.innerHTML = "<br>\n      <br>\n      Your Shopping Cart is empty. <br>\n        Add items to cart by hovering over / tapping on the images of products\n    on the Menu page.";
  }
}
/* Item displays in the DOM */
// Item Display: Item 1: Caffe Americano


var item1Display = document.querySelector(".item1-display");
var item1Counter, item1Amount, up1, down1, remove1;

if (localStorage.getItem("item1")) {
  item1Counter = parseInt(localStorage.getItem("item1"));
} else {
  item1Counter = 0;
} // Item Display: Item 2: Caffe Misto


var item2Display = document.querySelector(".item2-display");
var item2Counter, item2Amount, up2, down2, remove2;

if (localStorage.getItem("item2")) {
  item2Counter = parseInt(localStorage.getItem("item2"));
} else {
  item2Counter = 0;
} // Item Display: Item 3: Blonde Caffe Americano


var item3Display = document.querySelector(".item3-display");
var item3Counter, item3Amount, up3, down3, remove3;

if (localStorage.getItem("item3")) {
  item3Counter = parseInt(localStorage.getItem("item3"));
} else {
  item3Counter = 0;
} // Item Display: Item 4: Blonde Roast


var item4Display = document.querySelector(".item4-display");
var item4Counter, item4Amount, up4, down4, remove4;

if (localStorage.getItem("item4")) {
  item4Counter = parseInt(localStorage.getItem("item4"));
} else {
  item4Counter = 0;
} // Item Display: Item 5: Dark Roast Coffee


var item5Display = document.querySelector(".item5-display");
var item5Counter, item5Amount, up5, down5, remove5;

if (localStorage.getItem("item5")) {
  item5Counter = parseInt(localStorage.getItem("item5"));
} else {
  item5Counter = 0;
} // Item Display: Item 6: Pike Place® Roast


var item6Display = document.querySelector(".item6-display");
var item6Counter, item6Amount, up6, down6, remove6;

if (localStorage.getItem("item6")) {
  item6Counter = parseInt(localStorage.getItem("item6"));
} else {
  item6Counter = 0;
} // Item Display: Item 7: Decaf Pike Place® Roast


var item7Display = document.querySelector(".item7-display");
var item7Counter, item7Amount, up7, down7, remove7;

if (localStorage.getItem("item7")) {
  item7Counter = parseInt(localStorage.getItem("item7"));
} else {
  item7Counter = 0;
} // Item Display: Item 8: Cappuccino


var item8Display = document.querySelector(".item8-display");
var item8Counter, item8Amount, up8, down8, remove8;

if (localStorage.getItem("item8")) {
  item8Counter = parseInt(localStorage.getItem("item8"));
} else {
  item8Counter = 0;
} // Item Display: Item 9: Blonde Cappuccino


var item9Display = document.querySelector(".item9-display");
var item9Counter, item9Amount, up9, down9, remove9;

if (localStorage.getItem("item9")) {
  item9Counter = parseInt(localStorage.getItem("item9"));
} else {
  item9Counter = 0;
} // Item Display: Item 10: Espresso


var item10Display = document.querySelector(".item10-display");
var item10Counter, item10Amount, up10, down10, remove10;

if (localStorage.getItem("item10")) {
  item10Counter = parseInt(localStorage.getItem("item10"));
} else {
  item10Counter = 0;
} // Item Display: Item 11: Espresso Macchiato


var item11Display = document.querySelector(".item11-display");
var item11Counter, item11Amount, up11, down11, remove11;

if (localStorage.getItem("item11")) {
  item11Counter = parseInt(localStorage.getItem("item11"));
} else {
  item11Counter = 0;
} // Item Display: Item 12: Flat White


var item12Display = document.querySelector(".item12-display");
var item12Counter, item12Amount, up12, down12, remove12;

if (localStorage.getItem("item12")) {
  item12Counter = parseInt(localStorage.getItem("item12"));
} else {
  item12Counter = 0;
} // Tests whether or not person is on the Menu page


if (document.querySelector(".one__cart__button")) {
  // Item 1: Caffe Americano
  var item1Button = document.querySelector(".one__cart__button");
  item1Button.addEventListener("click", function () {
    if (!localStorage.getItem("item1")) initializeItem1();
    item1Counter++;
    item1Amount.innerHTML = item1Counter;
    updateTotal(2.1);
    localStorage.setItem("item1", item1Counter);
  }); // Item 2: Caffe Misto

  var item2Button = document.querySelector(".two__cart__button");
  item2Button.addEventListener("click", function () {
    if (!localStorage.getItem("item2")) initializeItem2();
    item2Counter++;
    item2Amount.innerHTML = item2Counter;
    updateTotal(2.6);
    localStorage.setItem("item2", item2Counter);
  }); // Item 3: Blonde Caffe Americano

  var item3Button = document.querySelector(".three__cart__button");
  item3Button.addEventListener("click", function () {
    if (!localStorage.getItem("item3")) initializeItem3();
    item3Counter++;
    item3Amount.innerHTML = item3Counter;
    updateTotal(2.79);
    localStorage.setItem("item3", item3Counter);
  }); // Item 4: Blonde Roast

  var item4Button = document.querySelector(".four__cart__button");
  item4Button.addEventListener("click", function () {
    if (!localStorage.getItem("item4")) initializeItem4();
    item4Counter++;
    item4Amount.innerHTML = item4Counter;
    updateTotal(2.05);
    localStorage.setItem("item4", item4Counter);
  }); // Item 5: Dark Roast Coffee

  var item5Button = document.querySelector(".five__cart__button");
  item5Button.addEventListener("click", function () {
    if (!localStorage.getItem("item5")) initializeItem5();
    item5Counter++;
    item5Amount.innerHTML = item5Counter;
    updateTotal(2.2);
    localStorage.setItem("item5", item5Counter);
  }); // Item 6: Pike Place® Roast

  var item6Button = document.querySelector(".six__cart__button");
  item6Button.addEventListener("click", function () {
    if (!localStorage.getItem("item6")) initializeItem6();
    item6Counter++;
    item6Amount.innerHTML = item6Counter;
    updateTotal(2.8);
    localStorage.setItem("item6", item6Counter);
  }); // Item 7: Decaf Pike Place® Roast

  var item7Button = document.querySelector(".seven__cart__button");
  item7Button.addEventListener("click", function () {
    if (!localStorage.getItem("item7")) initializeItem7();
    item7Counter++;
    item7Amount.innerHTML = item7Counter;
    updateTotal(2.25);
    localStorage.setItem("item7", item7Counter);
  }); // Item 8: Cappuccino

  var item8Button = document.querySelector(".eight__cart__button");
  item8Button.addEventListener("click", function () {
    if (!localStorage.getItem("item8")) initializeItem8();
    item8Counter++;
    item8Amount.innerHTML = item8Counter;
    updateTotal(2.59);
    localStorage.setItem("item8", item8Counter);
  }); // Item 9: Blonde Cappuccino

  var item9Button = document.querySelector(".nine__cart__button");
  item9Button.addEventListener("click", function () {
    if (!localStorage.getItem("item9")) initializeItem9();
    item9Counter++;
    item9Amount.innerHTML = item9Counter;
    updateTotal(2.34);
    localStorage.setItem("item9", item9Counter);
  }); // Item 10: Espresso

  var item10Button = document.querySelector(".ten__cart__button");
  item10Button.addEventListener("click", function () {
    if (!localStorage.getItem("item10")) initializeItem10();
    item10Counter++;
    item10Amount.innerHTML = item10Counter;
    updateTotal(2.89);
    localStorage.setItem("item10", item10Counter);
  }); // Item 11: Espresso Macchiato

  var item11Button = document.querySelector(".eleven__cart__button");
  item11Button.addEventListener("click", function () {
    if (!localStorage.getItem("item11")) initializeItem11();
    item11Counter++;
    item11Amount.innerHTML = item11Counter;
    updateTotal(2.18);
    localStorage.setItem("item11", item11Counter);
  }); // Item 12: Flat White

  var item12Button = document.querySelector(".twelve__cart__button");
  item12Button.addEventListener("click", function () {
    if (!localStorage.getItem("item12")) initializeItem12();
    item12Counter++;
    item12Amount.innerHTML = item12Counter;
    updateTotal(2.75);
    localStorage.setItem("item12", item12Counter);
  });
} // Check if there are items in the local storage


if (checkStorageForCart()) {
  if (localStorage.getItem("item1")) initializeItem1();
  if (localStorage.getItem("item2")) initializeItem2();
  if (localStorage.getItem("item3")) initializeItem3();
  if (localStorage.getItem("item4")) initializeItem4();
  if (localStorage.getItem("item5")) initializeItem5();
  if (localStorage.getItem("item6")) initializeItem6();
  if (localStorage.getItem("item7")) initializeItem7();
  if (localStorage.getItem("item8")) initializeItem8();
  if (localStorage.getItem("item9")) initializeItem9();
  if (localStorage.getItem("item10")) initializeItem10();
  if (localStorage.getItem("item11")) initializeItem11();
  if (localStorage.getItem("item12")) initializeItem12();
}
/**
 * Checks if there is at least one item in the local storage
 */


function checkStorageForCart() {
  if (localStorage.getItem("item1") || localStorage.getItem("item2") || localStorage.getItem("item3") || localStorage.getItem("item4") || localStorage.getItem("item5") || localStorage.getItem("item6") || localStorage.getItem("item7") || localStorage.getItem("item8") || localStorage.getItem("item9") || localStorage.getItem("item10") || localStorage.getItem("item11") || localStorage.getItem("item12")) {
    return true;
  }

  return false;
}
/**
 * Caffe Americano
 */


function initializeItem1() {
  item1Display.innerHTML += "<div class=\"one1-cart-item\">\n  <img src=\"../img/menu/Caff\xE8 Americanoh2.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Caff\xE8</span> Americano</h3>\n      <h4>$2.10</h4>\n      <span class=\"remove-item-1\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item1Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount1\">".concat(item1Counter, "</p>\n      <div class=\"item1Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item1Amount = document.querySelector(".item-amount1");
  up1 = document.querySelector(".item1Up");
  down1 = document.querySelector(".item1Down");
  remove1 = document.querySelector(".remove-item-1");
  up1.addEventListener("click", function () {
    item1Counter++;
    item1Amount.innerHTML = item1Counter;
    updateTotal(2.1);
    Storage.setAmount("item1", item1Counter);
  });
  down1.addEventListener("click", function () {
    item1Counter--;
    item1Amount.innerHTML = item1Counter;
    updateTotal(-2.1);
    Storage.setAmount("item1", item1Counter);

    if (item1Counter === 0) {
      item1Display.innerHTML = "";
      Storage.removeAmount("item1");
    }
  });
  remove1.addEventListener("click", function () {
    item1Display.innerHTML = "";
    updateTotal(-2.1 * item1Counter);
    item1Counter = 0;
    Storage.removeAmount("item1");
  });
}
/**
 * Caffe Misto
 */


function initializeItem2() {
  item2Display.innerHTML += "<div class=\"two2-cart-item\">\n  <img src=\"../img/menu/Caff\xE8 Misto.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Caff\xE8</span> Misto</h3>\n      <h4>$2.60</h4>\n      <span class=\"remove-item-2\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item2Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount2\">".concat(item2Counter, "</p>\n      <div class=\"item2Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item2Amount = document.querySelector(".item-amount2");
  up2 = document.querySelector(".item2Up");
  down2 = document.querySelector(".item2Down");
  remove2 = document.querySelector(".remove-item-2");
  up2.addEventListener("click", function () {
    item2Counter++;
    item2Amount.innerHTML = item2Counter;
    updateTotal(2.6);
    Storage.setAmount("item2", item2Counter);
  });
  down2.addEventListener("click", function () {
    item2Counter--;
    item2Amount.innerHTML = item2Counter;
    updateTotal(-2.6);
    Storage.setAmount("item2", item2Counter);

    if (item2Counter === 0) {
      item2Display.innerHTML = "";
      Storage.removeAmount("item2");
    }
  });
  remove2.addEventListener("click", function () {
    item2Display.innerHTML = "";
    updateTotal(-2.6 * item2Counter);
    item2Counter = 0;
    Storage.removeAmount("item2");
  });
}
/**
 * Blonde Caffe Americano
 */


function initializeItem3() {
  item3Display.innerHTML += "<div class=\"three3-cart-item\">\n  <img src=\"../img/menu/Blonde Caff\xE8 Americano.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Blonde Caff\xE8</span> Americano</h3>\n      <h4>$2.79</h4>\n      <span class=\"remove-item-3\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item3Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount3\">".concat(item3Counter, "</p>\n      <div class=\"item3Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item3Amount = document.querySelector(".item-amount3");
  up3 = document.querySelector(".item3Up");
  down3 = document.querySelector(".item3Down");
  remove3 = document.querySelector(".remove-item-3");
  up3.addEventListener("click", function () {
    item3Counter++;
    item3Amount.innerHTML = item3Counter;
    updateTotal(2.79);
    Storage.setAmount("item3", item3Counter);
  });
  down3.addEventListener("click", function () {
    item3Counter--;
    item3Amount.innerHTML = item3Counter;
    updateTotal(-2.79);
    Storage.setAmount("item3", item3Counter);

    if (item3Counter === 0) {
      item3Display.innerHTML = "";
      Storage.removeAmount("item3");
    }
  });
  remove3.addEventListener("click", function () {
    item3Display.innerHTML = "";
    updateTotal(-2.79 * item3Counter);
    item3Counter = 0;
    Storage.removeAmount("item3");
  });
}
/**
 * Blonde Roast
 */


function initializeItem4() {
  item4Display.innerHTML += "<div class=\"four4-cart-item\">\n  <img src=\"../img/menu/Blonde Roast.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Blonde</span> Roast</h3>\n      <h4>$2.05</h4>\n      <span class=\"remove-item-4\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item4Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount4\">".concat(item4Counter, "</p>\n      <div class=\"item4Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item4Amount = document.querySelector(".item-amount4");
  up4 = document.querySelector(".item4Up");
  down4 = document.querySelector(".item4Down");
  remove4 = document.querySelector(".remove-item-4");
  up4.addEventListener("click", function () {
    item4Counter++;
    item4Amount.innerHTML = item4Counter;
    updateTotal(2.05);
    Storage.setAmount("item4", item4Counter);
  });
  down4.addEventListener("click", function () {
    item4Counter--;
    item4Amount.innerHTML = item4Counter;
    updateTotal(-2.05);
    Storage.setAmount("item4", item4Counter);

    if (item4Counter === 0) {
      item4Display.innerHTML = "";
      Storage.removeAmount("item4");
    }
  });
  remove4.addEventListener("click", function () {
    item4Display.innerHTML = "";
    updateTotal(-2.05 * item4Counter);
    item4Counter = 0;
    Storage.removeAmount("item4");
  });
}
/**
 * Dark Roast Coffee
 */


function initializeItem5() {
  item5Display.innerHTML += "<div class=\"five5-cart-item\">\n  <img src=\"../img/menu/Dark Roast Coffee.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Dark Roast</span> Coffee</h3>\n      <h4>$2.20</h4>\n      <span class=\"remove-item-5\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item5Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount5\">".concat(item5Counter, "</p>\n      <div class=\"item5Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item5Amount = document.querySelector(".item-amount5");
  up5 = document.querySelector(".item5Up");
  down5 = document.querySelector(".item5Down");
  remove5 = document.querySelector(".remove-item-5");
  up5.addEventListener("click", function () {
    item5Counter++;
    item5Amount.innerHTML = item5Counter;
    updateTotal(2.2);
    Storage.setAmount("item5", item5Counter);
  });
  down5.addEventListener("click", function () {
    item5Counter--;
    item5Amount.innerHTML = item5Counter;
    updateTotal(-2.2);
    Storage.setAmount("item5", item5Counter);

    if (item5Counter === 0) {
      item5Display.innerHTML = "";
      Storage.removeAmount("item5");
    }
  });
  remove5.addEventListener("click", function () {
    item5Display.innerHTML = "";
    updateTotal(-2.2 * item5Counter);
    item5Counter = 0;
    Storage.removeAmount("item5");
  });
}
/**
 * Pike Place® Roast
 */


function initializeItem6() {
  item6Display.innerHTML += "<div class=\"six6-cart-item\">\n  <img src=\"../img/menu/Pike Place\xAE Roast.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Pike Place\xAE</span> Roast</h3>\n      <h4>$2.80</h4>\n      <span class=\"remove-item-6\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item6Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount6\">".concat(item6Counter, "</p>\n      <div class=\"item6Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item6Amount = document.querySelector(".item-amount6");
  up6 = document.querySelector(".item6Up");
  down6 = document.querySelector(".item6Down");
  remove6 = document.querySelector(".remove-item-6");
  up6.addEventListener("click", function () {
    item6Counter++;
    item6Amount.innerHTML = item6Counter;
    updateTotal(2.8);
    Storage.setAmount("item6", item6Counter);
  });
  down6.addEventListener("click", function () {
    item6Counter--;
    item6Amount.innerHTML = item6Counter;
    updateTotal(-2.8);
    Storage.setAmount("item6", item6Counter);

    if (item6Counter === 0) {
      item6Display.innerHTML = "";
      Storage.removeAmount("item6");
    }
  });
  remove6.addEventListener("click", function () {
    item6Display.innerHTML = "";
    updateTotal(-2.8 * item6Counter);
    item6Counter = 0;
    Storage.removeAmount("item6");
  });
}
/**
 * Decaf Pike Place® Roast
 */


function initializeItem7() {
  item7Display.innerHTML += "<div class=\"seven7-cart-item\">\n  <img src=\"../img/menu/Decaf Pike Place\xAE Roast.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Decaf Pike </span>Place\xAE Roast</h3>\n      <h4>$2.25</h4>\n      <span class=\"remove-item-7\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item7Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount7\">".concat(item7Counter, "</p>\n      <div class=\"item7Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item7Amount = document.querySelector(".item-amount7");
  up7 = document.querySelector(".item7Up");
  down7 = document.querySelector(".item7Down");
  remove7 = document.querySelector(".remove-item-7");
  up7.addEventListener("click", function () {
    item7Counter++;
    item7Amount.innerHTML = item7Counter;
    updateTotal(2.25);
    Storage.setAmount("item7", item7Counter);
  });
  down7.addEventListener("click", function () {
    item7Counter--;
    item7Amount.innerHTML = item7Counter;
    updateTotal(-2.25);
    Storage.setAmount("item7", item7Counter);

    if (item7Counter === 0) {
      item7Display.innerHTML = "";
      Storage.removeAmount("item7");
    }
  });
  remove7.addEventListener("click", function () {
    item7Display.innerHTML = "";
    updateTotal(-2.25 * item7Counter);
    item7Counter = 0;
    Storage.removeAmount("item7");
  });
}
/**
 * Cappuccino
 */


function initializeItem8() {
  item8Display.innerHTML += "<div class=\"eight8-cart-item\">\n  <img src=\"../img/menu/Cappuccino.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Cappu</span>ccino</h3>\n      <h4>$2.59</h4>\n      <span class=\"remove-item-8\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item8Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount8\">".concat(item8Counter, "</p>\n      <div class=\"item8Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item8Amount = document.querySelector(".item-amount8");
  up8 = document.querySelector(".item8Up");
  down8 = document.querySelector(".item8Down");
  remove8 = document.querySelector(".remove-item-8");
  up8.addEventListener("click", function () {
    item8Counter++;
    item8Amount.innerHTML = item8Counter;
    updateTotal(2.59);
    Storage.setAmount("item8", item8Counter);
  });
  down8.addEventListener("click", function () {
    item8Counter--;
    item8Amount.innerHTML = item8Counter;
    updateTotal(-2.59);
    Storage.setAmount("item8", item8Counter);

    if (item8Counter === 0) {
      item8Display.innerHTML = "";
      Storage.removeAmount("item8");
    }
  });
  remove8.addEventListener("click", function () {
    item8Display.innerHTML = "";
    updateTotal(-2.59 * item8Counter);
    item8Counter = 0;
    Storage.removeAmount("item8");
  });
}
/**
 * Blonde Cappuccino
 */


function initializeItem9() {
  item9Display.innerHTML += "<div class=\"nine9-cart-item\">\n  <img src=\"../img/menu/Blonde-Cappuccino.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Blonde</span> Cappuccino</h3>\n      <h4>$2.34</h4>\n      <span class=\"remove-item-9\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item9Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount9\">".concat(item9Counter, "</p>\n      <div class=\"item9Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item9Amount = document.querySelector(".item-amount9");
  up9 = document.querySelector(".item9Up");
  down9 = document.querySelector(".item9Down");
  remove9 = document.querySelector(".remove-item-9");
  up9.addEventListener("click", function () {
    item9Counter++;
    item9Amount.innerHTML = item9Counter;
    updateTotal(2.34);
    Storage.setAmount("item9", item9Counter);
  });
  down9.addEventListener("click", function () {
    item9Counter--;
    item9Amount.innerHTML = item9Counter;
    updateTotal(-2.34);
    Storage.setAmount("item9", item9Counter);

    if (item9Counter === 0) {
      item9Display.innerHTML = "";
      Storage.removeAmount("item9");
    }
  });
  remove9.addEventListener("click", function () {
    item9Display.innerHTML = "";
    updateTotal(-2.34 * item9Counter);
    item9Counter = 0;
    Storage.removeAmount("item9");
  });
}
/**

 * Espresso
 */


function initializeItem10() {
  item10Display.innerHTML += "<div class=\"ten10-cart-item\">\n  <img src=\"../img/menu/Espresso.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Espr</span>esso</h3>\n      <h4>$2.89</h4>\n      <span class=\"remove-item-10\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item10Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount10\">".concat(item10Counter, "</p>\n      <div class=\"item10Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item10Amount = document.querySelector(".item-amount10");
  up10 = document.querySelector(".item10Up");
  down10 = document.querySelector(".item10Down");
  remove10 = document.querySelector(".remove-item-10");
  up10.addEventListener("click", function () {
    item10Counter++;
    item10Amount.innerHTML = item10Counter;
    updateTotal(2.89);
    Storage.setAmount("item10", item10Counter);
  });
  down10.addEventListener("click", function () {
    item10Counter--;
    item10Amount.innerHTML = item10Counter;
    updateTotal(-2.89);
    Storage.setAmount("item10", item10Counter);

    if (item10Counter === 0) {
      item10Display.innerHTML = "";
      Storage.removeAmount("item10");
    }
  });
  remove10.addEventListener("click", function () {
    item10Display.innerHTML = "";
    updateTotal(-2.89 * item10Counter);
    item10Counter = 0;
    Storage.removeAmount("item10");
  });
}
/**
 * Espresso Macchiato
 */


function initializeItem11() {
  item11Display.innerHTML += "<div class=\"eleven11-cart-item\">\n  <img src=\"../img/menu/Espresso Macchiato.jpg\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Espresso</span> Macchiato</h3>\n      <h4>$2.18</h4>\n      <span class=\"remove-item-11\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item11Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount11\">".concat(item11Counter, "</p>\n      <div class=\"item11Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item11Amount = document.querySelector(".item-amount11");
  up11 = document.querySelector(".item11Up");
  down11 = document.querySelector(".item11Down");
  remove11 = document.querySelector(".remove-item-11");
  up11.addEventListener("click", function () {
    item11Counter++;
    item11Amount.innerHTML = item11Counter;
    updateTotal(2.18);
    Storage.setAmount("item11", item11Counter);
  });
  down11.addEventListener("click", function () {
    item11Counter--;
    item11Amount.innerHTML = item11Counter;
    updateTotal(-2.18);
    Storage.setAmount("item11", item11Counter);

    if (item11Counter === 0) {
      item11Display.innerHTML = "";
      Storage.removeAmount("item11");
    }
  });
  remove11.addEventListener("click", function () {
    item11Display.innerHTML = "";
    updateTotal(-2.18 * item11Counter);
    item11Counter = 0;
    Storage.removeAmount("item11");
  });
}
/**
 * Flat White
 */


function initializeItem12() {
  item12Display.innerHTML += "<div class=\"twelve12-cart-item\">\n  <img src=\"../img/menu/Flat White.webp\" alt=\"product\" />\n    <div>\n      <h3><span class=\"span-primary\">Flat</span> White</h3>\n      <h4>$2.75</h4>\n      <span class=\"remove-item-12\">Remove</span>\n    </div>\n    <div>\n      <div class=\"item12Up\">\n      <i class=\"fas fa-chevron-up\"></i>\n      </div>\n      <p class=\"item-amount12\">".concat(item12Counter, "</p>\n      <div class=\"item12Down\">\n      <i class=\"fas fa-chevron-down\"></i>\n      </div>\n    </div>\n          </div >");
  item12Amount = document.querySelector(".item-amount12");
  up12 = document.querySelector(".item12Up");
  down12 = document.querySelector(".item12Down");
  remove12 = document.querySelector(".remove-item-12");
  up12.addEventListener("click", function () {
    item12Counter++;
    item12Amount.innerHTML = item12Counter;
    updateTotal(2.75);
    Storage.setAmount("item12", item12Counter);
  });
  down12.addEventListener("click", function () {
    item12Counter--;
    item12Amount.innerHTML = item12Counter;
    updateTotal(-2.75);
    Storage.setAmount("item12", item12Counter);

    if (item12Counter === 0) {
      item12Display.innerHTML = "";
      Storage.removeAmount("item12");
    }
  });
  remove12.addEventListener("click", function () {
    item12Display.innerHTML = "";
    updateTotal(-2.75 * item12Counter);
    item12Counter = 0;
    Storage.removeAmount("item12");
  });
} // document.addEventListener("DOMContentLoaded", () => {
//   const cartButtons = document.querySelectorAll('[class*="__cart__button"]');
//   cartButtons.forEach(button => {
//     button.addEventListener("click", e => {
//       const itemBox = e.target.closest(".box");
//       if (!itemBox) return;
//       const name = itemBox.querySelector("h2")?.innerText || "Unknown Item";
//       const priceText = itemBox.querySelector("h3")?.innerText || "$0";
//       const price = parseFloat(priceText.replace("$", ""));
//       let cart = JSON.parse(localStorage.getItem("cart")) || [];
//       const existing = cart.find(p => p.name === name);
//       if (existing) {
//         existing.quantity++;
//       } else {
//         cart.push({ name, price, quantity: 1 });
//       }
//       localStorage.setItem("cart", JSON.stringify(cart));
//       alert(`${name} added to cart!`);
//     });
//   });
// });
// Start backToTopBtn


var backToTopBtn = document.getElementById("backToTop");
window.addEventListener("scroll", function () {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});
backToTopBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}); // End backToTopBtn

(function () {
  var btn = document.getElementById('theme-toggle');
  var body = document.body;
  var saved = localStorage.getItem('theme');

  if (saved === 'light') {
    body.classList.add('light-mode');
    if (btn) btn.textContent = '☀️';
  } else {
    if (btn) btn.textContent = '🌙';
  }

  if (!btn) return;
  btn.addEventListener('click', function () {
    body.classList.toggle('light-mode');
    var isLight = body.classList.contains('light-mode');
    btn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
})();
//# sourceMappingURL=script.dev.js.map
