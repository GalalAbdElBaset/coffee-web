"use strict";

/* ====== Auto-fix & Deep Clean localStorage users ====== */
(function cleanLocalStorage() {
try {
    const data = JSON.parse(localStorage.getItem("users"));
    if (!Array.isArray(data)) {
    localStorage.removeItem("users");
    return;
    }

    const validUsers = [];
    const seenEmails = new Set();

    for (const u of data) {
    if (
        u &&
        typeof u.username === "string" &&
        typeof u.email === "string" &&
        typeof u.password === "string"
    ) {
        if (!seenEmails.has(u.email.trim())) {
        seenEmails.add(u.email.trim());
        validUsers.push({
            email: u.email.trim(),
            username: u.username.trim(),
            password: u.password.trim(),
        });
        }
    }
    }

    localStorage.setItem("users", JSON.stringify(validUsers));
} catch {
    localStorage.removeItem("users");
}
})();

/* ====== Theme Toggle (Light / Dark) ====== */
(function () {
const btn = document.getElementById("theme-toggle");
const body = document.body;
const icon = btn?.querySelector("i");
const saved = localStorage.getItem("theme");

if (!saved || saved === "light") {
    body.classList.add("light-mode");
    icon?.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("theme", "light");
} else {
    body.classList.remove("light-mode");
    icon?.classList.replace("fa-sun", "fa-moon");
}

btn?.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");

    btn.classList.add("glow");
    setTimeout(() => btn.classList.remove("glow"), 420);

    icon?.classList.remove(isLight ? "fa-moon" : "fa-sun");
    icon?.classList.add(isLight ? "fa-sun" : "fa-moon");
    localStorage.setItem("theme", isLight ? "light" : "dark");
});
})();

/* ====== Page Elements ====== */
const loginBtn = document.querySelector("#login-btn");
const signUpBtn = document.querySelector("#sign-up-btn");
const usernameIn = document.querySelector("#userid");
const emailIn = document.querySelector("#emailid");
const passwordIn = document.querySelector("#pswrd");

/* ====== Popup Setup ====== */
const popupBox = document.createElement("div");
popupBox.id = "popup-box";
popupBox.innerHTML = `
<div class="popup-content">
<div id="popup-icon"></div>
<p id="popup-message"></p>
<button id="popup-close">OK</button>
</div>`;
document.body.appendChild(popupBox);

const popupMessage = document.querySelector("#popup-message");
const popupClose = document.querySelector("#popup-close");
const popupIcon = document.querySelector("#popup-icon");

function showPopup(message, type = "success", callback = null) {
popupMessage.textContent = message;
popupBox.className = "active";
popupIcon.className = "";

if (type === "success")
    popupIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i>';
else if (type === "error")
    popupIcon.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #f44336;"></i>';
else if (type === "warning")
    popupIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i>';

const autoClose = setTimeout(() => {
    popupBox.classList.remove("active");
    if (callback) callback();
}, 3000);

popupClose.onclick = () => {
    clearTimeout(autoClose);
    popupBox.classList.remove("active");
    if (callback) callback();
};
}

/* ====== Login (case-sensitive) ====== */
if (loginBtn) {
loginBtn.addEventListener("click", function () {
    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();

    if (!username || !password) {
    showPopup("Please enter your username and password!", "warning");
    return;
    }

    let users = [];
    try {
    const storedUsers = JSON.parse(localStorage.getItem("users"));
    if (Array.isArray(storedUsers)) users = storedUsers;
    } catch {}

    const foundUser = users.find(
    (user) => user.username === username && user.password === password
    );

    if (foundUser) {
    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    showPopup(`Welcome back, ${foundUser.username}!`, "success", () => {
        window.location.href = "index.html";
    });
    } else {
    showPopup("Invalid username or password!", "error");
    }
});
}

/* ====== Sign Up (case-sensitive) ====== */
if (signUpBtn) {
signUpBtn.addEventListener("click", function () {
    const email = emailIn.value.trim();
    const username = usernameIn.value.trim();
    const password = passwordIn.value.trim();

    if (!email || !username || !password) {
    showPopup("Please fill in all fields!", "warning");
    return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
    showPopup("Please enter a valid email address!", "warning");
    return;
    }

    let users = [];
    try {
    const storedUsers = JSON.parse(localStorage.getItem("users"));
    if (Array.isArray(storedUsers)) users = storedUsers;
    } catch {}

    // المقارنة هنا حساسة لحالة الحروف
    const userExists = users.some(
    (user) => user.username === username || user.email === email
    );

    if (userExists) {
    showPopup("This account already exists. Please log in.", "warning", () => {
        window.location.href = "sign-in.html";
    });
    return;
    }

    const newUser = { email, username, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showPopup(`Account created successfully! Welcome, ${username}.`, "success", () => {
    window.location.href = "sign-in.html";
    });
});
}

/* ====== Prevent Back Navigation without Login ====== */
window.addEventListener("pageshow", (e) => {
if (
    e.persisted ||
    performance.getEntriesByType("navigation")[0].type === "back_forward"
) {
    if (!localStorage.getItem("currentUser")) {
    window.location.replace("sign-in.html");
    }
}
});

/* ====== Show/Hide Password ====== */
const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#pswrd");
if (togglePassword && passwordField) {
togglePassword.addEventListener("click", () => {
    const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    togglePassword.classList.toggle("fa-eye-slash");
});
}

/* ====== Hidden Reset Button (Visible only on localhost) ====== */
(function addResetButton() {
const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
if (!isDev) return;

const btn = document.createElement("button");
btn.textContent = "Reset Accounts";
Object.assign(btn.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    padding: "8px 12px",
    background: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    zIndex: "9999",
});
document.body.appendChild(btn);
btn.addEventListener("click", () => {
    localStorage.removeItem("users");
    localStorage.removeItem("currentUser");
    showPopup("All test accounts removed from localStorage.", "success");
});
})();
