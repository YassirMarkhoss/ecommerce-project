from django.db import models
from django.conf import settings

class Cart(models.Model):
    # كل مستخدم عنده سلة واحدة، وإلى تمسح المستخدم كتمسح سلته (CASCADE)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.email}"

    @property
    def total_price(self):
        # هاد الخاصية كتحسب الثمن الإجمالي ديال السلة كاملة
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    # مربوطة بالسلة، وإلى تمسحات السلة كيتمسحوا العناصر لي وسطها
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    
    # 💡 الخشيبة هنا: حيدنا الـ import الفوق ودرنا 'products.Product' بين معقوفتين
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    
    quantity = models.PositiveIntegerField(default=1) # الكمية (أقل حاجة 1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def total_price(self):
        # ثمن المنتوج مضروب في الكمية
        return self.product.price * self.quantity