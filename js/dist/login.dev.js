"use strict"; // Change Mood

(function () {
  var btn = document.getElementById('theme-toggle');
  var body = document.body;
  var icon = btn.querySelector('i');
  var saved = localStorage.getItem('theme');

  if (!saved || saved === 'light') {
    body.classList.add('light-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }

  btn.addEventListener('click', function () {
    body.classList.toggle('light-mode');
    var isLight = body.classList.contains('light-mode');
    btn.classList.add('glow');
    setTimeout(function () {
      return btn.classList.remove('glow');
    }, 420);
    icon.classList.remove(isLight ? 'fa-moon' : 'fa-sun');
    icon.classList.add(isLight ? 'fa-sun' : 'fa-moon');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
})(); // ====== Page elements = =====


var loginBtn = document.querySelector("#login-btn");
var signUpBtn = document.querySelector("#sign-up-btn");
var usernameIn = document.querySelector("#userid");
var emailIn = document.querySelector("#emailid");
var passwordIn = document.querySelector("#pswrd"); // ====== Create a popup window ======

var popupBox = document.createElement("div");
popupBox.id = "popup-box";
popupBox.innerHTML = "\n<div class=\"popup-content\">\n    <div id=\"popup-icon\"></div>\n    <p id=\"popup-message\"></p>\n    <button id=\"popup-close\">OK</button>\n</div>\n";
document.body.appendChild(popupBox);
var popupMessage = document.querySelector("#popup-message");
var popupClose = document.querySelector("#popup-close");
var popupIcon = document.querySelector("#popup-icon"); // ====== Message Display Function ======

function showPopup(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "success";
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  popupMessage.textContent = message;
  popupBox.className = "active";
  popupIcon.className = "";

  if (type === "success") {
    popupIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>';
  } else if (type === "error") {
    popupIcon.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #f44336;"></i>';
  } else if (type === "warning") {
    popupIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i>';
  }

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
} // ====== Sign In ======


if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    var username = usernameIn.value.trim();
    var password = passwordIn.value.trim();

    if (username === "" || password === "") {
      showPopup("Please enter your username and password!", "warning");
      return;
    }

    var users = [];

    try {
      var storedUsers = JSON.parse(localStorage.getItem("users"));

      if (Array.isArray(storedUsers)) {
        users = storedUsers.filter(function (u) {
          return u && u.username && u.password;
        });
      }
    } catch (_unused) {}

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
} // ====== Create a new account (Sign Up) ======


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

    var users = [];

    try {
      var storedUsers = JSON.parse(localStorage.getItem("users"));

      if (Array.isArray(storedUsers)) {
        users = storedUsers.filter(function (u) {
          return u && u.username && u.email && u.password;
        });
      }
    } catch (_unused2) {}

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
} // ====== Protection from reversing without registration ======


window.addEventListener("pageshow", function (e) {
  if (e.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    if (!localStorage.getItem("currentUser")) {
      window.location.replace("sign-in.html");
    }
  }
}); // ====== Show/Hide Password ======

var togglePassword = document.querySelector("#togglePassword");
var passwordField = document.querySelector("#pswrd");

if (togglePassword && passwordField) {
  togglePassword.addEventListener("click", function () {
    var type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
  });
}
//# sourceMappingURL=login.dev.js.map
