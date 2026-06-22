// =========================================================================
// 1. GLOBAL VARIABLES & CORE SETUP
// =========================================================================
let HOME_PRODUCTS = [];
let currentHomeCategory = 'supplements';

// =========================================================================
// 2. DOM CONTENT LOADED WIDGETS (Initializations)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  
  // --- A. مراقب الأقسام العادية (Intersection Observers) ---
  const middleScreenOptions = {
    root: null,
    rootMargin: "-10% 0px -20% 0px", 
    threshold: 0.35 
  };

  // 1. مراقب قسم FOR ATHLETES
  const athletesSection = document.getElementById('for-athletes');
  const athletesCards = document.querySelectorAll('.reveal-card');

  if (athletesSection && athletesCards.length > 0) {
    const athletesObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            athletesCards.forEach(card => {
              card.classList.remove('opacity-0');
              card.classList.add('animate-slide-up-fade');
            });
          }, 150);
          observer.unobserve(entry.target);
        }
      });
    }, middleScreenOptions);
    athletesObserver.observe(athletesSection);
  }

  // 2. مراقب قسم THE BENEFITS
  const benefitsSection = document.getElementById('benefits');
  const imagesContainer = document.querySelector('.benefits-images-reveal');
  const headerContainer = document.querySelector('.benefits-header-reveal');
  const benefitRows = document.querySelectorAll('.benefit-row');
  const btnContainer = document.querySelector('.benefits-btn-reveal');

  if (benefitsSection) {
    const benefitsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (imagesContainer) imagesContainer.classList.remove('opacity-0');
          setTimeout(() => {
            if (headerContainer) headerContainer.classList.remove('opacity-0');
          }, 150);
          benefitRows.forEach((row, index) => {
            setTimeout(() => {
              row.classList.remove('opacity-0');
            }, 300 + (index * 120));
          });
          setTimeout(() => {
            if (btnContainer) btnContainer.classList.remove('opacity-0');
          }, 750);
          observer.unobserve(entry.target);
        }
      });
    }, middleScreenOptions);
    benefitsObserver.observe(benefitsSection);
  }

  // 3. مراقب قسم OUR PRODUCTS GRID
  const productRows = document.querySelectorAll('.products-row');
  if (productRows.length > 0) {
    productRows.forEach(row => {
      const rowObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cardsInRow = entry.target.querySelectorAll('.product-card');
            cardsInRow.forEach((card, index) => {
              setTimeout(() => {
                card.classList.remove('opacity-0', '-translate-x-4');
              }, index * 150); 
            });
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.30
      });
      rowObserver.observe(row);
    });
  }

  // 4. مراقب الـ Category Content (الـ Wave Effect الأصلي)
  const productSectionContainer = document.querySelector('.category-content:not(.hidden)');
  if (productSectionContainer) {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          applyWaveEffect(entry.target.id);
          observerInstance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(productSectionContainer);
  }

  // --- B. التمرير السلس (Smooth Scroll) للأقسام ---
  const prodLink = document.querySelector('a[href="#products-section"]');
  const contactLink = document.querySelector('a[href="#contact-section"]');

  if (prodLink) {
    prodLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('products-section');
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (contactLink) {
    contactLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('contact-section');
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // تشغيل جلب المنتجات فوراً عند تحميل الصفحة
  fetchHomeProducts();

  // Load cart badge on page load
  const t = getToken();
  if (t) {
    fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        const badge = document.querySelector('#cart-count') || document.querySelector('header a[href="cart.html"] span');
        if (badge) badge.textContent = (d.items || []).length;
      })
      .catch(() => {});
  }
});

