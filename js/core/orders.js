import { generateInvoice } from '../utils.js';

export const OrderManager = {
    // Ambil semua pesanan
    getOrders() {
        return JSON.parse(localStorage.getItem('ds_orders')) || [];
    },

    // Simpan pesanan baru (Dipanggil saat customer checkout)
    addOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: generateInvoice(),
            date: new Date().toISOString(),
            status: 'Pending', // Pending, Completed, Cancelled
            ...orderData
        };
        orders.push(newOrder);
        localStorage.setItem('ds_orders', JSON.stringify(orders));
        return newOrder;
    },

    // Update status pesanan (Dipanggil dari admin)
    updateStatus(invoiceId, newStatus) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === invoiceId);
        if (index !== -1) {
            orders[index].status = newStatus;
            localStorage.setItem('ds_orders', JSON.stringify(orders));
            return true;
        }
        return false;
    },

    // Hitung ringkasan untuk dashboard
    getSummary() {
        const orders = this.getOrders();
        const totalRevenue = orders
            .filter(o => o.status === 'Completed')
            .reduce((sum, o) => sum + o.total, 0);
        
        const pendingCount = orders.filter(o => o.status === 'Pending').length;

        return {
            totalOrders: orders.length,
            totalRevenue,
            pendingCount
        };
    }
};