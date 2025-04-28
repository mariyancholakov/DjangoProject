from rest_framework import serializers
from .models import Receipt, Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price']

class ReceiptSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id',
            'title',
            'store_name',
            'total_amount',
            'date',
            'category',
            'image',
            'warranty_months',
            'created_at',
            'products'
        ]
