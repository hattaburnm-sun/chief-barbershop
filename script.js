const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

// Frame settings
const frameCount = 70; // 000 to 069
const currentFrame = index => (
  `Asset Banner/kling_20260612_作品_Create_a_s_3643_0_${index.toString().padStart(3, '0')}.jpg`
);

// Preload images to ensure smooth animation
const images = [];
let imagesLoaded = 0;

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// Function to calculate scaling and position (Object-fit: cover equivalent for canvas)
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY < 0) offsetY = 0;
    if (offsetY > 1) offsetY = 1;

    let iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}

// Draw the first image initially
images[0].onload = render;

// Handle resizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial sizing

function render() {
    if (images[0].complete) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the image filling the canvas
        // Get the current scroll percentage to determine which frame to show
        let scrollFraction = 0;
        
        // Calculate based on the actual hero container's scrollable height
        const heroContainer = document.querySelector('.hero-container');
        const scrollableHeight = heroContainer 
            ? heroContainer.offsetHeight - window.innerHeight
            : window.innerHeight * 4;
        
        if (window.scrollY > 0) {
            scrollFraction = Math.min(1, window.scrollY / scrollableHeight);
        }
        
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        if(images[frameIndex] && images[frameIndex].complete) {
            drawImageProp(context, images[frameIndex], 0, 0, canvas.width, canvas.height, 0.5, 0);
        }
        
        // Track the person: Animate the Try AI button upwards on scroll
        const bannerCenter = document.querySelector('.banner-center');
        if (bannerCenter && window.innerWidth > 768) {
            // Only animate on desktop; mobile uses static position
            const moveY = -(scrollFraction * window.innerHeight * 0.6); 
            bannerCenter.style.transform = `translate(-50%, ${moveY}px)`;
        }
        
        // (Navbar toggle moved out to support non-canvas pages)
    }
}

// Request animation frame for smooth scrolling updates
let scrollY = window.scrollY;

function update() {
    if (scrollY !== window.scrollY) {
        scrollY = window.scrollY;
        render();
        
    // Universal navbar background toggle
        const navbar = document.querySelector('.main-navbar');
        if (navbar) {
            // If there's a canvas, we wait until scroll passes the canvas
            const hasHero = document.getElementById('hero-lightpass');
            if (hasHero) {
                const heroContainer = document.querySelector('.hero-container');
                const heroScrollable = heroContainer
                    ? heroContainer.offsetHeight - window.innerHeight
                    : window.innerHeight * 4;
                const scrollFrac = scrollY / heroScrollable;
                if (scrollFrac >= 1) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            } else {
                // For pages without canvas (e.g. catalog), trigger immediately on scroll
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        }
    }
    requestAnimationFrame(update);
}

requestAnimationFrame(update);

document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.journal-card'));
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    function shiftCards(shift) {
        cards.forEach(c => {
            const currentPosMatch = c.className.match(/pos-(\d)/);
            if (!currentPosMatch) return;
            const currentPos = parseInt(currentPosMatch[1]);
            let newPos = currentPos + shift;
            if (newPos > 5) newPos -= 5;
            if (newPos < 1) newPos += 5;
            
            // Prevent flying across the screen by disabling transition during wrap-around
            if ((currentPos === 5 && newPos === 1) || (currentPos === 1 && newPos === 5)) {
                c.style.transition = 'none';
                c.className = 'journal-card pos-' + newPos;
                void c.offsetWidth; // Force reflow
                c.style.transition = '';
            } else {
                c.className = 'journal-card pos-' + newPos;
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => shiftCards(1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => shiftCards(-1));
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('pos-3')) {
                // Future action when center article is clicked
                // console.log('Article clicked!');
            }
        });
    });

    // (Banner rotation moved to fetchAndRenderProducts)
});

// Catalog Sidebar Accordion Toggle
function toggleAccordion(element) {
    if (element.classList.contains('closed')) {
        element.classList.remove('closed');
    } else {
        element.classList.add('closed');
    }
}

