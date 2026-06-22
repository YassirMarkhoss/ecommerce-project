from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    # هاد السطر كايحدد شنو غايبان في القائمة ديال المستخدمين
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff']
    
    # هادشي باش نقدروا نعدلو تاريخ الازدياد من وسط الـ Admin
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('birth_date',)}),
    )
    # هادشي باش نزيدو تاريخ الازدياد فاش كنكرييو يوزر جديد من الـ Admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('birth_date',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
