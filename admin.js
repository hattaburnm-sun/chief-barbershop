const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

// Tab Switching
document.querySelectorAll('.nav-menu li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelectorAll('.nav-menu li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.getElementById('tab-' + li.dataset.tab).classList.add('active');
        
        if (li.dataset.tab === 'dashboard') loadDashboard();
        if (li.dataset.tab === 'products') loadProducts();
        if (li.dataset.tab === 'articles') loadArticles();
        if (li.dataset.tab === 'bookings') loadBookings();
        if (li.dataset.tab === 'banners') loadBanners();
    });
});

// Modals
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
    if(id === 'productModal') document.getElementById('productForm').reset();
}
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = "none";
}

// Initial Load
loadDashboard();
loadProducts();
loadBanners();

async function loadDashboard() {
    const pRes = await fetch(`${API_URL}/products`);
    const aRes = await fetch(`${API_URL}/articles`);
    const bRes = await fetch(`${API_URL}/bookings`);
    
    const products = await pRes.json();
    const articles = await aRes.json();
    const bookings = await bRes.json();
    
    document.getElementById('stat-products').innerText = products.length || 0;
    document.getElementById('stat-articles').innerText = articles.length || 0;
    document.getElementById('stat-bookings').innerText = bookings.filter(b => b.status === 'Pending').length || 0;
}

// --- PRODUCTS ---
async function loadProducts() {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const list = document.getElementById('products-list');
    if (!list) return;
    list.innerHTML = '';
    
    products.forEach(p => {
        list.innerHTML += `
            <div class="list-row">
                <div class="row-left">
                    <div class="row-icon"><img src="${p.image_url}" alt="${p.name}"></div>
                    <div class="row-info">
                        <h4>${p.name}</h4>
                        <p>${p.subtitle || 'Product'}</p>
                    </div>
                </div>
                <div class="row-middle">
                    <h4>Rp ${p.price.toLocaleString('id-ID')}</h4>
                    <p>Featured: ${p.is_featured ? 'Yes' : 'No'}</p>
                </div>
                <div class="row-right">
                    <button class="row-action" onclick="deleteProduct(${p.id})" title="Delete Product">×</button>
                </div>
            </div>
        `;
    });
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('prod-name').value);
    formData.append('subtitle', document.getElementById('prod-subtitle').value);
    formData.append('price', document.getElementById('prod-price').value);
    formData.append('old_price', document.getElementById('prod-old-price').value);
    formData.append('badge', document.getElementById('prod-badge').value);
    formData.append('badge_color', document.getElementById('prod-badge-color').value);
    formData.append('is_featured', document.getElementById('prod-featured').checked ? 1 : 0);
    
    const fileField = document.getElementById('prod-image');
    if(fileField.files[0]) {
        formData.append('image', fileField.files[0]);
    } else {
        // Just for demo, you'd usually pass existing image url back
        formData.append('image_url', 'placeholder'); 
    }

    await fetch(`${API_URL}/products`, {
        method: 'POST',
        body: formData
    });
    
    closeModal('productModal');
    loadProducts();
    loadDashboard();
});

async function deleteProduct(id) {
    if(!confirm("Delete this product?")) return;
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    loadProducts();
}

// --- ARTICLES & BOOKINGS (Placeholders to be filled similarly) ---
async function loadArticles() {
    const res = await fetch(`${API_URL}/articles`);
    const articles = await res.json();
    const list = document.getElementById('articles-list');
    if (!list) return;
    list.innerHTML = '';
    
    articles.forEach(a => {
        list.innerHTML += `
            <div class="list-row">
                <div class="row-left">
                    <div class="row-icon"><img src="${a.image_url}" alt="${a.title}"></div>
                    <div class="row-info">
                        <h4>${a.title}</h4>
                        <p>Blog Post</p>
                    </div>
                </div>
                <div class="row-middle">
                    <h4>${a.pos_class}</h4>
                    <p>Position</p>
                </div>
                <div class="row-right">
                    <button class="row-action" onclick="deleteArticle(${a.id})" title="Delete Article">×</button>
                </div>
            </div>
        `;
    });
}

async function deleteArticle(id) {
    if(!confirm("Delete this article?")) return;
    await fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' });
    loadArticles();
}

async function loadBookings() {
    const res = await fetch(`${API_URL}/bookings`);
    const bookings = await res.json();
    const list = document.getElementById('bookings-list');
    if (!list) return;
    list.innerHTML = '';
    
    bookings.forEach(b => {
        list.innerHTML += `
            <div class="list-row">
                <div class="row-left">
                    <div class="row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                    <div class="row-info">
                        <h4>${b.customer_name}</h4>
                        <p>${b.customer_phone}</p>
                    </div>
                </div>
                <div class="row-middle">
                    <h4>${b.booking_date} ${b.booking_time}</h4>
                    <p>${b.location.replace(/-/g, ' ').toUpperCase()} • ${b.service}</p>
                </div>
                <div class="row-right">
                    <div style="margin-right: 16px;">
                        <h4>${b.status}</h4>
                        <p>Status</p>
                    </div>
                    ${b.status === 'Pending' ? `<button class="row-action" style="color:var(--accent); border-color:var(--accent);" onclick="updateBookingStatus(${b.id}, 'Confirmed')" title="Confirm Booking">✓</button>` : ''}
                </div>
            </div>
        `;
    });
}

async function updateBookingStatus(id, status) {
    await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    loadBookings();
    loadDashboard();
}

// --- BANNERS ---
let allBanners = [];

async function loadBanners() {
    const res = await fetch(`${API_URL}/banners`);
    allBanners = await res.json();
    const list = document.getElementById('banners-list');
    if (!list) return;
    list.innerHTML = '';
    
    allBanners.forEach(b => {
        list.innerHTML += `
            <div class="list-row">
                <div class="row-left">
                    <div class="row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
                    <div class="row-info">
                        <h4>${b.title}</h4>
                        <p>${b.subtitle}</p>
                    </div>
                </div>
                <div class="row-middle">
                    <h4>${b.badge_text ? b.badge_text : 'No Badge'}</h4>
                    <p>Badge Text</p>
                </div>
                <div class="row-right">
                    <button class="row-action" onclick="editBanner(${b.id})" title="Edit Banner">✎</button>
                </div>
            </div>
        `;
    });
}

function editBanner(id) {
    const banner = allBanners.find(b => b.id === id);
    if (!banner) return;
    
    document.getElementById('ban-id').value = banner.id;
    document.getElementById('ban-title').value = banner.title;
    document.getElementById('ban-subtitle').value = banner.subtitle;
    document.getElementById('ban-price').value = banner.price_text;
    document.getElementById('ban-badge').value = banner.badge_text;
    document.getElementById('ban-bg').value = banner.bg_class;
    
    openModal('bannerModal');
}

document.getElementById('bannerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('ban-id').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('ban-title').value);
    formData.append('subtitle', document.getElementById('ban-subtitle').value);
    formData.append('price_text', document.getElementById('ban-price').value);
    formData.append('badge_text', document.getElementById('ban-badge').value);
    formData.append('bg_class', document.getElementById('ban-bg').value);
    
    const fileField = document.getElementById('ban-image');
    if(fileField.files[0]) {
        formData.append('image', fileField.files[0]);
    }

    await fetch(`${API_URL}/banners/${id}`, {
        method: 'PUT',
        body: formData
    });
    
    closeModal('bannerModal');
    loadBanners();
});

