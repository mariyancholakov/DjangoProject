from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Receipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receipts")
    title = models.CharField(max_length=100)
    store_name = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.CharField(max_length=50, choices=[
        ("food", "Храна"),
        ("electronics", "Електроника"),
        ("clothing", "Дрехи"),
        ("other", "Друго"),
    ])
    image = models.ImageField(upload_to="receipt_images/")
    warranty_months = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def warranty_expiry_date(self):
        if self.warranty_months:
            from datetime import timedelta
            return self.date + timedelta(days=self.warranty_months * 30)
        else:
            return None
        
    def __str__(self):
        return f"{self.title} - {self.store_name}"