// =========================================================================
// 3. ULTIMATE STICKY REVEAL (NO-JUMP & PERFECT DROP DOWN)
// =========================================================================
(function() {
  const siteHeader = document.getElementById('site-header');
  const athletesSec = document.getElementById('for-athletes'); 

  if (!siteHeader || !athletesSec) return;

  // عند بداية التحميل، تأكد بلي الكلاس د الفوق راكبة
  if (window.scrollY < 50) {
    siteHeader.classList.add('header-at-top');
  }

  function handleHeaderScroll() {
    const athletesTop = athletesSec.offsetTop;
    const scrollPos = window.scrollY;

    // الحالة 1: المستخدم الفوق كاع ف الـ Hero (طبيعي وشفاف)
    if (scrollPos < 50) {
      // نوقفوا الـ transition باش مايديرش أنيميشن غريبة ف أول سكرول
      siteHeader.classList.add('no-transition');
      siteHeader.classList.add('header-at-top');
      siteHeader.classList.remove('header-sticky-active');
    }
    // الحالة 2: المستخدم هبط وسط الـ Hero (كنخبيوه الفوق بـ -100% ويوجد راسو)
    else if (scrollPos >= 50 && scrollPos < athletesTop - 120) {
      siteHeader.classList.remove('no-transition'); // نرجعو الـ transition دابا
      siteHeader.classList.remove('header-at-top', 'header-sticky-active');
    }
    // الحالة 3: اللقطة المنتظرة! وصلنا للقسم الأبيض، كينزل كـ Slide Down حقيقي
    else if (scrollPos >= athletesTop - 120) {
      siteHeader.classList.remove('no-transition');
      siteHeader.classList.remove('header-at-top');
      siteHeader.classList.add('header-sticky-active');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll);
  window.addEventListener('DOMContentLoaded', handleHeaderScroll);
})();

// =========================================================================
// 4. MOBILE MENU & SEARCH OVERLAY LOGIC
// =========================================================================
(function() {
  const searchBtn = document.getElementById('search-btn');
  const closeSearch = document.getElementById('close-search');
  const searchPanel = document.getElementById('search-panel');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      searchPanel.classList.remove('-translate-y-full', 'pointer-events-none', 'opacity-0');
      searchPanel.classList.add('translate-y-0', 'pointer-events-auto', 'opacity-100');
      const searchInput = document.getElementById('search-input');
      setTimeout(() => { if(searchInput) searchInput.focus(); }, 200);
    });
  }

  function closeSearchPanel() {
    if(searchPanel) {
      searchPanel.classList.remove('translate-y-0', 'pointer-events-auto', 'opacity-100');
      searchPanel.classList.add('-translate-y-full', 'pointer-events-none', 'opacity-0');
    }
    // إخفاء صندوق الاقتراحات فاش كيتسد البانيل
    const suggestionsBox = document.getElementById('suggestions-box');
    if (suggestionsBox) suggestionsBox.classList.add('hidden');
  }

  if (closeSearch) {
    closeSearch.addEventListener('click', closeSearchPanel);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearchPanel();
  });

  // الدالة لي كتهز الكلمة وتصيفط المستخدم لصفحة المتجر نياشن
  function runSearchQuery() {
    const field = document.getElementById('search-input');
    if (field) {
      const query = field.value.trim();
      if (query !== "") {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
      }
    }
  }

  // تنفيذ البحث عند ضغط زر Enter
  document.addEventListener('keydown', (e) => {
    const field = document.getElementById('search-input');
    if (e.key === 'Enter' && document.activeElement === field) {
      e.preventDefault();
      runSearchQuery();
    }
  });
})();


