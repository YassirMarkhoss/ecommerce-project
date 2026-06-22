/**
 * Dynamically injected across all pages to handle user auth seamlessly with state-of-the-art UI.
 */

(function () {
  const DJANGO_API_BASE = 'http://127.0.0.1:8000/api';
  let modalActiveTab = 'login'; // 'login' or 'signup'

  /* ── Helper: check if JWT is expired (or malformed) ── */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false; // no exp claim, assume valid
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true; // can't decode = treat as invalid
  }
}

/* ── Helper: get a valid token, or clear it if expired ── */
function getValidToken() {
  const token = localStorage.getItem('bearer_token');
  if (!token) return null;
  if (isTokenExpired(token)) {
    localStorage.removeItem('bearer_token');
    return null;
  }
  return token;
}

  // Load and inject dynamic Auth UI
  document.addEventListener('DOMContentLoaded', () => {
    initAuthDropdown();
    injectAuthModalHTML();
    bindAccountIconClick();
    updateHeaderAuthState();
    setInterval(updateHeaderAuthState, 30000);

    // Auto popup login modal if query param is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show_login') === 'true') {
      setTimeout(() => {
        if (typeof showAuthModal === 'function') {
          showAuthModal();
        }
      }, 400);
    }
  });

  /* ── 1. Initialize user dropdown wrapper ── */
  function initAuthDropdown() {
    const accountLinks = document.querySelectorAll('a[href="Auth.html"]');
    
    accountLinks.forEach(link => {
      const hasSvg = link.querySelector('svg');
      if (hasSvg) {
        link.classList.add('auth-modal-trigger');
        
        // Wrap link in relative container for dropdown rendering
        const wrapper = document.createElement('div');
        wrapper.className = 'relative inline-block global-user-container';
        link.parentNode.insertBefore(wrapper, link);
        wrapper.appendChild(link);

        // Inject high-end dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.id = 'global-auth-dropdown';
        dropdown.className = 'absolute right-0 mt-3 w-56 bg-[#0e1424]/95 border border-white/10 rounded-2xl shadow-2xl py-2 z-[9999] hidden opacity-0 scale-95 origin-top-right transition-all duration-200 text-sm backdrop-blur-xl';
        dropdown.innerHTML = `
          <div class="px-4 py-3 border-b border-white/5">
            <span class="block text-[9px] text-[#E63E17] font-black uppercase tracking-widest">Signed In As</span>
            <span id="dropdown-user-email" class="block text-xs text-white truncate font-bold mt-0.5 font-mono">user@example.com</span>
          </div>
          <a href="wishlist.html" class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 hover:text-white text-gray-300 transition-colors font-medium">
            <svg class="w-4 h-4 text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>
            My Wishlist
          </a>
          <a href="cart.html" class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 hover:text-white text-gray-300 transition-colors font-medium">
            <svg class="w-4 h-4 text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            My Shopping Cart
          </a>
          <a href="settings.html" class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 hover:text-white text-gray-300 transition-colors font-medium">
            <svg class="w-4 h-4 text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
            Settings
          </a>
          <button id="global-logout-btn" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors text-left border-t border-white/5 mt-1.5 font-black uppercase tracking-widest text-[10px]">
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
            Sign Out
          </button>
        `;
        wrapper.appendChild(dropdown);

        // Bind logout click
        dropdown.querySelector('#global-logout-btn').addEventListener('click', handleLogout);
      } else {
        link.classList.add('auth-modal-trigger-mobile');
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('global-auth-dropdown');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        const container = document.querySelector('.global-user-container');
        if (container && !container.contains(e.target)) {
          hideDropdown();
        }
      }
    });
  }

  /* ── 2. Inject Modal Overlay with Premium Glass/Orb UI into Body ── */
  function injectAuthModalHTML() {
    if (document.getElementById('global-auth-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-auth-modal-overlay';
    // Start with display:none (hidden) to prevent any click blocking
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300 hidden';
    overlay.innerHTML = `
      <div id="global-auth-modal" class="relative w-full max-w-md bg-[#0e1424]/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl scale-95 transition-all duration-300 text-white backdrop-blur-xl overflow-hidden">
        
        <!-- Ambient decorative background glows inside modal -->
        <div class="pointer-events-none absolute -top-16 -left-16 w-36 h-36 bg-[#E63E17]/20 rounded-full blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-16 -right-16 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl"></div>

        <!-- Close Button -->
        <button id="modal-close-btn" class="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors focus:outline-none z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
        </button>

        <!-- Brand Header Section -->
        <div class="text-center mb-6 relative z-10">
          <span class="block text-[9px] font-black text-[#E63E17] tracking-[0.2em] uppercase mb-1">Elevate Your Potential</span>
          <img src="images/pok1.png" alt="Fitness Premium" class="h-24 w-auto object-contain mx-auto" style="max-width: 200px;">
          <p id="modal-subtitle" class="text-xs text-gray-400 mt-2 font-medium">Sign in to your premium fitness profile</p>
        </div>

        <!-- Premium Sliding Pill Tab Selectors -->
        <div class="relative flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 mb-6 z-10">
          <!-- Sliding indicator highlight block -->
          <div id="modal-tab-highlight" class="absolute top-1 bottom-1 left-1.5 w-[calc(50%-6px)] bg-[#E63E17] rounded-xl transition-all duration-300 ease-out shadow-lg shadow-orange-500/15"></div>
          
          <button id="tab-btn-login" class="relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white focus:outline-none transition-colors">Sign In</button>
          <button id="tab-btn-signup" class="relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-gray-400 focus:outline-none transition-colors">Create Account</button>
        </div>

        <!-- Global Alert Box inside Modal -->
        <div id="modal-alert-box" class="hidden p-3.5 rounded-2xl text-xs font-bold mb-5 border relative z-10"></div>

        <!-- Forms Container -->
        <div class="relative z-10">
          <!-- LOGIN FORM -->
          <form id="modal-login-form" class="space-y-4">
            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <div class="relative group">
                <!-- SVG Icon -->
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                <input type="email" id="modal-login-email" required placeholder="name@email.com" class="checkout-input pl-11 font-mono">
              </div>
            </div>
            <!-- Password -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <div class="relative group">
                <!-- SVG Icon -->
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 10.5h13.5c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H5.25c-.621 0-1.125.504-1.125 1.125v8.25c0 .621.504 1.125 1.125 1.125z"/></svg>
                <input type="password" id="modal-login-password" required placeholder="••••••••" class="checkout-input pl-11 pr-12">
                <button type="button" class="pw-toggle-btn absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" data-input-id="modal-login-password">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
              </div>
            </div>
            <!-- Submit -->
            <button type="submit" class="w-full bg-gradient-to-r from-[#E63E17] to-[#ff5d38] hover:from-[#C5310F] hover:to-[#E63E17] text-white font-black py-3.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 btn-lift mt-2 uppercase tracking-widest">
              <svg id="modal-login-spinner" class="hidden w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span id="modal-login-btn-text">Sign In</span>
            </button>
          </form>

          <!-- SIGNUP FORM -->
          <form id="modal-signup-form" class="space-y-4 hidden">
            <!-- First & Last Name -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">First Name</label>
                <div class="relative group">
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                  <input type="text" id="modal-signup-firstname" required placeholder="John" class="checkout-input pl-11">
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name</label>
                <div class="relative group">
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                  <input type="text" id="modal-signup-lastname" required placeholder="Doe" class="checkout-input pl-11">
                </div>
              </div>
            </div>
            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <div class="relative group">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>
                <input type="email" id="modal-signup-email" required placeholder="name@email.com" class="checkout-input pl-11 font-mono">
              </div>
            </div>
            <!-- Password -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</label>
              <div class="relative group">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-[#E63E17]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 10.5h13.5c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H5.25c-.621 0-1.125.504-1.125 1.125v8.25c0 .621.504 1.125 1.125 1.125z"/></svg>
                <input type="password" id="modal-signup-password" required placeholder="••••••••" class="checkout-input pl-11 pr-12">
                <button type="button" class="pw-toggle-btn absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" data-input-id="modal-signup-password">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
              </div>
            </div>
            <!-- Submit -->
            <button type="submit" class="w-full bg-gradient-to-r from-[#E63E17] to-[#ff5d38] hover:from-[#C5310F] hover:to-[#E63E17] text-white font-black py-3.5 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 btn-lift mt-2 uppercase tracking-widest">
              <svg id="modal-signup-spinner" class="hidden w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span id="modal-signup-btn-text">Create Account</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind Event Listeners inside injected DOM
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hideAuthModal();
    });

    document.getElementById('modal-close-btn').addEventListener('click', hideAuthModal);
    document.getElementById('tab-btn-login').addEventListener('click', () => switchModalTab('login'));
    document.getElementById('tab-btn-signup').addEventListener('click', () => switchModalTab('signup'));

    // Form Submissions
    document.getElementById('modal-login-form').addEventListener('submit', handleLoginSubmit);
    document.getElementById('modal-signup-form').addEventListener('submit', handleSignupSubmit);

    // Password visibility toggle
    overlay.querySelectorAll('.pw-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inputId = btn.getAttribute('data-input-id');
        const input = document.getElementById(inputId);
        const icon = btn.querySelector('svg');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        icon.innerHTML = show
          ? `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>`
          : `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`;
      });
    });
  }

  /* ── 3. Bind Clicks on Header Account Icons ── */
  function bindAccountIconClick() {
    const triggers = document.querySelectorAll('.auth-modal-trigger, .auth-modal-trigger-mobile');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isLoggedIn = !!localStorage.getItem('bearer_token');

        if (!isLoggedIn) {
          showAuthModal();
        } else {
          if (trigger.classList.contains('auth-modal-trigger')) {
            toggleDropdown();
          } else {
            if (confirm("Would you like to Sign Out of NPNG?")) {
              handleLogout();
            }
          }
        }
      });
    });
  }

  /* ── 4. Dropdown Toggle Functions ── */
  function toggleDropdown() {
    const dropdown = document.getElementById('global-auth-dropdown');
    if (!dropdown) return;
    
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      showDropdown();
    } else {
      hideDropdown();
    }
  }

  function showDropdown() {
    const dropdown = document.getElementById('global-auth-dropdown');
    if (!dropdown) return;

    const validToken = getValidToken();
    if (!validToken) {
      // Token expired — force logout state instead of showing a stale dropdown
      handleLogout();
      return;
    }
    const email = decodeEmailFromToken(validToken) || 'Member';
    document.getElementById('dropdown-user-email').textContent = email;

    dropdown.classList.remove('hidden');
    requestAnimationFrame(() => {
      dropdown.classList.remove('opacity-0', 'scale-95');
      dropdown.classList.add('opacity-100', 'scale-100');
    });
  }

  function hideDropdown() {
    const dropdown = document.getElementById('global-auth-dropdown');
    if (!dropdown) return;

    dropdown.classList.remove('opacity-100', 'scale-100');
    dropdown.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
      dropdown.classList.add('hidden');
    }, 200);
  }

  /* ── 5. Modal Visual Controllers (Fixed & Bug-Free) ── */
  window.showAuthModal = function() {
    const overlay = document.getElementById('global-auth-modal-overlay');
    const modal = document.getElementById('global-auth-modal');
    if (!overlay || !modal) return;

    hideAlert();
    overlay.classList.remove('hidden');
    
    // Trigger reflow so browser registers transition from display:none to block
    void overlay.offsetWidth;

    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.classList.add('opacity-100');
    modal.classList.remove('scale-95');
    modal.classList.add('scale-100');
  };

  window.hideAuthModal = function() {
    const overlay = document.getElementById('global-auth-modal-overlay');
    const modal = document.getElementById('global-auth-modal');
    if (!overlay || !modal) return;

    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('scale-100');
    modal.classList.add('scale-95');

    // Clean up: hide elements completely from DOM interaction tree after transition ends
    const cleanupModal = () => {
      overlay.classList.add('hidden');
      overlay.removeEventListener('transitionend', cleanupModal);
    };
    overlay.addEventListener('transitionend', cleanupModal);

    // Timeout safety fallback (for environments where transitionend fails to fire)
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 350);
  };

  function switchModalTab(tab) {
    modalActiveTab = tab;
    const loginForm = document.getElementById('modal-login-form');
    const signupForm = document.getElementById('modal-signup-form');
    const loginTab = document.getElementById('tab-btn-login');
    const signupTab = document.getElementById('tab-btn-signup');
    const subtitle = document.getElementById('modal-subtitle');
    const highlight = document.getElementById('modal-tab-highlight');

    hideAlert();

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      loginTab.classList.remove('text-gray-400');
      loginTab.classList.add('text-white');
      signupTab.classList.remove('text-white');
      signupTab.classList.add('text-gray-400');
      subtitle.textContent = 'Sign in to your premium fitness profile';
      highlight.style.transform = 'translateX(0%)';
    } else {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      loginTab.classList.remove('text-white');
      loginTab.classList.add('text-gray-400');
      signupTab.classList.remove('text-gray-400');
      signupTab.classList.add('text-white');
      subtitle.textContent = 'Join the NoPainNoGain athletic community';
      highlight.style.transform = 'translateX(100%)';
    }
  }

  /* ── 6. Form Handlers ── */
  async function handleLoginSubmit(e) {
    e.preventDefault();
    hideAlert();
    
    const email = document.getElementById('modal-login-email').value.trim();
    const password = document.getElementById('modal-login-password').value;
    const spinner = document.getElementById('modal-login-spinner');
    const btnText = document.getElementById('modal-login-btn-text');

    if (!email || !password) {
      showModalAlert('Please fill in all details.');
      return;
    }

    spinner.classList.remove('hidden');
    btnText.textContent = 'Verifying...';

    try {
      const response = await fetch(`${DJANGO_API_BASE}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, email: email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('bearer_token', data.access);
        updateHeaderAuthState();
        hideAuthModal();
        
        document.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { token: data.access } }));
        
        if (typeof showToast === 'function') {
          showToast('Sign In', 'Login successful! Profile synced.', 'success');
        }
      } else {
        showModalAlert(data.detail || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showModalAlert('Network error. Is the server running on port 8000?');
    } finally {
      spinner.classList.add('hidden');
      btnText.textContent = 'Sign In';
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    hideAlert();

    const firstName = document.getElementById('modal-signup-firstname').value.trim();
    const lastName = document.getElementById('modal-signup-lastname').value.trim();
    const email = document.getElementById('modal-signup-email').value.trim();
    const password = document.getElementById('modal-signup-password').value;
    
    const spinner = document.getElementById('modal-signup-spinner');
    const btnText = document.getElementById('modal-signup-btn-text');

    if (!firstName || !lastName || !email || !password) {
      showModalAlert('Please fill in all fields.');
      return;
    }

    const username = (firstName + lastName).replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);

    spinner.classList.remove('hidden');
    btnText.textContent = 'Creating...';

    try {
      const response = await fetch(`${DJANGO_API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, first_name: firstName, last_name: lastName, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        switchModalTab('login');
        document.getElementById('modal-login-email').value = email;
        document.getElementById('modal-login-password').value = password;
        showModalAlert('Account created successfully! Please click Sign In.', 'success');
      } else {
        let errStr = '';
        if (data.email) errStr += data.email.join(' ') + ' ';
        if (data.username) errStr += data.username.join(' ') + ' ';
        if (data.password) errStr += data.password.join(' ') + ' ';
        showModalAlert(errStr || 'Failed to create account. Check inputs.');
      }
    } catch (err) {
      console.error(err);
      showModalAlert('Network error. Could not register account.');
    } finally {
      spinner.classList.add('hidden');
      btnText.textContent = 'Create Account';
    }
  }

  /* ── 7. Logout Handler ── */
  function handleLogout() {
    localStorage.removeItem('bearer_token');
    hideDropdown();
    updateHeaderAuthState();
    
    document.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { token: null } }));

    if (typeof showToast === 'function') {
      showToast('Sign Out', 'Logged out successfully.', 'info');
    }

    if (window.location.pathname.includes('checkout.html')) {
      window.location.href = 'shop.html';
    } else {
      if (typeof renderCart === 'function') {
        renderCart();
      }
    }
  }

  /* ── 8. Update Header UI dynamically ── */
  function updateHeaderAuthState() {
    const isLoggedIn = !!getValidToken();
    const accountTriggers = document.querySelectorAll('.auth-modal-trigger');

    accountTriggers.forEach(trigger => {
      if (isLoggedIn) {
        trigger.classList.add('text-[#E63E17]');
        trigger.classList.remove('text-white');
        trigger.style.color = '#E63E17';
      } else {
        trigger.classList.remove('text-[#E63E17]');
        trigger.classList.add('text-white');
        trigger.style.color = '';
      }
    });

    const mobileTriggers = document.querySelectorAll('.auth-modal-trigger-mobile');
    mobileTriggers.forEach(link => {
      if (isLoggedIn) {
        link.textContent = 'SIGN OUT';
      } else {
        link.textContent = 'MY ACCOUNT';
      }
    });
  }

  /* ── Helper: Alert messages ── */
  function showModalAlert(msg, type = 'error') {
    const alertBox = document.getElementById('modal-alert-box');
    if (!alertBox) return;

    alertBox.textContent = msg;
    alertBox.className = 'p-3.5 rounded-xl text-xs font-semibold mb-4 border z-10';
    
    if (type === 'error') {
      alertBox.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20');
    } else {
      alertBox.classList.add('bg-green-500/10', 'text-green-400', 'border-green-500/20');
    }
    
    alertBox.classList.remove('hidden');
  }

  function hideAlert() {
    const alertBox = document.getElementById('modal-alert-box');
    if (alertBox) alertBox.classList.add('hidden');
  }

  /* ── Helper: JWT decoder ── */
  function decodeEmailFromToken(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload.email || payload.username || 'Active Profile';
    } catch (e) {
      return null;
    }
  }

})();
