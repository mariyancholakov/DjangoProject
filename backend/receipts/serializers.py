from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Receipt, Product, ReceiptImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

class ReceiptImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptImage
        fields = ['id', 'image']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data['image']:
            data['image'] = instance.image.url
        return data

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price']

class ReceiptSerializer(serializers.ModelSerializer):
    images = ReceiptImageSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'title', 'store_name', 'total_amount', 
            'date', 'category', 'warranty_months', 
            'created_at', 'images', 'products'
        ]
