from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # 🌟 السحر هنا: هاد السطر كيمشي لجدول الـ Category وكيجيب الـ slug ديالها (مثال: whey)
    subcategory_slug = serializers.CharField(source='category.slug', read_only=True)
    
    # 🌟 وهاد السطر كيمشي لـ الـ Parent ديالها ويجيب سميتو الرئيسية (مثال: Supplements)
    category_name = serializers.CharField(source='category.parent.name', read_only=True)

    class Meta:
        model = Product
        # 💡 هنا حددنا كاع الحقول لي كيحتاجها الـ Frontend ديالنا وزدنا معاهم الحقول الجديدة
        fields = ['id', 'name', 'price', 'old_price', 'description', 'image', 'category', 'subcategory_slug', 'category_name']