// --- DYNAMIC BACKEND INTEGRATION ---
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`;

async function fetchAndRenderProducts() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) return;
        const products = await res.json();
        
        const featuredContainers = document.querySelectorAll('.products-container');
        const featured = products.filter(p => p.is_featured);

        // --- Dynamic Banner ---
        const contentWrapper = document.getElementById('cc-content-wrapper');
        if (contentWrapper && featured.length > 0) {
            let currentProductIndex = 0;
            
            // Initial render
            const updateBanner = (prod) => {
                document.getElementById('cc-badge').textContent = prod.badge;
                document.getElementById('cc-img').src = prod.image_url;
                document.getElementById('cc-f1').innerHTML = `<span>1</span> PREMIUM QUALITY<br><small>Chief Standard</small>`;
                document.getElementById('cc-f2').innerHTML = `<span>2</span> HIGHLY RECOMMENDED<br><small>Best Seller</small>`;
                document.getElementById('cc-f3').innerHTML = `<span>3</span> GUARANTEED<br><small>100% Original</small>`;
                document.getElementById('cc-title').textContent = prod.name;
                document.getElementById('cc-subtitle').textContent = prod.subtitle;
                document.getElementById('cc-price').textContent = `Rp ${prod.price.toLocaleString('id-ID')}`;
            };
            updateBanner(featured[0]);

            if (featured.length > 1) {
                // Ensure interval isn't duplicated if function runs twice
                if (window.bannerInterval) clearInterval(window.bannerInterval);
                window.bannerInterval = setInterval(() => {
                    currentProductIndex = (currentProductIndex + 1) % featured.length;
                    const prod = featured[currentProductIndex];
                    
                    contentWrapper.style.opacity = '0';
                    setTimeout(() => {
                        updateBanner(prod);
                        contentWrapper.style.opacity = '1';
                    }, 300);
                }, 4000);
            }
        }
        // ----------------------

        if (featuredContainers.length > 0) {
            // First container: Featured products
            const featuredProducts = featured.slice(0, 3);
            let html1 = '';
            featuredProducts.forEach(p => {
                const oldPrice = p.old_price ? `<span class="old-price">Rp ${p.old_price.toLocaleString('id-ID')}</span>` : '';
                html1 += `
                <div class="product-card">
                    <div class="card-top">
                        <span class="badge ${p.badge_color}">${p.badge}</span>
                        <button class="wishlist">♡</button>
                    </div>
                    <img src="${p.image_url}" alt="${p.name}">
                    <div class="card-body">
                        <h4>${p.name}</h4>
                        <p class="card-subtitle">${p.subtitle}</p>
                        <div class="rating" style="margin: 0.5rem 0; font-size: 0.9rem; color: #1a1a1a;">★★★★★</div>
                        <p class="price">Rp ${p.price.toLocaleString('id-ID')} ${oldPrice}</p>
                    </div>
                </div>`;
            });
            featuredContainers[0].innerHTML = html1;
            
            // Second container (if exists): Just Arrived (latest products)
            if (featuredContainers[1]) {
                const latest = [...products].reverse().slice(0, 3);
                let html2 = '';
                latest.forEach(p => {
                    const oldPrice = p.old_price ? `<span class="old-price">Rp ${p.old_price.toLocaleString('id-ID')}</span>` : '';
                    html2 += `
                    <div class="product-card">
                        <div class="card-top">
                            <span class="badge ${p.badge_color}">${p.badge}</span>
                            <button class="wishlist">♡</button>
                        </div>
                        <img src="${p.image_url}" alt="${p.name}">
                        <div class="card-body">
                            <h4>${p.name}</h4>
                            <p class="card-subtitle">${p.subtitle}</p>
                            <div class="rating" style="margin: 0.5rem 0; font-size: 0.9rem; color: #1a1a1a;">★★★★★</div>
                            <p class="price">Rp ${p.price.toLocaleString('id-ID')} ${oldPrice}</p>
                        </div>
                    </div>`;
                });
                featuredContainers[1].innerHTML = html2;
            }
        }

        // Render on catalog.html
        const catalogGrid = document.querySelector('.catalog-grid');
        if (catalogGrid) {
            let html = '';
            products.forEach(p => {
                const oldPrice = p.old_price ? `<span class="old-price">Rp ${p.old_price.toLocaleString('id-ID')}</span>` : '';
                html += `
                <div class="catalog-product-card">
                    <div class="cpc-image-wrapper">
                        <span class="badge ${p.badge_color}">${p.badge}</span>
                        <img src="${p.image_url}" alt="${p.name}">
                    </div>
                    <div class="cpc-info">
                        <h3 class="cpc-title">${p.name}</h3>
                        <p class="cpc-subtitle">${p.subtitle}</p>
                        <div class="cpc-price-row">
                            <div class="cpc-price">
                                <span>Rp ${p.price.toLocaleString('id-ID')} ${oldPrice}</span>
                                <div class="rating">★★★★★</div>
                            </div>
                            <a href="#" class="detail-link">DETAIL →</a>
                        </div>
                    </div>
                </div>`;
            });
            catalogGrid.innerHTML = html;
        }

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function fetchAndRenderBanners() {
    try {
        const res = await fetch(`${API_BASE}/banners`);
        if (!res.ok) return;
        const banners = await res.json();
        
        // Banner 1
        const b1 = banners.find(b => b.id === 1);
        const pb1 = document.getElementById('promo-banner-1');
        if (b1 && pb1) {
            pb1.className = `promo-banner ${b1.bg_class}`;
            pb1.querySelector('.p-title').innerHTML = b1.title;
            pb1.querySelector('.p-subtitle').innerHTML = b1.subtitle;
            pb1.querySelector('.p-price').innerHTML = b1.price_text;
            
            const img = pb1.querySelector('.p-img');
            if (img && b1.image_url) {
                img.src = b1.image_url;
                img.style.display = 'block';
            } else if (img) {
                img.style.display = 'none';
            }
        }
        
        // Banner 2
        const b2 = banners.find(b => b.id === 2);
        const pb2 = document.getElementById('promo-banner-2');
        if (b2 && pb2) {
            pb2.className = `promo-banner ${b2.bg_class}`;
            pb2.querySelector('.p-title').innerHTML = b2.title;
            pb2.querySelector('.p-subtitle').innerHTML = b2.subtitle;
            
            const badge = pb2.querySelector('.p-badge');
            if (badge) {
                badge.innerHTML = b2.badge_text;
                badge.style.display = b2.badge_text ? 'inline-block' : 'none';
            }
        }
    } catch (error) {
        console.error("Error fetching banners:", error);
    }
}

async function fetchAndRenderArticles() {
    try {
        const res = await fetch(`${API_BASE}/articles`);
        if (!res.ok) return;
        const articles = await res.json();
        
        const carousel = document.querySelector('.journal-carousel');
        if (carousel && articles.length >= 5) {
            const cards = Array.from(carousel.querySelectorAll('.journal-card'));
            articles.slice(0,5).forEach((art, index) => {
                if(cards[index]) {
                    cards[index].innerHTML = `<img src="${art.image_url}" alt="${art.title}">`;
                }
            });
        }
    } catch (e) { console.error("Error fetching articles", e); }
}

function handleBookingSubmit() {
    const form = document.querySelector('.booking-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            location: document.getElementById('location').value,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
        
        const btn = form.querySelector('.btn-submit');
        const oldText = btn.textContent;
        btn.textContent = "SENDING...";
        
        try {
            await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            alert("Booking Confirmed!");
            form.reset();
        } catch (err) {
            alert("Error sending booking.");
        } finally {
            btn.textContent = oldText;
        }
    });
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dynamic fetching
    fetchAndRenderProducts();
    fetchAndRenderBanners();
    fetchAndRenderArticles();
    handleBookingSubmit();

    // ── Mobile Hamburger Menu ──
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Close mobile menu on outside click
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }
});

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
}