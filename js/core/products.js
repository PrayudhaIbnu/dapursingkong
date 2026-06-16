// ========================================
// FILE: js/core/products.js
// UNTUK: Shared data produk & manajemen stok
// ========================================

// ====== DEFAULT PRODUCTS (Fallback) ======
const DEFAULT_PRODUCTS = [
    { 
        id: 1, 
        name: "Keripik Singkong Pedas Gurih", 
        category: "keripik", 
        price: 10000, 
        stock: 50, 
        minStock: 10, 
        unit: "pcs", 
        image: "../assets/menu/kripik-singkong.png", 
        description: "Keripik singkong renyah dengan bumbu pedas gurih khas." 
    },
    { 
        id: 2, 
        name: "Tapai Singkong Lembut", 
        category: "manis", 
        price: 10000, 
        stock: 30, 
        minStock: 10, 
        unit: "pcs", 
        image: "../assets/menu/tape.png", 
        description: "Tapai singkong fermentasi sempurna, lembut dan manis." 
    },
    { 
        id: 3, 
        name: "Combro Pedas Gurih", 
        category: "gorengan", 
        price: 13000, 
        stock: 5, 
        minStock: 10, 
        unit: "pcs", 
        image: "../assets/menu/combro.png", 
        description: "Combro isi oncom dengan cita rasa pedas gurih." 
    },
    { 
        id: 4, 
        name: "Cenil Singkong Manis", 
        category: "manis", 
        price: 15000, 
        stock: 25, 
        minStock: 8, 
        unit: "pcs", 
        image: "../assets/menu/cenil.png", 
        description: "Cenil kenyal dengan gula merah dan kelapa parut." 
    },
    { 
        id: 5, 
        name: "Getuk Lindri Manis Asin", 
        category: "manis", 
        price: 15000, 
        stock: 0, 
        minStock: 8, 
        unit: "pcs", 
        image: "../assets/menu/getuk-lindri.png", 
        description: "Getuk lindri lembut dengan perpaduan manis dan gurih." 
    },
    { 
        id: 6, 
        name: "Perkedel Singkong", 
        category: "gorengan", 
        price: 12000, 
        stock: 40, 
        minStock: 10, 
        unit: "pcs", 
        image: "../assets/menu/perkedel.png", 
        description: "Perkedel singkong gurih dengan bumbu rempah pilihan." 
    }
];

// ====== CATEGORIES ======
export const CATEGORIES = [
    { id: 'all', name: 'Semua', icon: '🍽️' },
    { id: 'keripik', name: 'Keripik', icon: '🥔' },
    { id: 'gorengan', name: 'Gorengan', icon: '🍳' },
    { id: 'manis', name: 'Olahan Manis', icon: '🍬' }
];

// ====== STOCK MANAGER ======
export const StockManager = {
    // Ambil semua produk
    getProducts() {
        const stored = localStorage.getItem('ds_products');
        if (stored) {
            try { 
                return JSON.parse(stored); 
            } catch (e) { 
                console.error('Error parsing products:', e); 
            }
        }
        // Jika belum ada, gunakan default
        localStorage.setItem('ds_products', JSON.stringify(DEFAULT_PRODUCTS));
        return [...DEFAULT_PRODUCTS];
    },

    // Simpan semua produk
    saveProducts(products) {
        localStorage.setItem('ds_products', JSON.stringify(products));
    },

    // Tambah produk baru
    addProduct(product) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name: product.name,
            category: product.category,
            price: Number(product.price),
            stock: Number(product.stock),
            minStock: Number(product.minStock) || 10,
            unit: product.unit || 'pcs',
            image: product.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
            description: product.description || ''
        };
        products.push(newProduct);
        this.saveProducts(products);
        return newProduct;
    },

    // Update produk
    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        products[index] = { 
            ...products[index], 
            ...updates,
            price: Number(updates.price ?? products[index].price),
            stock: Number(updates.stock ?? products[index].stock),
            minStock: Number(updates.minStock ?? products[index].minStock)
        };
        this.saveProducts(products);
        return products[index];
    },

    // Update stok saja (cepat)
    updateStock(id, change) {
        const products = this.getProducts();
        const product = products.find(p => p.id === id);
        if (!product) return null;
        
        product.stock = Math.max(0, product.stock + change);
        this.saveProducts(products);
        return product;
    },

    // Hapus produk
    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
        return true;
    },

    // Cari produk by ID
    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    },

    // Statistik stok
    getStats() {
        const products = this.getProducts();
        const totalProducts = products.length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
        const outOfStock = products.filter(p => p.stock === 0);
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        
        return { totalProducts, lowStock, outOfStock, totalValue };
    },

    // Reset ke default (untuk testing)
    resetToDefault() {
        localStorage.setItem('ds_products', JSON.stringify(DEFAULT_PRODUCTS));
        return [...DEFAULT_PRODUCTS];
    }
};

// ====== BACKWARD COMPATIBILITY ======
// Untuk kode lama yang masih pakai PRODUCTS
export const PRODUCTS = StockManager.getProducts();

// Helper untuk refresh data
export function refreshProducts() {
    return StockManager.getProducts();
}