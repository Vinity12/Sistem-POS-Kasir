// ==========================================
// APLIKASI MINI POS / KASIR WEB
// Praktikum Kelas XI RPL - SMK Negeri 9 Medan
// Menggunakan Local Storage untuk Data Persisten
// ==========================================

// State Default Produk (Jika Local Storage Kosong)
const defaultProducts = [
    { id: 1, name: "Nasi Goreng Spesial", price: 15000, stock: 12, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Es Teh Manis Jumbo", price: 5000, stock: 25, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Ayam Penyet", price: 18000, stock: 3, image: "https://unsplash.com/photos/RhanTswYckA/download?w=300" }, // Stok menipis (<5)
    { id: 4, name: "Roti Bakar Coklat Keju", price: 10000, stock: 0, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80" }, // Stok habis (0)
    { id: 5, name: "Kopi Hitam Robusta", price: 6000, stock: 15, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80" },
    { id: 6, name: "Keripik Singkong Balado", price: 4000, stock: 2, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80" } // Stok menipis (<5)
];

// Inisialisasi Data dari Local Storage atau Default
let products = JSON.parse(localStorage.getItem('pos_products')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('pos_cart')) || [];
let transactions = JSON.parse(localStorage.getItem('pos_transactions')) || [];
let selectedPaymentMethod = 'Tunai';

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    updateMetrics();
});

// Simpan state ke Local Storage
function saveToLocalStorage() {
    localStorage.setItem('pos_products', JSON.stringify(products));
    localStorage.setItem('pos_cart', JSON.stringify(cart));
    localStorage.setItem('pos_transactions', JSON.stringify(transactions));
}

// Format Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// Render Katalog Produk ke UI dengan Dynamic Badge Alerts
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        // Tentukan Badge Alert berdasarkan Stok
        let badgeHTML = '';
        let buttonDisabled = '';
        let buttonClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';

        if (product.stock === 0) {
            badgeHTML = '<span class="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">Stok Habis</span>';
            buttonDisabled = 'disabled';
            buttonClass = 'bg-slate-200 text-slate-400 cursor-not-allowed';
        } else if (product.stock < 5) {
            badgeHTML = '<span class="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">Stok Menipis</span>';
        } else {
            badgeHTML = '<span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">Aman (' + product.stock + ')</span>';
        }

        const card = document.createElement('div');
        card.className = 'bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition';
        card.innerHTML = `
            <div>
                <div class="img-container h-28 bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1541657374-52f267c6ff90?auto=format&fit=crop&w=300&q=80'}" alt="${product.name}" class="w-full h-full object-cover">
                    <div class="absolute top-2 right-2">
                        ${badgeHTML}
                    </div>
                </div>
                <h4 class="font-bold text-sm text-slate-800 line-clamp-1">${product.name}</h4>
                <p class="text-indigo-600 font-bold text-sm mt-1">${formatRupiah(product.price)}</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <span class="text-xs text-slate-500">Stok: ${product.stock}</span>
                <div class="flex items-center space-x-1">
                    <button onclick="addStock(${product.id})" title="Tambah Stok" class="text-xs px-2 py-1.5 rounded-lg font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition">
                        <i class="fa-solid fa-plus"></i> Stok
                    </button>
                    <button onclick="deleteProduct(${product.id})" title="Hapus Produk" class="text-xs px-2 py-1.5 rounded-lg font-medium bg-red-50 hover:bg-red-100 text-red-600 transition">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <button onclick="addToCart(${product.id})" ${buttonDisabled} class="text-xs px-3 py-1.5 rounded-lg font-medium transition ${buttonClass}">
                        <i class="fa-solid fa-cart-plus"></i> Beli
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Tambah Produk ke Keranjang dengan Validasi Stok
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.qty < product.stock) {
            cartItem.qty++;
        } else {
            alert('Stok produk tidak mencukupi!');
            return;
        }
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    saveToLocalStorage();
    renderCart();
    updateMetrics();
}

// Ubah Jumlah Item di Keranjang
function updateCartQty(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    if (!cartItem) return;

    const newQty = cartItem.qty + delta;
    if (newQty > product.stock) {
        alert('Melebihi stok yang tersedia!');
        return;
    }

    if (newQty <= 0) {
        cart = cart.filter(item => item.id !== productId);
    } else {
        cartItem.qty = newQty;
    }

    saveToLocalStorage();
    renderCart();
    updateMetrics();
}

// Render Keranjang Belanja
function renderCart() {
    const container = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">Keranjang masih kosong</p>';
        document.getElementById('cart-total').innerText = formatRupiah(0);
        checkoutBtn.disabled = true;
        calculateChange();
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const row = document.createElement('div');
        row.className = 'py-3 flex items-center justify-between';
        row.innerHTML = `
            <div class="pr-2">
                <h5 class="text-xs font-bold text-slate-800 line-clamp-1">${item.name}</h5>
                <p class="text-[11px] text-slate-500">${formatRupiah(item.price)} x ${item.qty}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="updateCartQty(${item.id}, -1)" class="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center text-xs font-bold">-</button>
                <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                <button onclick="updateCartQty(${item.id}, 1)" class="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center justify-center text-xs font-bold">+</button>
            </div>
        `;
        container.appendChild(row);
    });

    document.getElementById('cart-total').innerText = formatRupiah(total);
    checkoutBtn.disabled = false;
    calculateChange();
}

// Pilih Metode Pembayaran
function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.pay-btn').forEach(btn => {
        btn.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700');
        btn.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
    });

    const idMap = {
        'Tunai': 'pay-tunai',
        'QRIS': 'pay-qris',
        'Transfer': 'pay-transfer',
        'Debit': 'pay-debit',
        'E-Wallet': 'pay-ewallet',
        'Tempo': 'pay-tempo'
    };
    const activeBtn = document.getElementById(idMap[method] || ('pay-' + method.toLowerCase()));
    if (activeBtn) {
        activeBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
        activeBtn.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700');
    }

    const cashCalc = document.getElementById('cash-calculator');
    if (method === 'Tunai') {
        cashCalc.style.display = 'block';
    } else {
        cashCalc.style.display = 'none';
        document.getElementById('cash-input').value = '';
        document.getElementById('change-output').innerText = formatRupiah(0);
    }
}

// Kalkulator Kembalian Otomatis
function calculateChange() {
    let total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const cashInput = parseFloat(document.getElementById('cash-input').value) || 0;
    const changeOutput = document.getElementById('change-output');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (selectedPaymentMethod !== 'Tunai') {
        changeOutput.innerText = 'Rp 0 (Non-Tunai)';
        return;
    }

    const change = cashInput - total;
    if (change >= 0) {
        changeOutput.innerText = formatRupiah(change);
        changeOutput.className = 'font-bold text-emerald-600';
        if (cart.length > 0) checkoutBtn.disabled = false;
    } else {
        changeOutput.innerText = 'Uang Kurang ' + formatRupiah(Math.abs(change));
        changeOutput.className = 'font-bold text-red-600';
        if (cart.length > 0) checkoutBtn.disabled = true;
    }
}

// Update Metric Info Cards
function updateMetrics() {
    let totalOmzet = transactions.reduce((acc, tx) => acc + tx.total, 0);
    let totalStok = products.reduce((acc, p) => acc + p.stock, 0);
    let totalTransaksi = transactions.length;

    document.getElementById('metric-omzet').innerText = formatRupiah(totalOmzet);
    document.getElementById('metric-stok').innerText = totalStok;
    document.getElementById('metric-transaksi').innerText = totalTransaksi;
}

// Modal Tambah Produk (Data Binding Practice)
function toggleAddModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
}

function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('new-name').value;
    const price = parseFloat(document.getElementById('new-price').value);
    const stock = parseInt(document.getElementById('new-stock').value);
    const image = document.getElementById('new-image').value;

    const newProduct = {
        id: Date.now(),
        name,
        price,
        stock,
        image: image || 'https://images.unsplash.com/photo-1541657374-52f267c6ff90?auto=format&fit=crop&w=300&q=80'
    };

    products.push(newProduct);
    saveToLocalStorage();
    renderProducts();
    updateMetrics();
    toggleAddModal();
    document.getElementById('product-form').reset();
}

// Checkout & Cetak Nota Digital
function checkout() {
    if (cart.length === 0) return;

    let total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const cashInput = parseFloat(document.getElementById('cash-input').value) || 0;

    if (selectedPaymentMethod === 'Tunai' && cashInput < total) {
        alert('Jumlah uang tunai kurang!');
        return;
    }

    // Kurangi stok produk berdasarkan keranjang
    cart.forEach(cartItem => {
        const prod = products.find(p => p.id === cartItem.id);
        if (prod) {
            prod.stock -= cartItem.qty;
        }
    });

    // Simpan transaksi
    const tx = {
        id: 'TX-' + Date.now(),
        date: new Date().toLocaleString('id-ID'),
        items: [...cart],
        total,
        method: selectedPaymentMethod,
        status: selectedPaymentMethod === 'Tempo' ? 'Belum Lunas (Kasbon)' : 'Lunas',
        cash: selectedPaymentMethod === 'Tunai' ? cashInput : (selectedPaymentMethod === 'Tempo' ? 0 : total),
        change: selectedPaymentMethod === 'Tunai' ? (cashInput - total) : 0
    };

    transactions.push(tx);

    // Persiapkan Nota untuk Cetak
    preparePrintNota(tx);

    // Reset keranjang
    cart = [];
    saveToLocalStorage();
    renderProducts();
    renderCart();
    updateMetrics();
    document.getElementById('cash-input').value = '';

    // Trigger Native window.print()
    setTimeout(() => {
        window.print();
    }, 300);
}

// Siapkan Data Struk untuk window.print()
function preparePrintNota(tx) {
    document.getElementById('print-trx-id').innerText = 'No: ' + tx.id;
    document.getElementById('print-date').innerText = tx.date;
    document.getElementById('print-status').innerText = tx.status || 'Lunas';
    const itemsContainer = document.getElementById('print-items');
    itemsContainer.innerHTML = '';

    tx.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex justify-between';
        div.innerHTML = `<span>${item.name} (${item.qty}x)</span><span>${formatRupiah(item.price * item.qty)}</span>`;
        itemsContainer.appendChild(div);
    });

    document.getElementById('print-total').innerText = formatRupiah(tx.total);
    document.getElementById('print-method').innerText = tx.method;
    document.getElementById('print-cash').innerText = formatRupiah(tx.cash);
    document.getElementById('print-change').innerText = formatRupiah(tx.change);
}

// Reset Data Kasir
function resetData() {
    if (confirm('Yakin ingin mereset seluruh data produk dan transaksi ke kondisi awal?')) {
        localStorage.clear();
        products = [...defaultProducts];
        cart = [];
        transactions = [];
        saveToLocalStorage();
        renderProducts();
        renderCart();
        updateMetrics();
        alert('Data berhasil direset.');
    }
}


// Tambah Stok Produk
function addStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const input = prompt(`Tambah stok untuk "${product.name}" (Stok saat ini: ${product.stock}):`, '5');
    if (input === null) return;

    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) {
        alert('Masukkan jumlah stok yang valid (angka lebih dari 0).');
        return;
    }

    product.stock += amount;
    saveToLocalStorage();
    renderProducts();
    updateMetrics();
}

// Hapus Produk
function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`Yakin ingin menghapus produk "${product.name}"?`)) return;

    products = products.filter(p => p.id !== productId);
    cart = cart.filter(item => item.id !== productId);
    saveToLocalStorage();
    renderProducts();
    renderCart();
    updateMetrics();
}
