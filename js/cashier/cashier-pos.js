// ========================================
// FILE: js/cashier/cashier-pos.js
// ========================================

import { AuthManager } from "../core/auth.js";
import { OrderManager } from "../core/orders.js";
import { StockManager, CATEGORIES } from "../core/products.js";
import { formatRp } from "../utils.js";

let cart = [];
let selectedCategory = "all";
let selectedPayment = "cash";

export function initPOS() {
  AuthManager.requireAuth();

  renderCategories();
  renderProducts();
  renderCart();

  bindEvents();

  console.log("✅ POS Loaded");
}

// ========================================
// EVENTS
// ========================================

function bindEvents() {
  document
    .getElementById("pos-search")
    ?.addEventListener("input", renderProducts);

  document
    .getElementById("pos-checkout-btn")
    ?.addEventListener("click", checkout);

  document
    .getElementById("close-receipt")
    ?.addEventListener("click", closeReceipt);

  document
    .getElementById("new-order")
    ?.addEventListener("click", closeReceipt);

  document.querySelectorAll(".pos-payment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pos-payment-btn").forEach((b) => {
        b.classList.remove(
          "ring-2",
          "ring-orange",
          "bg-orange/10"
        );
      });

      btn.classList.add(
        "ring-2",
        "ring-orange",
        "bg-orange/10"
      );

      selectedPayment = btn.dataset.method;
    });
  });
}

// ========================================
// CATEGORY
// ========================================

function renderCategories() {
  const container =
    document.getElementById("category-filters");

  if (!container) return;

  container.innerHTML = CATEGORIES.map(
    (cat) => `
      <button
        onclick="window.selectCategory('${cat.id}')"
        class="
          px-4 py-2 rounded-xl text-sm font-medium transition
          ${
            selectedCategory === cat.id
              ? "bg-darkbrown text-white"
              : "bg-white border border-gray-200"
          }
        "
      >
        ${cat.name}
      </button>
    `
  ).join("");
}

window.selectCategory = (id) => {
  selectedCategory = id;

  renderCategories();
  renderProducts();
};

// ========================================
// PRODUCTS
// ========================================

function renderProducts() {
  const grid =
    document.getElementById("pos-product-grid");

  if (!grid) return;

  const keyword =
    document
      .getElementById("pos-search")
      ?.value?.toLowerCase() || "";

  let products = StockManager.getProducts();

  products = products.filter(
    (p) => p.stock > 0
  );

  if (selectedCategory !== "all") {
    products = products.filter(
      (p) => p.category === selectedCategory
    );
  }

  if (keyword) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );
  }

  if (!products.length) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-gray-400">
        Produk tidak ditemukan
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <div
        onclick="window.addToCart(${product.id})"
        class="
          bg-white rounded-2xl border
          overflow-hidden cursor-pointer
          hover:shadow-lg transition
        "
      >
        <img
          src="${product.image}"
          class="w-full h-40 object-cover"
        />

        <div class="p-4">

          <h3 class="font-semibold">
            ${product.name}
          </h3>

          <p class="text-orange font-bold mt-1">
            ${formatRp(product.price)}
          </p>

          <p class="text-xs text-gray-500 mt-2">
            Stok:
            ${product.stock}
            ${product.unit}
          </p>

        </div>
      </div>
    `
    )
    .join("");
}

// ========================================
// CART
// ========================================

window.addToCart = (id) => {
  const product =
    StockManager.getProductById(id);

  if (!product) return;

  const item = cart.find(
    (i) => i.id === id
  );

  if (item) {
  if (item.qty >= product.stock) {
    alert(
      `Stok ${product.name} hanya ${product.stock}`
    );
    return;
  }

  item.qty++;
  } else {
    cart.push({
      ...product,
      qty: 1,
    });
  }

  renderCart();
};

window.updateCartQty = (id, change) => {
  const item = cart.find(
    (i) => i.id === id
  );

  if (!item) return;

  const product =
    StockManager.getProductById(id);

  if (
    change > 0 &&
    item.qty >= product.stock
  ) {
    alert(
      `Stok ${product.name} hanya ${product.stock}`
    );
    return;
  }

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(
      (i) => i.id !== id
    );
  }

  renderCart();
};

function renderCart() {
  const container =
    document.getElementById("pos-cart-items");

  const totalEl =
    document.getElementById("pos-total");

  if (!container || !totalEl) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="text-center py-10 text-gray-400">
        Keranjang kosong
      </div>
    `;

    totalEl.innerText = formatRp(0);

    return;
  }

  let total = 0;

  container.innerHTML = cart
    .map((item) => {
      const subtotal =
        item.qty * item.price;

      total += subtotal;

      return `
        <div class="bg-gray-50 rounded-xl p-3">

          <div class="font-medium">
            ${item.name}
          </div>

          <div class="text-sm text-orange">
            ${formatRp(item.price)}
          </div>

          <div class="flex justify-between mt-3">

            <div class="flex gap-3 items-center">

              <button
                onclick="updateCartQty(${item.id},-1)"
                class="w-7 h-7 rounded bg-white border"
              >
                -
              </button>

              <span>
                ${item.qty}
              </span>

              <button
                onclick="updateCartQty(${item.id},1)"
                class="w-7 h-7 rounded bg-white border"
              >
                +
              </button>

            </div>

            <div class="font-semibold">
              ${formatRp(subtotal)}
            </div>

          </div>

        </div>
      `;
    })
    .join("");

  totalEl.innerText = formatRp(total);
}

