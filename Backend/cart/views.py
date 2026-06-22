from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product

class CartView(APIView):
    permission_classes = [IsAuthenticated] # ضروري اليوزر يكون مسجل (Login)

    # 1. عرض السلة ديال اليوزر الحالي
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    # 2. إضافة منتج للسلة (أو زيادة الكمية إذا كان ديجا كاين)
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "المنتج غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        # شوف واش المنتج ديجا كاين في السلة
        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not item_created:
            cart_item.quantity += quantity # نزيدو على الكمية القديمة
        else:
            cart_item.quantity = quantity # نحطو الكمية الجديدة
        
        cart_item.save()
        return Response({"message": "تمت إضافة المنتج بنجاح للسلة"}, status=status.HTTP_200_OK)

    
    # 3. تعديل كمية منتج في السلة (زيادة أو نقصان)
    def patch(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        new_quantity = request.data.get('quantity')

        if new_quantity is None:
            return Response({"error": "يجب تحديد الكمية الجديدة"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            if int(new_quantity) <= 0:
                cart_item.delete() # إذا رجع الكمية 0 أو أقل، كيديمبسا المونتوج أوتوماتيكياً
                return Response({"message": "تم حذف المنتج من السلة لأن الكمية أصبحت 0"}, status=status.HTTP_200_OK)
            
            cart_item.quantity = int(new_quantity)
            cart_item.save()
            return Response({"message": "تم تحديث كمية المنتج بنجاح"}, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"error": "المنتج غير موجود في السلة"}, status=status.HTTP_404_NOT_FOUND)
    
    # 4. حذف منتج بصفة نهائية من السلة
    def delete(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')

        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.delete()
            return Response({"message": "تم حذف المنتج من السلة"}, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response({"error": "المنتج غير موجود في السلة"}, status=status.HTTP_404_NOT_FOUND)