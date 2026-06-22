from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart

class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    # 1. كريي طلب جديد انطلاقاً من السلة
    def post(self, request):
        user = request.user
        
        # جيب السلة ديال اليوزر
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "السلة غير موجودة"}, status=status.HTTP_400_BAD_REQUEST)

        # تأكد بلي السلة ماشي خاوية
        if not cart.items.exists():
            return Response({"error": "السلة خاوية، ما يمكنش دير طلب"}, status=status.HTTP_400_BAD_REQUEST)

        # خذ معلومات الشحن من الـ Request (العنوان، الهاتف، إلخ)
        data = request.data
        
        order = Order.objects.create(
            user=user,
            first_name=data.get('first_name', user.first_name),
            last_name=data.get('last_name', user.last_name),
            email=data.get('email', user.email),
            address=data.get('address'),
            phone=data.get('phone'),
            payment_method=data.get('payment_method', 'COD'),  # صيفطنا طريقة الدفع هنا
            total_price=cart.total_price  # خدا الثمن الإجمالي من السلة
        )

        # تحويل عناصر السلة لعناصر طلب (CartItems -> OrderItems)
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                price=cart_item.product.price, # نسجلو الثمن ديال دبا
                quantity=cart_item.quantity
            )

        # خطوة مهمة: تخوية السلة بعد نجاح الطلب
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response({
            "message": "تم تسجيل الطلب بنجاح وتم تفريغ السلة",
            "order": serializer.data
        }, status=status.HTTP_201_CREATED)

    # 2. عرض كاع الطلبيات القديمة ديال هاد اليوزر (تاريخ الطلبيات)
    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)