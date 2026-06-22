from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem

# هاد الكود كايخلي السلعة تبان وسط الصفحة ديال الطلب الرئيسي نيشان بلا ما تحتاج تدخل لكل حاجة بوحدها
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0 # باش ما يعطيكش سطور خاوية زايدة


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # 👇 زدنا 'payment_method' و 'get_products' هنا باش تطلع ليك في الجدول الرئيسي
    list_display = ['id', 'user', 'first_name', 'last_name', 'get_products', 'total_price', 'payment_method', 'status', 'is_paid', 'created_at']
    
    # 👇 وزدناها هنا باش تقدر تصفّي الطلبات على حسب نوع الدفع (مثلاً تشوف غير أصحاب COD بوحدهم)
    list_filter = ['status', 'payment_method', 'is_paid', 'created_at', 'updated_at']
    
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    list_editable = ['status', 'is_paid']
    inlines = [OrderItemInline]

    # 👇 دالة كاتمشي تجيب كاع السلعة لي فهاد الطلب وتلصق السميات والكميات ديالها بشكل منسق وسهل ف القراية
    def get_products(self, obj):
        items = obj.items.all()
        html_items = []
        for item in items:
            if item.product:
                html_items.append(format_html("• {} <span style='color: #E63E17; font-weight: bold;'>x{}</span>", item.product.name, item.quantity))
        return format_html("<br>".join(html_items)) if html_items else "-"
    
    get_products.short_description = 'Products to Deliver'