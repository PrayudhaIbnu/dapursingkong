// ========================================
// FILE: js/cashier/cashier-stock.js
// ========================================

import { AuthManager } from "../core/auth.js";
import { StockManager } from "../core/products.js";
import { formatRp } from "../utils.js";

let selectedProductId = null;

AuthManager.requireAuth();

export function initStock() {
  bindEvents();

  renderStock();

  console.log("✅ Stock Loaded");
}

function bindEvents() {
  document
    .getElementById("stock-search")
    ?.addEventListener("input", renderStock);

  document
    .getElementById("close-stock-btn")
    ?.addEventListener("click", closeStockModal);

  document
    .getElementById("save-stock-btn")
    ?.addEventListener("click", saveStock);

  document
    .getElementById("add-product-btn")
    ?.addEventListener("click", openModal);

  document
    .getElementById("close-product-modal")
    ?.addEventListener("click", closeModal);

  document
    .getElementById("save-product")
    ?.addEventListener("click", saveProduct);

  window.addEventListener("storage", (e) => {
    if (e.key === "ds_products") {
      renderStock();
    }
  });
}

function renderStock() {
  let products = StockManager.getProducts();

  const keyword =
    document.getElementById("stock-search")?.value?.toLowerCase() || "";

  if (keyword) {
    products = products.filter((product) =>
      product.name.toLowerCase().includes(keyword),
    );
  }

  renderSummary(products);

  renderTable(products);
}

function renderSummary(products) {
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );

  const lowStock = products.filter(
    (product) => Number(product.stock) <= Number(product.minStock || 5),
  ).length;

  const totalProductsEl = document.getElementById("total-products");

  const totalStockEl = document.getElementById("total-stock");

  const lowStockEl = document.getElementById("low-stock-count");

  if (totalProductsEl) {
    totalProductsEl.innerText = totalProducts;
  }

  if (totalStockEl) {
    totalStockEl.innerText = totalStock;
  }

  if (lowStockEl) {
    lowStockEl.innerText = lowStock;
  }
}

function renderTable(products) {
  const tbody = document.getElementById("stock-table-body");

  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center py-10 text-gray-400"
                >
                    Tidak ada produk
                </td>
            </tr>
        `;

    return;
  }

  tbody.innerHTML = products
    .map((product) => {
      let badge = "bg-green-100 text-green-700";

      let label = "Aman";

      if (product.stock <= 0) {
        badge = "bg-red-100 text-red-700";

        label = "Habis";
      } else if (product.stock <= (product.minStock || 5)) {
        badge = "bg-orange-100 text-orange-700";

        label = "Menipis";
      }

      return `
                <tr class="hover:bg-gray-50">

                    <td class="px-6 py-4">

                        <div class="flex items-center gap-3">

                            <img
                                src="${product.image}"
                                class="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            >

                            <div>

                                <div class="font-semibold">
                                    ${product.name}
                                </div>

                            </div>

                        </div>

                    </td>

                    <td class="px-6 py-4 font-semibold">
                        ${formatRp(product.price)}
                    </td>

                    <td class="px-6 py-4">
                        ${product.stock}
                    </td>

                    <td class="px-6 py-4">

                        <span
                            class="px-2 py-1 rounded-full text-xs font-semibold ${badge}"
                        >
                            ${label}
                        </span>

                    </td>

                    <td class="px-6 py-4 text-center">

                        <div class="flex justify-center gap-2">

                            <button
                                onclick="openStockModal(${product.id})"
                                class="px-3 py-1 bg-green-500 text-white rounded-lg"
                            >
                                + Stok
                            </button>

                            <button
                                onclick="deleteProduct(${product.id})"
                                class="px-3 py-1 bg-red-500 text-white rounded-lg"
                            >
                                Hapus
                            </button>

                        </div>

                    </td>

                </tr>
                `;
    })
    .join("");
}

window.deleteProduct = function (id) {
  if (!confirm("Hapus produk ini?")) {
    return;
  }

  StockManager.deleteProduct(id);

  renderStock();
};

function openModal() {
  document.getElementById("product-modal")?.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("product-modal")?.classList.add("hidden");
}

function saveStock() {
  const qty = Number(
    document.getElementById("stock-qty")?.value || 0
  );

  if (qty <= 0) {
    alert("Jumlah stok harus lebih dari 0");
    return;
  }

  StockManager.updateStock(
    selectedProductId,
    qty
  );

  closeStockModal();

  renderStock();

  alert("Stok berhasil ditambahkan");
}

function saveProduct() {
  const name = document.getElementById("product-name")?.value?.trim();

  const price = Number(document.getElementById("product-price")?.value || 0);

  const stock = Number(document.getElementById("product-stock")?.value || 0);

  const image = document.getElementById("product-image")?.value?.trim();

  if (!name || !price) {
    alert("Nama dan harga wajib diisi");

    return;
  }

  StockManager.addProduct({
    name,
    price,
    stock,
    image,
    category: "food",
    unit: "pcs",
    minStock: 5,
  });

  closeModal();

  renderStock();
}

window.openStockModal = function (id) {
  selectedProductId = id;

  const modal = document.getElementById("stock-modal");

  modal?.classList.remove("hidden");
  modal?.classList.add("flex");

  document.getElementById("stock-qty").value = "";
};

function closeStockModal() {
  const modal = document.getElementById("stock-modal");

  modal?.classList.add("hidden");
  modal?.classList.remove("flex");
}
