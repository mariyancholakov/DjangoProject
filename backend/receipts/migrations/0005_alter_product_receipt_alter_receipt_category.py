# Generated by Django 5.2 on 2025-05-05 14:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('receipts', '0004_remove_receipt_image_receiptimage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='receipt',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='products', to='receipts.receipt'),
        ),
        migrations.AlterField(
            model_name='receipt',
            name='category',
            field=models.CharField(choices=[('food', 'Храна'), ('electronics', 'Електроника'), ('clothing', 'Дрехи'), ('home', 'Дом'), ('pharmacy', 'Аптека'), ('transport', 'Транспорт'), ('entertainment', 'Развлечения'), ('education', 'Образование'), ('utilities', 'Сметки'), ('services', 'Услуги'), ('finances', 'Услуги'), ('other', 'Друго')], max_length=50),
        ),
    ]
