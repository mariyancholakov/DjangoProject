from rest_framework import serializers
from .models import Receipt

class ReceiptSerializer(serializers.ModelSerializer):
    warranty_expiry_date = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = [
            'id',
            'user',
            'title',
            'store_name',
            'total_amount',
            'date',
            'category',
            'image',
            'warranty_months',
            'created_at',
            'warranty_expiry_date'
        ]

    def get_warranty_expiry_date(self, obj):
        return obj.warranty_expiry_date()
