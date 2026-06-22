// ربط الدالة بالـ window باش تكون مرئية ف أي مكان وبلا مشاكل ترتيب
window.addToWishlistFromDOM = function(buttonElement) {
    try {
        // البحث عن أقرب كرت (الـ Container الكبير د المنتج)
        const cardContainer = buttonElement.closest('.group');
        if (!cardContainer) return;

        // قراءة الداتا مباشرة من الـ HTML المتواجد فـ الكرت
        const imgElement = cardContainer.querySelector('img');
        const titleElement = cardContainer.querySelector('h4');
        const priceElement = cardContainer.querySelector('.font-mono') || cardContainer.querySelector('span'); 

        const img = imgElement ? imgElement.getAttribute('src') : '';
        const name = titleElement ? titleElement.innerText.trim() : 'Product';
        const price = priceElement ? priceElement.innerText.trim() : '0.00 MAD';

        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        // التأكد واش ديجا كاين بالاعتماد على الاسم
        const exists = wishlist.some(item => item.name === name);
        
        if (!exists) {
            wishlist.push({ name, price, img });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            showWishlistToast(name, true);
        } else {
            showWishlistToast(name, false);
        }
    } catch (error) {
        console.error("خطأ أثناء إضافة المنتج للمفضلة:", error);
    }
};

// دالة الأنميشن والـ Toast الإشعاري بالبرتقالي
function showWishlistToast(productName, isNew) {
    const oldToast = document.getElementById('wishlist-toast');
    if (oldToast) oldToast.remove();

    const message = isNew ? `Added to Wishlist!` : `Already in Wishlist!`;
    const bgColor = isNew ? 'bg-[#E63E17]' : 'bg-black';

    const toastHTML = `
        <div id="wishlist-toast" class="fixed bottom-5 left-5 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300 ease-out" style="font-family: sans-serif;">
            <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div class="flex flex-col">
                <span class="text-[11px] uppercase tracking-wider font-black block">${message}</span>
                <span class="text-xs opacity-80 line-clamp-1 max-w-[180px] block mt-0.5">${productName}</span>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);

    setTimeout(() => {
        const toast = document.getElementById('wishlist-toast');
        if (toast) toast.classList.remove('translate-y-10', 'opacity-0');
    }, 50);

    setTimeout(() => {
        const toast = document.getElementById('wishlist-toast');
        if (toast) {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}