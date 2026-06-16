// Data Menu
export const MENUS = [
    { id: 1, name: "Keripik Singkong Pedas Gurih", price: 10000, image: "../assets/menu/kripik-singkong.png" },
    { id: 2, name: "Tapai Singkong Lembut", price: 10000, image: "../assets/menu/tape.png" },
    { id: 3, name: "Combro Pedas Gurih", price: 13000, image: "../assets/menu/combro.png" },
    { id: 4, name: "Cenil Singkong Manis", price: 15000, image: "../assets/menu/cenil.png" },
    { id: 5, name: "Getuk Lindri Manis Asin", price: 15000, image: "../assets/menu/getuk-lindri.png" },
    { id: 6, name: "Perkedel Singkong", price: 12000, image: "../assets/menu/perkedel.png" }
];

// Format Currency
export const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// Generate Invoice ID
export const generateInvoice = () => {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${random}`;
};

// Toast Notification
export const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `bg-darkbrown text-cream px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 flex items-center gap-2 min-w-[250px]`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '⚠️'}</span>
        <span class="font-medium">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Scroll Reveal Observer
export const initScrollReveal = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// Component Loader Helper
export const loadComponent = async (path, targetId) => {
    try {
        const response = await fetch(path);
        const html = await response.text();
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = html;
            return true;
        }
    } catch (error) {
        console.error(`Error loading component ${path}:`, error);
    }
    return false;
};