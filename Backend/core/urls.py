from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import RegisterView, ProfileView, ChangePasswordView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),

    # Auth — Register / Login / Token Refresh
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile — GET + PATCH
    path('api/profile/', ProfileView.as_view(), name='profile'),

    # Change Password — POST
    path('api/change-password/', ChangePasswordView.as_view(), name='change_password'),

    path('api/', include('cart.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('contacts.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
