from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Used for registration (POST /api/register/)."""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'username', 'password', 'birth_date')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            birth_date=validated_data.get('birth_date'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Used for reading / updating the authenticated user's profile."""

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'username', 'birth_date')
        extra_kwargs = {
            'email':    {'required': False},
            'username': {'required': False},
        }

    def update(self, instance, validated_data):
        # Update only the fields that were actually sent
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance