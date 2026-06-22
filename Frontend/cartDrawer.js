/* ════════════════════════════════════════════════════════
   CART DRAWER — extracted from shop.html
   Handles: cart icon click → slide-in panel, fetching cart
   items from the API, qty +/-, remove item, totals, checkout.
════════════════════════════════════════════════════════ */

/* ── Shared constants & helpers ── */
if (typeof DJANGO_BASE_URL === 'undefined') var DJANGO_BASE_URL = 'http://127.0.0.1:8000';

function getToken()    { return localStorage.getItem('bearer_token'); }
function authHeaders()  {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

/* ── Toast Notification System ── */
function showToast(title, subtitle = '', type = 'cart') {
  const icons = {
    cart:    '<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
    success: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    error:   '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>',
    info:    '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 8.25h.008v.008H12V8.25z"/>'
  };
  const container = document.getElementById('toast-container');
  const id = `toast-${Date.now()}`;
  const el = document.createElement('div');
  el.id = id;
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <svg class="toast-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[type] || icons.info}</svg>
    <div class="toast-body"><strong>${title}</strong>${subtitle ? `<span>${subtitle}</span>` : ''}</div>`;
  container.appendChild(el);
  requestAnimationFrame(() => { requestAnimationFrame(() => el.classList.add('show')); });
  setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

/* ── Update cart badge count ── */
function updateCartBadge(count) {
  document.querySelectorAll('#cart-count, #drawer-cart-count').forEach(el => {
    el.textContent = count;
  });
}

/* ── Open the sign-in modal and close the cart drawer at the same time ── */
function openAuthFromCart() {
  toggleCartDrawer(false);
  if (typeof window.showAuthModal === 'function') {
    window.showAuthModal();
  } else {
    window.location.href = 'Auth.html';
  }
}

/* ── Fetch & render the cart drawer contents ── */
async function fetchCartDrawer() {
  const token = getToken();
  const list  = document.getElementById('drawer-items-list');

  if (!token) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
        <svg class="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
        <p class="text-sm text-gray-500 font-medium">Sign in to view your cart</p>
        <a href="#" onclick="openAuthFromCart(); return false;" class="text-xs font-black uppercase tracking-widest text-[#E63E17] hover:underline">Sign In →</a>
      </div>`;
    updateCartBadge(0);
    return;
  }

  // Show skeleton while loading
  list.innerHTML = `
    <div class="skeleton-cart-row"><div class="sk-avatar skeleton-light"></div><div class="sk-lines"><div class="sk-l1 skeleton-light"></div><div class="sk-l2 skeleton-light"></div><div class="sk-l3 skeleton-light"></div></div></div>
    <div class="skeleton-cart-row"><div class="sk-avatar skeleton-light"></div><div class="sk-lines"><div class="sk-l1 skeleton-light"></div><div class="sk-l2 skeleton-light"></div><div class="sk-l3 skeleton-light"></div></div></div>`;

  try {
    const res  = await fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: authHeaders() });
    const data = await res.json();
    const items = data.items || [];

    updateCartBadge(items.length);

    if (items.length === 0) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
          <svg class="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
          <p class="text-sm text-gray-500 font-medium">Your cart is empty</p>
          <a href="shop.html" onclick="toggleCartDrawer(false)" class="text-xs font-black uppercase tracking-widest text-[#E63E17] hover:underline">Start Shopping →</a>
        </div>`;
      document.getElementById('drawer-subtotal').textContent = '0.00 MAD';
      document.getElementById('drawer-total').textContent    = '40.00 MAD';
      return;
    }

    let subtotal = 0;
    list.innerHTML = '';

    items.forEach(item => {
      const p     = item.product;
      const price = parseFloat(p.price);
      const line  = price * item.quantity;
      subtotal   += line;

      const row = document.createElement('div');
      row.id    = `drawer-item-${item.id}`;
      row.className = 'flex items-center gap-4 bg-gray-50 rounded-2xl p-3 group hover:bg-gray-100 transition-colors duration-200';
      const imgUrl = p.image ? (p.image.startsWith('http') ? p.image : `${DJANGO_BASE_URL}${p.image}`) : '';
      row.innerHTML = `
        <div class="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
          <img src="${imgUrl}" alt="${p.name}" class="w-full h-full object-contain p-1">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-black text-gray-900 leading-tight line-clamp-2">${p.name}</p>
          <p class="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">${p.category_name || ''}</p>
          <p class="text-xs font-black text-[#E63E17] font-mono mt-1">${price.toFixed(2)} MAD</p>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <button onclick="drawerRemoveItem(${p.id}, ${item.id})" class="text-gray-300 hover:text-red-500 transition-colors duration-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1 py-0.5">
            <button onclick="drawerUpdateQty(${p.id}, ${item.quantity - 1}, ${item.id})" class="qty-btn text-xs w-6 h-6">−</button>
            <span class="text-xs font-black w-4 text-center font-mono">${item.quantity}</span>
            <button onclick="drawerUpdateQty(${p.id}, ${item.quantity + 1}, ${item.id})" class="qty-btn text-xs w-6 h-6">+</button>
          </div>
        </div>`;
      list.appendChild(row);
    });

    const shipping = 40;
    document.getElementById('drawer-subtotal').textContent = `${subtotal.toFixed(2)} MAD`;
    document.getElementById('drawer-total').textContent    = `${(subtotal + shipping).toFixed(2)} MAD`;

  } catch (err) {
    console.error('Cart fetch error:', err);
    list.innerHTML = `<p class="text-center text-xs text-red-400 py-8">Failed to load cart. Is Django running?</p>`;
  }
}

/* ── Remove a single item from the cart ── */
async function drawerRemoveItem(productId, itemId) {
  const row = document.getElementById(`drawer-item-${itemId}`);
  if (row) { row.style.opacity = '0.4'; row.style.pointerEvents = 'none'; }
  try {
    await fetch(`${DJANGO_BASE_URL}/api/cart/`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    showToast('Removed', 'Item removed from cart', 'info');
    await fetchCartDrawer();
  } catch (err) {
    console.error('Remove error:', err);
    showToast('Error', 'Could not remove item', 'error');
    if (row) { row.style.opacity = '1'; row.style.pointerEvents = ''; }
  }
}

/* ── Update item quantity ── */
async function drawerUpdateQty(productId, newQty, itemId) {
  if (newQty <= 0) { return drawerRemoveItem(productId, itemId); }
  try {
    await fetch(`${DJANGO_BASE_URL}/api/cart/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId, quantity: newQty })
    });
    await fetchCartDrawer();
  } catch (err) {
    console.error('Update qty error:', err);
    showToast('Error', 'Could not update quantity', 'error');
  }
}

/* ── Helper: is the header actually visible on screen right now? ──
   Header is VISIBLE when it has 'header-at-top', 'header-top-dark',
   or 'header-sticky-active'. Header is HIDDEN when it has 'header-hidden'
   OR when it has none of the visible-state classes (index.html's scroll
   logic removes all classes during the mid-hero scroll state, relying on
   the CSS default transform: translateY(-100%) to hide it implicitly). ── */
function isHeaderVisible(header) {
  if (!header) return false;
  if (header.classList.contains('header-hidden')) return false;
  const visibleStates = ['header-at-top', 'header-top-dark', 'header-sticky-active'];
  return visibleStates.some(cls => header.classList.contains(cls));
}

/* ── Helper: position the drawer based on current header visibility ── */
function syncDrawerToHeader() {
  const drawer = document.getElementById('cart-drawer');
  const header = document.getElementById('site-header');
  if (!drawer) return;

  if (isHeaderVisible(header)) {
    drawer.style.top = '96px';
    drawer.style.height = 'calc(100% - 96px)';
  } else {
    drawer.style.top = '0';
    drawer.style.height = '100%';
  }
}

/* ── Open / close the cart drawer (called by the cart icon button) ── */
function toggleCartDrawer(open) {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const header  = document.getElementById('site-header');

  if (open) {
    syncDrawerToHeader();
    overlay.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
    drawer.classList.remove('translate-x-full');
    if (header) header.classList.add('above-drawer-overlay');
    fetchCartDrawer();
  } else {
    overlay.classList.add('opacity-0', 'pointer-events-none', 'invisible');
    drawer.classList.add('translate-x-full');
    if (header) header.classList.remove('above-drawer-overlay');
  }
}

/* ── Keep the drawer synced to the header while scrolling, on ANY page ──
   This works automatically across index.html, shop.html, and article.html
   regardless of which scroll-state classes each page uses. ── */
window.addEventListener('scroll', () => {
  const drawer = document.getElementById('cart-drawer');
  if (drawer && !drawer.classList.contains('translate-x-full')) {
    syncDrawerToHeader();
  }
}, { passive: true });

/* ── Add to Cart (single authoritative definition) ── */
async function addToCart(productId, quantity = 1) {
  const token = getToken();
  if (!token) {
    showToast('Sign in required', 'Please log in to add items to cart', 'error');
    return;
  }
  try {
    const res = await fetch(`${DJANGO_BASE_URL}/api/cart/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId, quantity })
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Added to Cart!', data.message || 'Item added successfully', 'cart');
      // Refresh badge count
      const cartRes  = await fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: authHeaders() });
      const cartData = await cartRes.json();
      updateCartBadge((cartData.items || []).length);
    } else {
      showToast('Error', data.error || data.detail || 'Failed to add item', 'error');
    }
  } catch (err) {
    showToast('Connection Error', 'Make sure Django is running on port 8000', 'error');
    console.error('addToCart error:', err);
  }
}

/* ── Go to Checkout ── */
function goToCheckout() {
  const token = getToken();
  if (!token) {
    showToast('Sign in required', 'Please log in to proceed to checkout', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

/* ── Keep the badge in sync with login/logout events elsewhere on the page ── */
document.addEventListener('auth-state-changed', (e) => {
  const t = e.detail.token;
  if (t) {
    fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => updateCartBadge((d.items || []).length))
      .catch(() => {});
  } else {
    updateCartBadge(0);
  }
});

/* ── On page load, fetch the badge count if the user is already logged in ── */
document.addEventListener('DOMContentLoaded', () => {
  const t = getToken();
  if (t) {
    fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => updateCartBadge((d.items || []).length))
      .catch(() => {});
  }
});
