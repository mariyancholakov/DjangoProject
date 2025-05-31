from django.db import models
from django.contrib.auth.models import User
from dateutil.relativedelta import relativedelta
from cloudinary.models import CloudinaryField

class Receipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receipts", null=True, blank=True)
    title = models.CharField(max_length=100)
    store_name = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=50, choices=[
        ("food", "Храна"),
        ("electronics", "Електроника"),
        ("clothing", "Дрехи"),
        ("home", "Дом"),
        ("pharmacy", "Аптека"),
        ("transport", "Транспорт"),
        ("entertainment", "Развлечения"),
        ("education", "Образование"),
        ("utilities", "Сметки"),
        ("services", "Услуги"),
        ("finances", "Финанси"),
        ("other", "Друго"),
    ])
    warranty_months = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def warranty_expiry_datetime(self):
        if self.warranty_months == 0:
            return None
        return self.date + relativedelta(months=self.warranty_months)
        

    def __str__(self):
        return f"{self.title} - {self.store_name}"

class ReceiptImage(models.Model):
    receipt = models.ForeignKey(Receipt, related_name='images', on_delete=models.CASCADE)
    image = CloudinaryField('image', folder='receipt_images')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.receipt.title}"

    class Meta:
        ordering = ['-uploaded_at']

class Product(models.Model):
    receipt = models.ForeignKey(Receipt, related_name='products', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.price} лв"
