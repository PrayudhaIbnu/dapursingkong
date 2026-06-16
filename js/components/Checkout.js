import { cartState } from "./cart.js";
import { generateInvoice, showToast } from "../utils.js";
import { OrderManager } from "../core/orders.js";
import { StockManager } from "../core/products.js";
import { QueueManager } from "../core/queue.js";

export function initCheckout() {
  let selectedPayment = null;

  // ====== Payment Selection ======
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.addEventListener("click", function () {
      document.querySelectorAll(".payment-option").forEach((o) => {
        o.classList.remove("border-orange", "bg-orange/5");
      });

      this.classList.add("border-orange", "bg-orange/5");

      selectedPayment = this.dataset.method;

      const qris = document.getElementById("qris-preview");

      if (selectedPayment === "qris") {
        qris.classList.remove("hidden");
      } else {
        qris.classList.add("hidden");
      }
    });
  });

  // ====== Pay Button ======
  document.getElementById("pay-now-btn")?.addEventListener("click", () => {
    // Validation
    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;

    if (!name || !phone) {
      showToast("Mohon lengkapi data diri terlebih dahulu", "error");
      return;
    }
    if (cartState.items.length === 0) {
      showToast("Keranjang belanja kosong", "error");
      return;
    }
    if (!selectedPayment) {
      showToast("Pilih metode pembayaran", "error");
      return;
    }

    // Process Order
    processOrder(name, phone, selectedPayment);
  });
}

// ====== Process Order (Internal Function) ======
function processOrder(name, phone, payment) {
  const total = cartState.getTotal();

  const date = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Simpan order
  const orderData = {
    customerName: name,
    customerPhone: phone,
    paymentMethod: payment,
    items: [...cartState.items],
    total,
    status: payment === "qris" ? "Completed" : "Pending",
  };

  const savedOrder = OrderManager.addOrder(orderData);

  const queue = QueueManager.addQueue({
    orderId: savedOrder.id,
    customerName: name,
    phone,
    items: [...cartState.items],
    total,
  });

  // Kurangi stok
  cartState.items.forEach((item) => {
    StockManager.updateStock(item.id, -item.qty);
  });

  console.log("✅ Order:", savedOrder);
  console.log("🎫 Queue:", queue);

  // Receipt
  const setText = (id, value) => {
    const el = document.getElementById(id);

    if (el) {
      el.innerText = value;
    } else {
      console.warn(`Element #${id} tidak ditemukan`);
    }
  };

  setText("r-invoice", savedOrder.id);
  setText("r-date", date);
  setText("r-name", name);
  setText("r-method", payment === "cash" ? "Cash (COD)" : "QRIS");
  setText(
    "r-total",
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(total),
  );
  setText("r-queue", queue.number);

  // Nomor antrian
  document.getElementById("r-queue").innerText = queue.number;

  // Detail item
  const itemsEl = document.getElementById("r-items");

  if (itemsEl) {
    itemsEl.innerHTML = cartState.items
      .map(
        (item) => `
        <div class="flex justify-between py-1 border-b border-dashed border-gray-200 last:border-0">
          <span>
            ${item.name}
            <span class="text-xs text-gray-500">
              x${item.qty}
            </span>
          </span>

          <span class="font-semibold">
            ${new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(item.price * item.qty)}
          </span>
        </div>
      `,
      )
      .join("");
  }

  // Status pembayaran
  const statusEl = document.getElementById("r-status");

  if (statusEl) {
    if (payment === "qris") {
      statusEl.className =
        "mt-6 p-3 rounded-lg text-center font-bold text-sm bg-green-100 text-green-700";

      statusEl.innerText = "✅ PEMBAYARAN BERHASIL";
    } else {
      statusEl.className =
        "mt-6 p-3 rounded-lg text-center font-bold text-sm bg-orange-100 text-orange-700";

      statusEl.innerText = "⏳ BAYAR DI TEMPAT (COD)";
    }
  }

  console.log("receipt-modal", document.getElementById("receipt-modal"));
  console.log("r-invoice", document.getElementById("r-invoice"));
  console.log("r-date", document.getElementById("r-date"));
  console.log("r-name", document.getElementById("r-name"));
  console.log("r-method", document.getElementById("r-method"));
  console.log("r-total", document.getElementById("r-total"));
  console.log("r-queue", document.getElementById("r-queue"));
  console.log("r-items", document.getElementById("r-items"));
  console.log("r-status", document.getElementById("r-status"));

  // Tampilkan modal
  const modal = document.getElementById("receipt-modal");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.classList.add("active");

  modal.style.display = "flex";

  // Kosongkan keranjang
  cartState.items = [];
  cartState.save();
  cartState.updateUI();

  // Reset form
  document.getElementById("customer-form")?.reset();

  document.getElementById("receipt-modal").className;

  showToast(
    `Pesanan berhasil dibuat. Nomor antrian ${queue.number}`,
    "success",
  );
}
