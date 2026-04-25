/* ══════════════════════════════════════════════════════
   MODE & CO. — ADVANCED JS ENGINE
   Cart · Cursor · Scroll Reveal · Animations · UX
   ══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── CUSTOM CURSOR ──────────────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'custom-cursor';
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animateCursor() {
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Scale on hover
    document.querySelectorAll('a, button, .product-card, .category-card, .size-btn, .color-swatch').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.style.width  = '6px';
        dot.style.height = '6px';
        ring.style.width  = '52px';
        ring.style.height = '52px';
        ring.style.borderColor = 'var(--accent-color)';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.width  = '10px';
        dot.style.height = '10px';
        ring.style.width  = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(212,175,55,0.4)';
      });
    });
  }

  /* ── NAVBAR SCROLL ──────────────────────────────────── */
  function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────── */
  function initScrollReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ── SECTION LINES ──────────────────────────────────── */
  function initSectionLines() {
    const lines = document.querySelectorAll('.section-line');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('animate');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    lines.forEach(l => io.observe(l));
  }

  /* ── CART ENGINE ────────────────────────────────────── */
  let cart = JSON.parse(localStorage.getItem('modeCoCart') || '[]');

  function saveCart() {
    localStorage.setItem('modeCoCart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = total;
      b.style.display = total === 0 ? 'none' : 'flex';
    });
  }

  window.addToCart = function(id, name, price, image, category) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, image, category: category || '', qty: 1 });
    }
    saveCart();
    showToast(`✓ ${name} ajouté au panier`, '🛍️');
    animateCartBadge();
  };

  window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    if (document.getElementById('cart-items-container')) renderCartPage();
  };

  window.updateQty = function(id, qty) {
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, parseInt(qty) || 1);
      saveCart();
      if (document.getElementById('cart-items-container')) renderCartPage();
    }
  };

  function animateCartBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.style.transform = 'scale(1.4)';
      setTimeout(() => b.style.transform = '', 200);
    });
  }

  /* ── TOAST ──────────────────────────────────────────── */
  function showToast(msg, icon) {
    let container = document.querySelector('.toast-container-custom');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.innerHTML = `<span class="toast-icon">${icon || '✓'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ── CART PAGE RENDER ───────────────────────────────── */
  function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalEl   = document.getElementById('cart-total');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div style="font-size:3rem;margin-bottom:16px;">🛍️</div>
          <h4 style="font-family:var(--font-heading);">Votre panier est vide</h4>
          <p class="text-muted mt-2">Découvrez nos produits et ajoutez vos favoris</p>
          <a href="products.html" class="btn btn-gold mt-4">Explorer la Collection</a>
        </div>`;
      if (totalEl) totalEl.textContent = '0,00 €';
      if (subtotalEl) subtotalEl.textContent = '0,00 €';
      return;
    }

    cart.forEach((item, idx) => {
      const sub = item.price * item.qty;
      total += sub;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.style.animationDelay = (idx * 0.08) + 's';
      row.innerHTML = `
        <div class="cart-item-info">
          <img src="${item.image || 'assets/images/placeholder.jpg'}" class="cart-item-img" alt="${item.name}">
          <div>
            <div class="product-category">${item.category}</div>
            <div class="product-name">${item.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Réf: MC-${item.id}</div>
          </div>
        </div>
        <div style="font-family:var(--font-heading);font-weight:700;">${item.price.toFixed(2)} €</div>
        <div>
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateQty(${item.id}, ${item.qty - 1})">−</button>
            <input class="qty-input" type="number" value="${item.qty}" min="1" onchange="updateQty(${item.id}, this.value)">
            <button class="qty-btn" onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <div style="font-family:var(--font-heading);font-weight:700;color:var(--text-primary);">${sub.toFixed(2)} €</div>
        <button onclick="removeFromCart(${item.id})" style="width:32px;height:32px;border-radius:50%;border:none;background:var(--bg-light);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-size:0.9rem;" onmouseover="this.style.background='#fee';this.style.color='#E53E3E'" onmouseout="this.style.background='var(--bg-light)';this.style.color='var(--text-muted)'">✕</button>
      `;
      container.appendChild(row);
    });

    if (subtotalEl) subtotalEl.textContent = total.toFixed(2) + ' €';
    if (totalEl)    totalEl.textContent    = total.toFixed(2) + ' €';
  }

  /* ── ADD TO CART BUTTONS ────────────────────────────── */
  function initAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card  = this.closest('[data-product]') || this.closest('.product-card') || this.closest('.card');
        const id    = parseInt(this.dataset.id || Math.floor(Math.random() * 9000 + 1000));
        const name  = card?.querySelector('.product-name, .card-title')?.innerText?.trim() || 'Produit';
        const price = parseFloat((card?.querySelector('.product-price, .fw-bold')?.innerText || '0').replace(/[^\d.,]/g,'').replace(',','.')) || 0;
        const img   = card?.querySelector('img')?.src || '';
        const cat   = card?.querySelector('.product-category')?.innerText?.trim() || '';
        addToCart(id, name, price, img, cat);

        // Ripple on button
        this.style.transform = 'scale(0.92)';
        setTimeout(() => this.style.transform = '', 200);
      });
    });
  }

  /* ── WISHLIST ────────────────────────────────────────── */
  function initWishlist() {
    let wishlist = JSON.parse(localStorage.getItem('modeCoWishlist') || '[]');
    document.querySelectorAll('.product-wishlist').forEach(btn => {
      const id = btn.dataset.id;
      if (wishlist.includes(id)) btn.classList.add('active');
      btn.addEventListener('click', function() {
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
          wishlist.push(id);
          showToast('Ajouté aux favoris', '❤️');
        } else {
          wishlist = wishlist.filter(i => i !== id);
        }
        localStorage.setItem('modeCoWishlist', JSON.stringify(wishlist));
      });
    });
  }

  /* ── SIZE SELECTOR ──────────────────────────────────── */
  function initSizeSelector() {
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        this.closest('.size-grid')?.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  /* ── GALLERY THUMBS ─────────────────────────────────── */
  function initGallery() {
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', function() {
        const gallery = this.closest('.product-detail-gallery');
        gallery?.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const mainImg = gallery?.querySelector('.gallery-main img');
        if (mainImg) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = this.querySelector('img').src;
            mainImg.style.opacity = '1';
          }, 200);
        }
      });
    });
  }

  /* ── PRICE RANGE SLIDER ─────────────────────────────── */
  function initPriceRange() {
    const slider = document.querySelector('.price-range-slider');
    const label  = document.getElementById('price-label');
    if (!slider) return;
    slider.addEventListener('input', function() {
      const pct = (this.value - this.min) / (this.max - this.min) * 100;
      this.style.background = `linear-gradient(90deg, var(--accent-color) ${pct}%, var(--border-light) ${pct}%)`;
      if (label) label.textContent = this.value + '€';
    });
  }

  /* ── PRODUCT FILTER ─────────────────────────────────── */
  function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-tab');
    const cards      = document.querySelectorAll('.product-card-wrapper');
    if (!filterBtns.length) return;
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const cat = this.dataset.filter;
        cards.forEach(card => {
          const match = cat === 'all' || card.dataset.category === cat;
          card.style.opacity    = '0';
          card.style.transform  = 'scale(0.95)';
          setTimeout(() => {
            card.style.display    = match ? '' : 'none';
            if (match) {
              card.style.opacity   = '1';
              card.style.transform = 'scale(1)';
            }
          }, 150);
        });
      });
    });
  }

  /* ── SORT PRODUCTS ──────────────────────────────────── */
  function initSort() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;
    sortSelect.addEventListener('change', function() {
      const grid  = document.getElementById('products-grid');
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.product-card-wrapper'));
      const sort  = this.value;
      cards.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || 0);
        const pb = parseFloat(b.dataset.price || 0);
        if (sort === 'asc')  return pa - pb;
        if (sort === 'desc') return pb - pa;
        return 0;
      });
      cards.forEach((c, i) => {
        c.style.opacity = '0';
        setTimeout(() => {
          grid.appendChild(c);
          c.style.transition = `opacity 0.3s ${i*0.05}s`;
          c.style.opacity = '1';
        }, 100);
      });
    });
  }

  /* ── NEWSLETTER ─────────────────────────────────────── */
  function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.newsletter-submit');
      const originalText = btn.textContent;
      btn.textContent = '✓ Inscrit !';
      btn.style.background = 'var(--accent-color)';
      showToast('Merci ! Vous recevrez nos offres exclusives', '📧');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        this.reset();
      }, 3000);
    });
  }

  /* ── HERO PARALLAX ──────────────────────────────────── */
  function initParallax() {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      bg.style.transform = `translateY(${y * 0.3}px)`;
    }, { passive: true });
  }

  /* ── COUNTER ANIMATION ──────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseFloat(el.dataset.count);
        const dec   = el.dataset.decimal || 0;
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const dur = 1800;
        const step = end / (dur / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { start = end; clearInterval(timer); }
          el.textContent = start.toFixed(dec) + suffix;
        }, 16);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  /* ── INIT ALL ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavbar();
    initScrollReveal();
    initSectionLines();
    initAddToCart();
    initWishlist();
    initSizeSelector();
    initGallery();
    initPriceRange();
    initFilter();
    initSort();
    initNewsletter();
    initParallax();
    initCounters();
    updateCartCount();

    if (document.getElementById('cart-items-container')) renderCartPage();

    // Stagger product cards
    document.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.animationDelay = (i * 0.08) + 's';
    });
  });

})();
