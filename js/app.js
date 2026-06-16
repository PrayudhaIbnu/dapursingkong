import { loadComponent, initScrollReveal } from './utils.js';
import { initNavbar } from './components/navbar.js';
import { initMenu } from './components/menu.js';
import { initCart } from './components/cart.js';
import { initCheckout } from './components/checkout.js';
import { initReceipt } from './components/receipt.js';

async function initApp() {
    const app = document.getElementById('app');

    // 1. Load HTML Components sequentially or in parallel
    const components = [
        { id: 'comp-navbar', path: 'components/navbar.html' },
        { id: 'comp-hero', path: 'components/hero.html' },
        { id: 'comp-about', path: 'components/about.html' },
        { id: 'comp-menu', path: 'components/menu.html' },
        { id: 'comp-cart', path: 'components/cart-drawer.html' },
        { id: 'comp-checkout', path: 'components/checkout.html' },
        { id: 'comp-contact', path: 'components/contact.html' },
        { id: 'comp-footer', path: 'components/footer.html' },
        { id: 'comp-receipt', path: 'components/receipt-modal.html' }
    ];

    // Create placeholders
    components.forEach(comp => {
        const div = document.createElement('div');
        div.id = comp.id;
        app.appendChild(div);
    });

    // Fetch and Inject
    await Promise.all(components.map(async (comp) => {
        await loadComponent(comp.path, comp.id);
    }));

    // 2. Initialize Logic for each component
    initNavbar();
    initMenu();       // Renders menu items dynamically
    initCart();       // Sets up cart drawer & state
    initCheckout();   // Sets up form validation & payment
    initReceipt();    // Sets up modal actions
    
    // 3. Global Utilities
    initScrollReveal();
    
    lucide.createIcons();
    
    // 4. Hide Loader
    setTimeout(() => {
        document.getElementById('loader').classList.add('opacity-0', 'pointer-events-none');
    }, 500);
}

// Start App
document.addEventListener('DOMContentLoaded', initApp);