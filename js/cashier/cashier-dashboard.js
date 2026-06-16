import { AuthManager } from "../core/auth.js";
import { OrderManager } from "../core/orders.js";
import { formatRp } from "../utils.js";

export function initDashboard() {
  AuthManager.requireAuth();

  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => AuthManager.logout());
  }

  renderDashboard();
}

function renderDashboard() {
  const summary = OrderManager.getSummary();

  const orders = OrderManager.getOrders()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  document.getElementById("stat-total-orders").textContent =
    summary.totalOrders;

  document.getElementById("stat-revenue").textContent = formatRp(
    summary.totalRevenue,
  );

  document.getElementById("stat-pending").textContent = summary.pendingCount;

  const tbody = document.getElementById("recent-orders-body");

  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="p-4 text-center text-gray-500">
                    Belum ada pesanan
                </td>
            </tr>
        `;

    return;
  }

  tbody.innerHTML = orders
    .map((order) => {
      const statusClass =
        order.status === "Completed"
          ? "bg-green-100 text-green-700"
          : order.status === "Pending"
            ? "bg-orange-100 text-orange-700"
            : "bg-red-100 text-red-700";

      return `
                <tr class="hover:bg-gray-50 transition">
                    <td class="p-3 font-mono font-semibold">
                        ${order.id}
                    </td>

                    <td class="p-3">
                        <div class="font-semibold">
                            ${order.customerName}
                        </div>

                        <div class="text-xs text-gray-500">
                            ${new Date(order.date).toLocaleDateString("id-ID")}
                        </div>
                    </td>

                    <td class="p-3 font-bold">
                        ${formatRp(order.total)}
                    </td>

                    <td class="p-3">
                        <span class="px-2 py-1 rounded-full text-xs font-bold ${statusClass}">
                            ${order.status}
                        </span>
                    </td>

                    <td class="p-3">
                        ${
                          order.status === "Pending"
                            ? `
                                <button
                                    data-id="${order.id}"
                                    class="complete-order-btn text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition">
                                    Selesaikan
                                </button>
                              `
                            : `
                                <span class="text-xs text-gray-400">
                                    -
                                </span>
                              `
                        }
                    </td>
                </tr>
            `;
    })
    .join("");

  bindActions();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function bindActions() {
  document.querySelectorAll(".complete-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      if (confirm("Tandai pesanan ini sebagai selesai?")) {
        OrderManager.updateStatus(id, "Completed");

        renderDashboard();
      }
    });
  });
}
