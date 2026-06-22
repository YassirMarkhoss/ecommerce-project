from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from django.shortcuts import render

class CategoryViewSet(viewsets.ModelViewSet):
    """
    هاد الـ ViewSet كايتكلف بجميع عمليات الـ CRUD للأصناف (Categories)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    هاد الـ ViewSet كايتكلف بالمنتجات، البحث، الفلترة، والاقتراحات
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    # إعدادات الفلترة والبحث والترتيب
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']  # الفلترة بالـ Category
    search_fields = ['name', 'description']  # البحث في السمية والوصف
    ordering_fields = ['price', 'created_at']  # الترتيب بالثمن أو التاريخ
    
    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """
        هاد الرابط كايعطي اقتراحات حسب الحروف اللي كتب المستخدم
        الرابط: /api/products/suggestions/?q=...
        """
        query = request.query_params.get('q', '')
        
        # ما يبدا يعطي نتائج حتى يكتب المستخدم جوج حروف على الأقل
        if len(query) < 2:
            return Response([])
        
        # كايجيب أول 5 منتجات كايحتويو على دوك الحروف (بلا تكرار)
        suggestions = Product.objects.filter(
            name__icontains=query
        ).values_list('name', flat=True).distinct()[:5]
        
        return Response(suggestions)
    
def product_detail_view(request):
    return render(request, 'product.html')