// =========================================================================
// 4.5 ABSOLUTE LIVE SEARCH (PERFECT POSITION & NO REDIRECT)
// =========================================================================
(function() {
  const searchInput = document.getElementById('search-input');
  const suggestionsBox = document.getElementById('suggestions-box');

  if (!searchInput || !suggestionsBox) return;

  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    // إخفاء الصندوق وتنظيفه إذا كان البحث فارغاً أو أقل من حرفين
    if (query.length < 2) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.add('hidden');
      return;
    }

    try {
      // الـ Fetch من الـ Backend ديالك مع تمرير كلمة البحث
      const response = await fetch(`http://127.0.0.1:8000/api/products/?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search fetch failed");
      const products = await response.json();

      if (products.length === 0) {
        suggestionsBox.innerHTML = `
          <div class="text-center py-6 text-gray-400 text-sm font-medium">
            No products found matching "${query}"
          </div>`;
        suggestionsBox.classList.remove('hidden');
        return;
      }

      // رسم أحدث 5 نتائج بستايل لستة (List) عمودية فخمة
      suggestionsBox.innerHTML = products.slice(0, 5).map(product => {
        const currentPrice = parseFloat(product.price).toFixed(2);
        return `
          <div class="search-result-item flex items-center justify-between p-3 mb-2 last:mb-0 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.07] hover:border-white/15 transition-all duration-200 cursor-pointer" data-id="${product.id}">
              <div class="flex items-center gap-4 min-w-0">
                  <div class="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src="${product.image}" alt="${product.name}" class="h-full object-contain" draggable="false">
                  </div>
                  <div class="min-w-0">
                      <span class="text-[9px] text-[#E63E17] uppercase tracking-widest font-extrabold block">${product.category_name}</span>
                      <h5 class="text-sm font-semibold text-white truncate mt-0.5">${product.name}</h5>
                  </div>
              </div>
              <div class="flex items-center gap-3 shrink-0 ml-4">
                  <span class="text-xs font-mono font-bold text-gray-300">${currentPrice} MAD</span>
                  <div class="text-gray-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                  </div>
              </div>
          </div>
        `;
      }).join('');
      
      suggestionsBox.classList.remove('hidden');

      // عند كليك المستخدم على أي منتج، كيمشي لصفحة الـ detail ديالو
      document.querySelectorAll('.search-result-item').forEach(element => {
        element.addEventListener('click', () => {
          const prodId = element.getAttribute('data-id');
          window.location.href = `product-detail.html?id=${prodId}`;
        });
      });

    } catch (error) {
      console.error("Error during live search:", error);
    }
  });

  // منع زر Enter باش ما يعملش ريفريش أو يحول الصفحة فجأة
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });

  // إخفاء الصندوق التلقائي إذا ضغط المستخدم خارج نطاق البحث
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hidden');
    }
  });
})();


// =========================================================================
// 5. STAGGERED CARD REVEAL ON SCROLL (LEFT TO RIGHT)
// =========================================================================
(function() {
  document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll('.product-card-animate');
    
    if (cards.length === 0) return;

    // إعداد المراقب الذكي
    const observerOptions = {
      root: null, // كايراقب شاشة المتصفح كاملة
      threshold: 0.15 // غايبدا الأنيميشن غير تبان 15% من الكارطة ف الشاشة
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
      // غي يوصل المستخدم للقسم
      if (entries[0].isIntersecting) {
        
        // دوز على الكارطات بالترتيب وتطبيق الـ Stagger Effect
        cards.forEach((card, index) => {
          setTimeout(() => {
            // تحييد الاختفاء ورفع الكارطة لمكانها الطبيعي
            card.classList.remove('opacity-0', 'translate-y-8');
            card.classList.add('opacity-100', 'translate-y-0');
          }, index * 150); // 150ms د الـ Delay بين كل كارطة وأختها من اليسار لليمن
        });

        // نطفيو المراقب على هاد العناصر حيت صافي داروا الأنيميشن ومابغيناهمش يتعاودو كل مرة
        observer.disconnect();
      }
    }, observerOptions);

    // بما أن الكارطات كاملين ف نفس الصف، نقدرو نراقبوا غير الكارطة الأولى باش نطلقو الأنيميشن كاملة
    cardObserver.observe(cards[0]);
  });
})();

// =========================================================================
// 6. CATEGORY SWITCH & WAVE EFFECTS
// =========================================================================
function applyWaveEffect(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = container.querySelectorAll('.product-card');
  products.forEach((product, index) => {
    product.style.animation = 'none';
    product.offsetHeight; 
    product.style.animation = 'waveUpIn 0.85s cubic-bezier(0.215, 0.610, 0.355, 1) forwards';
    product.style.animationDelay = `${index * 0.25}s`;
  });
}

function switchCategory(categoryName) {
  const allContents = document.querySelectorAll('.category-content');
  allContents.forEach(content => {
    content.classList.add('hidden', 'opacity-0');
    content.classList.remove('block', 'opacity-100');
  });

  const activeContainerId = 'cat-' + categoryName;
  const activeContent = document.getElementById(activeContainerId);
  
  if (activeContent) {
    activeContent.classList.remove('hidden');
    setTimeout(() => {
      activeContent.classList.add('block', 'opacity-100');
      applyWaveEffect(activeContainerId);
    }, 10);
  }

  const allButtons = document.querySelectorAll('.tab-btn');
  allButtons.forEach(btn => {
    btn.classList.remove('bg-[#E63E17]', 'text-white', 'shadow-sm');
    btn.classList.add('text-gray-400', 'hover:text-gray-700');
  });

  const activeLabel = document.getElementById('tab-' + categoryName);
  if (activeLabel) {
    activeLabel.classList.remove('text-gray-400', 'hover:text-gray-700');
    activeLabel.classList.add('bg-[#E63E17]', 'text-white', 'shadow-sm');
  }
}

// =========================================================================
// 7. BACKEND API: HOME PRODUCTS FETCH & RENDER (Tabs Router)
// =========================================================================
async function fetchHomeProducts() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/products/');
    if (!response.ok) throw new Error("Failed to fetch products");
    HOME_PRODUCTS = await response.json();
    renderHomeProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function switchHomeCategory(categorySlug, buttonElement) {
  currentHomeCategory = categorySlug.toLowerCase();
  
  document.querySelectorAll('.home-tab-btn').forEach(btn => {
    btn.classList.remove('bg-[#E63E17]', 'text-white', 'shadow-sm');
    btn.classList.add('text-gray-500');
  });
  
  buttonElement.classList.add('bg-[#E63E17]', 'text-white', 'shadow-sm');
  buttonElement.classList.remove('text-gray-500');
  
  renderHomeProducts();
}

function renderHomeProducts() {
  const grid = document.getElementById('home-products-grid');
  if (!grid) return;
  
  grid.innerHTML = ''; 

  let filtered = HOME_PRODUCTS.filter(product => {
    const pCatName = (product.category_name || "").toLowerCase();
    const pSubCatSlug = (product.subcategory_slug || "").toLowerCase();
    
    if (currentHomeCategory === 'gymwear' || currentHomeCategory === 'gym wear') {
      return pCatName.includes('gymwear') || pSubCatSlug.includes('gymwear') ||
             pCatName.includes('gym wear') || pSubCatSlug.includes('gym wear') ||
             pCatName.includes('apparel')  || pCatName.includes('clothe');
    }
    if (currentHomeCategory === 'accessories') {
      return pCatName.includes('accessorie') || pSubCatSlug.includes('accessorie');
    }
    if (currentHomeCategory === 'supplements') {
      return pCatName.includes('supplement') || pSubCatSlug.includes('supplement');
    }
    return pCatName.includes(currentHomeCategory) || pSubCatSlug.includes(currentHomeCategory);
  });

  filtered.sort(() => Math.random() - 0.5);
  const random8 = filtered.slice(0, 8);

  if (random8.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-12 font-medium">No products found in ${currentHomeCategory}.</p>`;
    return;
  }

  random8.forEach(product => {
    let oldPriceMarkup = '';
    let discountBadgeMarkup = '';
    const currentPrice = parseFloat(product.price).toFixed(2);
    
    const isApparel = product.category_name.toLowerCase().includes('apparel') || 
                      product.category_name.toLowerCase().includes('clothe') ||
                      product.category_name.toLowerCase().includes('wear');
    const imgSizeClass = isApparel ? 'h-52 w-full object-contain' : 'h-48 object-contain';

    if (product.old_price && parseFloat(product.old_price) > parseFloat(product.price)) {
      oldPriceMarkup = `<span class="text-xs text-gray-400 line-through font-mono">${parseFloat(product.old_price).toFixed(2)} MAD</span>`;
      const discountPercentage = Math.round(((parseFloat(product.old_price) - parseFloat(product.price)) / parseFloat(product.old_price)) * 100);
      discountBadgeMarkup = `
        <div class="border border-[#E63E17] text-[#E63E17] text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white shadow-sm shrink-0 ml-auto">
            Save ${discountPercentage}%
        </div>`;
    }

    const cardHTML = `
      <div onclick="window.location.href='product-detail.html?id=${product.id}'" class="product-card-animate group bg-white border border-gray-200 rounded-[2.5rem] flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-gray-100/70 relative h-[410px] cursor-pointer">
          <div class="relative bg-transparent p-6 pb-0 h-60 w-full flex items-center justify-center overflow-hidden shrink-0">
              <img src="${product.image}" alt="${product.name}" class="${imgSizeClass} transition-transform duration-500 group-hover:scale-105" draggable="false">
              <div class="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
                  <button onclick="event.stopPropagation(); addToWishlist('${product.name.replace(/'/g, "\\'")}', '${currentPrice} MAD', '${product.image}', ${product.id})" class="w-9 h-9 bg-white hover:bg-[#E63E17] hover:text-white text-gray-700 rounded-full border border-gray-100 shadow-sm flex items-center justify-center transition-all duration-200">
                      <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </button>
                  <button onclick="event.stopPropagation();" class="w-9 h-9 bg-white hover:bg-[#E63E17] hover:text-white text-gray-700 rounded-full border border-gray-100 shadow-sm flex items-center justify-center transition-all duration-200">
                      <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M4.5 12c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3"/></svg>
                  </button>
                  <button onclick="event.stopPropagation();" class="w-9 h-9 bg-white hover:bg-[#E63E17] hover:text-white text-gray-700 rounded-full border border-gray-100 shadow-sm flex items-center justify-center transition-all duration-200">
                      <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
              </div>
          </div>
          <div class="relative flex-1 flex flex-col justify-end overflow-hidden">
              <div class="px-6 pb-6 pt-1 transition-transform duration-300 ease-out transform group-hover:-translate-y-12">
                  <span class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">${product.category_name}</span>
                  <h4 class="text-[15px] font-bold text-gray-900 hover:text-[#E63E17] transition-colors duration-200 line-clamp-1 mt-0.5 inline-block w-full">${product.name}</h4>
                  <div class="flex items-center gap-2 pt-1.5 w-full">
                      <div class="flex flex-col">
                          <span class="text-sm font-bold text-gray-900 font-mono">${currentPrice} MAD</span>
                          ${oldPriceMarkup}
                      </div>
                      ${discountBadgeMarkup}
                  </div>
              </div>
              <button onclick="event.stopPropagation(); addToCart(${product.id})" class="absolute bottom-0 left-0 w-full bg-[#E63E17] hover:bg-[#D4330F] text-white font-bold py-4 px-6 text-xs transition-all duration-300 ease-out flex items-center justify-between uppercase tracking-wider active:scale-[0.99] z-10 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer">
                  <span>Add To Cart</span>
              </button>
          </div>
      </div>
    `;
    grid.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// =========================================================================
// 8. BMI CALCULATOR WIDGET
// =========================================================================
let isMetric = true;
const toggleMetric = document.getElementById('toggle-metric');
const toggleImperial = document.getElementById('toggle-imperial');
const heightLabel = document.getElementById('height-label');
const weightLabel = document.getElementById('weight-label');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const calculateBtn = document.getElementById('calculate-btn');
const resultsPanel = document.getElementById('results-panel');
const bmiValue = document.getElementById('bmi-value');
const bmiStatus = document.getElementById('bmi-status');
const bmiAdvice = document.getElementById('bmi-advice');

if (toggleMetric && toggleImperial) {
  toggleMetric.addEventListener('click', () => {
    isMetric = true;
    toggleMetric.className = 'px-4 py-2 rounded-md text-sm font-semibold transition-all bg-emerald-500 text-brand-dark';
    toggleImperial.className = 'px-4 py-2 rounded-md text-sm font-semibold transition-all text-gray-400 hover:text-white';
    if(heightLabel) heightLabel.innerText = 'Height (cm)';
    if(weightLabel) weightLabel.innerText = 'Weight (kg)';
    if(heightInput) { heightInput.placeholder = '175'; heightInput.value = ''; }
    if(weightInput) { weightInput.placeholder = '70'; weightInput.value = ''; }
    if(resultsPanel) resultsPanel.classList.add('hidden');
  });

  toggleImperial.addEventListener('click', () => {
    isMetric = false;
    toggleImperial.className = 'px-4 py-2 rounded-md text-sm font-semibold transition-all bg-emerald-500 text-brand-dark';
    toggleMetric.className = 'px-4 py-2 rounded-md text-sm font-semibold transition-all text-gray-400 hover:text-white';
    if(heightLabel) heightLabel.innerText = 'Height (inches)';
    if(weightLabel) weightLabel.innerText = 'Weight (lbs)';
    if(heightInput) { heightInput.placeholder = '69'; heightInput.value = ''; }
    if(weightInput) { weightInput.placeholder = '154'; weightInput.value = ''; }
    if(resultsPanel) resultsPanel.classList.add('hidden');
  });
}

if (calculateBtn) {
  calculateBtn.addEventListener('click', () => {
    const heightVal = parseFloat(heightInput.value);
    const weightVal = parseFloat(weightInput.value);

    if (!heightVal || !weightVal || heightVal <= 0 || weightVal <= 0) {
      alert('Please enter valid positive numbers for height and weight.');
      return;
    }

    let bmi = 0;
    if (isMetric) {
      const heightInMeters = heightVal / 100;
      bmi = weightVal / (heightInMeters * heightInMeters);
    } else {
      bmi = (weightVal / (heightVal * heightVal)) * 703;
    }

    if(bmiValue) bmiValue.innerText = bmi.toFixed(1);

    let status = '';
    let advice = '';
    let colorClass = '';

    if (bmi < 18.5) {
      status = 'Underweight';
      advice = 'Your weight index is slightly below standard thresholds. We suggest focusing on lean caloric surplus and metabolic hypertrophy training.';
      colorClass = 'text-blue-400';
    } else if (bmi >= 18.5 && bmi < 25) {
      status = 'Optimal Weight';
      advice = 'Excellent! You are in the optimal health weight range. Ready to optimize your athletic build? Explore our Pro Athlete strength structures.';
      colorClass = 'text-emerald-400';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'Overweight';
      advice = 'You are in the mildly overweight category. A combination of caloric deficit conditioning combined with high-intensity strength programs is highly recommended.';
      colorClass = 'text-yellow-400';
    } else {
      status = 'Obese';
      advice = 'Your bio-metric index is in the obese range. Standard conditioning, lifestyle guidance, and personalized nutrition logs will serve you best. Speak to a performance counselor.';
      colorClass = 'text-red-500';
    }

    if(bmiStatus) {
      bmiStatus.innerText = status;
      bmiStatus.className = `text-lg font-bold ${colorClass}`;
    }
    if(bmiAdvice) bmiAdvice.innerText = advice;

    if(resultsPanel) {
      resultsPanel.classList.remove('hidden');
      resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// =========================================================================
// 9. HERO SECTION TYPEWRITER ANIMATION
// =========================================================================
(function() {
  const wordsList = ["Nutrition", "Recipes", "Supplements", "Training"];
  let wordIdx = 0;
  let charIdx = 0; 
  let isDeleting = false; 

  function playWordAnimation() {
    const targetSpan = document.getElementById("welldone-word-only") || document.getElementById("js-typewriter");
    if (!targetSpan) return;

    const currentWord = wordsList[wordIdx];
    if (isDeleting) { charIdx--; } else { charIdx++; }

    targetSpan.textContent = currentWord.substring(0, charIdx);
    let currentSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIdx === currentWord.length) {
      currentSpeed = 2500; 
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % wordsList.length; 
      currentSpeed = 300; 
    }
    setTimeout(playWordAnimation, currentSpeed);
  }
  setTimeout(playWordAnimation, 500);
})();

// =========================================================================
// 10. SWIPER BLOG WIDGET
// =========================================================================
if (document.querySelector('.blog-swiper')) {
  const blogSwiper = new Swiper('.blog-swiper', {
      slidesPerView: 1,
      spaceBetween: 24, 
      grabCursor: true,
      loop: false,
      navigation: {
          nextEl: '.swiper-button-next-blog',
          prevEl: '.swiper-button-prev-blog',
      },
      breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
      },
      on: {
          init: function () { handleArrows(this); },
          slideChange: function () { handleArrows(this); }
      }
  });
}

function handleArrows(swiper) {
  const nextBtn = document.querySelector('.swiper-button-next-blog');
  const prevBtn = document.querySelector('.swiper-button-prev-blog');
  if (!nextBtn || !prevBtn) return;

  if (swiper.isBeginning) { prevBtn.classList.add('arrow-hidden'); } 
  else { prevBtn.classList.remove('arrow-hidden'); }

  if (swiper.isEnd) { nextBtn.classList.add('arrow-hidden'); } 
  else { nextBtn.classList.remove('arrow-hidden'); }
}



// =========================================================================
// 7. BACKEND API: CART & WISHLIST OPERATIONS (TOAST & BADGE)
// =========================================================================
  if (typeof DJANGO_BASE_URL === 'undefined') var DJANGO_BASE_URL = 'http://127.0.0.1:8000';

  function getToken()     { return localStorage.getItem('bearer_token'); }
  function authHeaders()  {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }

  /* ── Toast Notification System (Self-initializing) ── */
  function showToast(title, subtitle = '', type = 'cart') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = {
      cart:    '<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
      success: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
      error:   '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>',
      info:    '<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 8.25h.008v.008H12V8.25z"/>'
    };
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

  /* ── Add to Cart ── */
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
        // Update header cart badge count
        const badge = document.querySelector('#cart-count') || document.querySelector('header a[href="cart.html"] span');
        if (badge) {
          const cartRes  = await fetch(`${DJANGO_BASE_URL}/api/cart/`, { headers: authHeaders() });
          const cartData = await cartRes.json();
          badge.textContent = (cartData.items || []).length;
        }
      } else {
        showToast('Error', data.error || data.detail || 'Failed to add item', 'error');
      }
    } catch (err) {
      showToast('Connection Error', 'Make sure Django is running on port 8000', 'error');
      console.error('addToCart error:', err);
    }
  }

  /* ── Add to Wishlist (Local Storage fallback) ── */
  function addToWishlist(name, price, img, productId) {
    try {
      let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const exists = wishlist.some(item => item.name === name);
      if (!exists) {
        wishlist.push({ name, price, img, id: productId || null });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showToast('Added to Wishlist!', name, 'success');
      } else {
        showToast('Already in Wishlist', name, 'info');
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  }

  /* ── Add to Wishlist (API backend) ── */
  async function addToWishlistFromDOM(buttonElement, productId) {
    const url = `${DJANGO_BASE_URL}/api/wishlist/`;
    const token = getToken();
    const svgIcon = buttonElement.querySelector('svg');

    if (!token) {
      showToast('Sign in required', 'Please log in to add items to wishlist', 'error');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ product_id: productId })
      });
      const data = await response.json();

      if (response.ok) {
        if (svgIcon) {
          svgIcon.classList.remove('fill-none');
          svgIcon.classList.add('fill-current', 'text-white');
        }
        buttonElement.classList.add('bg-[#E63E17]', 'text-white');
        showToast('Added to Wishlist!', data.message || 'Item added successfully', 'success');
      } else {
        showToast('Error', data.error || 'Failed to update wishlist', 'error');
      }
    } catch (error) {
      console.error("Wishlist Error:", error);
      showToast('Connection Error', 'Failed to communicate with wishlist API', 'error');
    }
  }

