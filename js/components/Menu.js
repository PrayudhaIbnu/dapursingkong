import { MENUS, formatRp, showToast } from '../utils.js';
import { cartState } from './cart.js'; // Import shared state

export function initMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    grid.innerHTML = MENUS.map(item => `
        <div class="menu-card bg-white rounded-2xl overflow-hidden shadow-md reveal group">
            <div class="relative h-48 overflow-hidden">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute top-3 right-3 bg-orange text-white text-xs font-bold px-3 py-1 rounded-full">Premium</div>
            </div>
            <div class="p-6">
                <h3 class="font-display font-bold text-xl mb-2">${item.name}</h3>
                <p class="text-orange font-bold text-lg mb-4">${formatRp(item.price)}</p>
                <button onclick="window.addToCart(${item.id})" class="w-full py-3 bg-darkbrown text-cream rounded-xl font-semibold hover:bg-brown transition flex items-center justify-center gap-2">
                    <span>+</span> Tambah ke Keranjang
                </button>
            </div>
        </div>
    `).join('');
}

// Expose to window for inline onclick
window.addToCart = (id) => {
    const item = MENUS.find(m => m.id === id);
    if (item) {
        cartState.addItem(item);
        showToast(`${item.name} ditambahkan`);
    }
};