// ========================================
// CHECKOUT
// ========================================

function checkout() {
  if (!cart.length) {
    alert("Keranjang masih kosong");
    return;
  }

  if (!validateStock()) {
    return;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  // Kurangi stok
  cart.forEach((item) => {
    StockManager.updateStock(
      item.id,
      -item.qty
    );
  });

  const order =
    OrderManager.addOrder({
      customerName:
        document.getElementById(
          "pos-customer-name"
        )?.value || "Walk In",

      paymentMethod:
        selectedPayment,

      items: [...cart],

      total,

      status:
        selectedPayment === "qris"
          ? "Completed"
          : "Pending",
    });

  showReceipt(order);

  cart = [];

  renderCart();

  // refresh produk agar stok terbaru tampil
  renderProducts();
}

function validateStock() {
  for (const item of cart) {
    const product =
      StockManager.getProductById(item.id);

    if (!product) {
      alert(`${item.name} tidak ditemukan`);
      return false;
    }

    if (product.stock < item.qty) {
      alert(
        `Stok ${item.name} hanya tersisa ${product.stock}`
      );
      return false;
    }
  }

  return true;
}

// ========================================
// RECEIPT
// ========================================

function showReceipt(order) {
  const modal =
    document.getElementById(
      "receipt-modal"
    );

  if (!modal) {
    console.error(
      "receipt-modal tidak ditemukan"
    );
    return;
  }

  modal.classList.remove("hidden");

  document.getElementById(
    "r-invoice"
  )?.replaceChildren(
    document.createTextNode(order.id)
  );

  document.getElementById(
    "r-total"
  )?.replaceChildren(
    document.createTextNode(
      formatRp(order.total)
    )
  );

  document.getElementById(
    "r-name"
  )?.replaceChildren(
    document.createTextNode(
      order.customerName
    )
  );

  document.getElementById(
    "r-method"
  )?.replaceChildren(
    document.createTextNode(
      order.paymentMethod.toUpperCase()
    )
  );

  const itemsEl =
    document.getElementById("r-items");

  if (itemsEl) {
    itemsEl.innerHTML = order.items
      .map(
        (item) => `
        <div class="flex justify-between text-sm py-1">
          <span>
            ${item.name} x${item.qty}
          </span>
          <span>
            ${formatRp(
              item.price * item.qty
            )}
          </span>
        </div>
      `
      )
      .join("");
  }
}

function closeReceipt() {
  document
    .getElementById("receipt-modal")
    ?.classList.add("hidden");
}