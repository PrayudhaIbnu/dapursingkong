// ========================================
// FILE: js/cashier/cashier-reports.js
// ========================================

import { AuthManager } from "../core/auth.js";
import { OrderManager } from "../core/orders.js";
import { formatRp } from "../utils.js";

AuthManager.requireAuth();

export function initReports() {
  bindEvents();
  renderReports();

  console.log("✅ Reports Loaded");
}

function bindEvents() {
  document
    .getElementById("report-search")
    ?.addEventListener("input", renderReports);

  document
    .getElementById("report-date")
    ?.addEventListener("change", renderReports);

  document
    .getElementById("report-payment-filter")
    ?.addEventListener("change", renderReports);

  document
    .getElementById("export-excel")
    ?.addEventListener("click", exportCSV);

  window.addEventListener("storage", (e) => {
    if (e.key === "ds_orders") {
      renderReports();
    }
  });
}

function renderReports() {
  let orders = OrderManager.getOrders();

  const search =
    document
      .getElementById("report-search")
      ?.value.toLowerCase() || "";

  const payment =
    document.getElementById(
      "report-payment-filter"
    )?.value || "";

  const selectedDate =
    document.getElementById(
      "report-date"
    )?.value || "";

  // Search
  if (search) {
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(search) ||
        o.customerName
          ?.toLowerCase()
          .includes(search)
    );
  }

  // Payment Filter
  if (payment) {
    orders = orders.filter(
      (o) => o.paymentMethod === payment
    );
  }

  // Date Filter
  if (selectedDate) {
    orders = orders.filter((o) => {
      const orderDate =
        new Date(o.date)
          .toISOString()
          .split("T")[0];

      return orderDate === selectedDate;
    });
  }

  orders.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );

  renderSummary();
  renderTable(orders);
}

function renderSummary() {
  const orders =
    OrderManager.getOrders();

  const revenue =
    orders.reduce(
      (sum, order) =>
        sum + (order.total || 0),
      0
    );

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayOrders =
    orders.filter((o) => {
      return (
        new Date(o.date)
          .toISOString()
          .split("T")[0] === today
      );
    });

  document.getElementById(
    "report-total-orders"
  ).innerText = orders.length;

  document.getElementById(
    "report-total-revenue"
  ).innerText =
    formatRp(revenue);

  document.getElementById(
    "report-today"
  ).innerText =
    todayOrders.length;
}

function renderTable(orders) {
  const tbody =
    document.getElementById(
      "reports-table-body"
    );

  if (!tbody) return;

  document.getElementById(
    "total-report-data"
  ).innerText =
    `${orders.length} transaksi`;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7"
            class="text-center py-10 text-gray-400">
          Belum ada transaksi
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders
    .map((order) => {
      const badge =
        order.status === "Completed"
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700";

      return `
      <tr class="hover:bg-gray-50">

        <td class="px-6 py-4 font-mono text-sm">
          ${order.id}
        </td>

        <td class="px-6 py-4">
          ${order.customerName || "-"}
        </td>

        <td class="px-6 py-4">
          ${new Date(
            order.date
          ).toLocaleDateString("id-ID")}
        </td>

        <td class="px-6 py-4 capitalize">
          ${order.paymentMethod}
        </td>

        <td class="px-6 py-4 font-semibold">
          ${formatRp(order.total)}
        </td>

        <td class="px-6 py-4">
          <span
            class="px-2 py-1 rounded-full text-xs font-bold ${badge}">
            ${order.status}
          </span>
        </td>

        <td class="px-6 py-4 text-center">
          <button
            onclick="viewOrder('${order.id}')"
            class="text-orange font-semibold hover:underline">
            Detail
          </button>
        </td>

      </tr>
      `;
    })
    .join("");
}

window.viewOrder = (id) => {
  const order =
    OrderManager
      .getOrders()
      .find((o) => o.id === id);

  if (!order) return;

  alert(`
Invoice : ${order.id}

Pelanggan :
${order.customerName}

Metode :
${order.paymentMethod}

Status :
${order.status}

Total :
${formatRp(order.total)}
`);
};

function exportCSV() {
  const orders =
    OrderManager.getOrders();

  let csv =
    "Invoice,Nama,Metode,Total,Status\n";

  orders.forEach((o) => {
    csv += `${o.id},${o.customerName},${o.paymentMethod},${o.total},${o.status}\n`;
  });

  const blob = new Blob(
    [csv],
    { type: "text/csv" }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "laporan.csv";
  a.click();
}