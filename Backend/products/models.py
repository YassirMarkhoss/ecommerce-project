from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='subcategories'
    )
    slug = models.SlugField(unique=True, blank=True, null=True) 

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} -> {self.name}"
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # 💡 أصلحت هنا أيضاً max_digits
    old_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # 🌟 السطر لي تـصلح دبا بنجاح:
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    def __str__(self):
        return self.name