import { AuthManager } from "../core/auth.js";

export function initLogin() {
  // Jika sudah login
  if (localStorage.getItem("ds_admin_session") === "active") {
    window.location.href = "./index-cashier.html?page=dashboard";
    return;
  }

  const form = document.getElementById("login-form");

  if (!form) return;

  form.addEventListener("submit", handleLogin);

  if (window.lucide) {
    lucide.createIcons();
  }
}

function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();

  const password = document.getElementById("password").value.trim();

  const errorMsg = document.getElementById("error-msg");

  if (AuthManager.login(username, password)) {
    window.location.href = "./index-cashier.html?page=dashboard";
    return;
  }

  errorMsg?.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", initLogin);
