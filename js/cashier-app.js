import { loadComponent } from "./utils.js";
import { AuthManager } from "./core/auth.js";

async function initCashier() {
  const app = document.getElementById("cashier-app");

  app.innerHTML = `
        <div class="flex min-h-screen">

            <div id="sidebar-container"></div>

            <div class="flex-1 flex flex-col">

                <div id="header-container"></div>

                <main
                    id="page-container"
                    class="flex-1 p-6 bg-gray-50 overflow-auto">
                </main>

            </div>

        </div>

        <div id="modal-container"></div>
    `;

  await Promise.all([
    loadComponent("components/sidebar.html", "sidebar-container"),
    loadComponent("components/header.html", "header-container"),
    loadComponent("components/receipt-modal.html", "modal-container"),
  ]);

  initSidebar();

  await loadPage();

  lucide.createIcons();

  document.getElementById("loader")?.classList.add("hidden");
}

async function loadPage() {
  const params = new URLSearchParams(window.location.search);

  const page = params.get("page") || "dashboard";

  const response = await fetch(`pages/${page}.html`);

  const html = await response.text();

  document.getElementById("page-container").innerHTML = html;

  lucide.createIcons();

  switch (page) {
    case "login":
      import("./cashier/cashier-login.js").then((module) => {
        module.initLogin();
      });
      break;

    case "dashboard": {
      const module = await import("./cashier/cashier-dashboard.js");
      module.initDashboard();
      break;
    }

    case "pos":
      import("./cashier/cashier-pos.js").then((module) => {
        module.initPOS();
      });
      break;

    case "reports":
      import("./cashier/cashier-report.js").then((module) => {
        module.initReports();
      });
      break;

    case "stock": {
      const module = await import("./cashier/cashier-stock.js");

      module.initStock?.();

      break;
    }
  }
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const toggle = document.getElementById("sidebar-toggle");

  if (!sidebar || !overlay || !toggle) return;

  toggle.onclick = () => {
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  };

  overlay.onclick = () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };
  
  window.handleLogout = () => {
    AuthManager.logout();
  };
}

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");

document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");
});

overlay?.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", initCashier);
