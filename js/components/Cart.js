import { formatRp, showToast } from '../utils.js';

// Simple State Management for Cart
export const cartState = {
    items: JSON.parse(localStorage.getItem('ds_cart')) || [],
    
    addItem(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this.save();
        this.updateUI();
    },

    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        this.updateUI();
    },

    updateQty(id, change) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) this.removeItem(id);
            else {
                this.save();
                this.updateUI();
            }
        }
    },

    save() {
        localStorage.setItem('ds_cart', JSON.stringify(this.items));
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    updateUI() {
        // Update Badge
        const badge = document.getElementById('cart-badge');
        const count = this.items.reduce((sum, i) => sum + i.qty, 0);
        if (badge) {
            badge.innerText = count;
            badge.classList.toggle('hidden', count === 0);
        }

        // Update Drawer Content
        this.renderDrawer();
        
        // Update Checkout Summary if exists
        this.renderCheckoutSummary();
    },

    renderDrawer() {
        const container = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-brown">Keranjang masih kosong</div>';
        } else {
            container.innerHTML = this.items.map(item => `
                <div class="flex gap-4 bg-white p-3 rounded-xl shadow-sm">
                    <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">
                    <div class="flex-1">
                        <h4 class="font-bold text-sm">${item.name}</h4>
                        <p class="text-orange text-sm font-semibold">${formatRp(item.price)}</p>
                        <div class="flex items-center gap-3 mt-2">
                            <button onclick="window.cartState.updateQty(${item.id}, -1)" class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">-</button>
                            <span class="text-sm font-bold">${item.qty}</span>
                            <button onclick="window.cartState.updateQty(${item.id}, 1)" class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200">+</button>
                            <button onclick="window.cartState.removeItem(${item.id})" class="ml-auto text-red-500 text-xs hover:underline">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        if (totalEl) totalEl.innerText = formatRp(this.getTotal());
    },

    renderCheckoutSummary() {
        const container = document.getElementById('checkout-summary');
        const totalEl = document.getElementById('checkout-total');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<p class="text-brown text-center">Belum ada item</p>';
        } else {
            container.innerHTML = this.items.map(item => `
                <div class="flex justify-between">
                    <span>${item.name} (x${item.qty})</span>
                    <span class="font-semibold">${formatRp(item.price * item.qty)}</span>
                </div>
            `).join('');
        }
        if (totalEl) totalEl.innerText = formatRp(this.getTotal());
    }
};

// Expose to window
window.cartState = cartState;

export function initCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const openBtn = document.getElementById('cart-btn');
    const closeBtn = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');

    function toggleCart(show) {
        if (show) {
            drawer.classList.add('open');
            overlay.classList.remove('hidden');
        } else {
            drawer.classList.remove('open');
            overlay.classList.add('hidden');
        }
    }

    if (openBtn) openBtn.addEventListener('click', () => toggleCart(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleCart(false));
    if (overlay) overlay.addEventListener('click', () => toggleCart(false));
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            toggleCart(false);
            document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Initial Render
    cartState.updateUI();
}