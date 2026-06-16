export function initReceipt() {
    const modal = document.getElementById('receipt-modal');
    const closeBtn = document.getElementById('close-receipt');
    const newOrderBtn = document.getElementById('new-order');
    const downloadPdfBtn = document.getElementById('download-pdf');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        });
    }

    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('receipt-content');
            const opt = {
                margin: 1,
                filename: `Invoice-${document.getElementById('r-invoice').innerText}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }
}