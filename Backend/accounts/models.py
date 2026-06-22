from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True) # ردينا الإيمايل ضروري وما كيتعاودش
    birth_date = models.DateField(null=True, blank=True) # هادي فين غيتخزن تاريخ الازدياد

    # هاد السطر كيعني أننا غندخلو بالإيمايل عوض الـ Username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

# Create your models here.
