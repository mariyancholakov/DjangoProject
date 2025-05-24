from django.core.management.base import BaseCommand
from django.utils.timezone import now
from django.core.mail import send_mail
from receipts.models import Receipt
from datetime import timedelta

class Command(BaseCommand):
    help = "Send email reminders for warranties expiring in 30 days"

    def handle(self, *args, **options):
        current_date = now().date()
        start_window = current_date + timedelta(days=28)
        end_window = current_date + timedelta(days=30)

        self.stdout.write("Checking warranties expiring in around 30 days")

        receipts = Receipt.objects.filter(warranty_months__gt=0)
        self.stdout.write(f"Found {receipts.count()} receipts to check")

        for receipt in receipts:
            expiry_date = receipt.warranty_expiry_datetime()
            if expiry_date and start_window <= expiry_date <= end_window:
                user = receipt.user
                if user and user.email:
                    send_mail(
                        subject="🔔 Your warranty expires in 30 days",
                        message=(
                            f'Hi {user.username},\n\n'
                            f'Your product "{receipt.title}" from {receipt.store_name} '
                            f'has a warranty that will expire on {expiry_date}.\n\n'
                            f'This is a reminder sent 30 days before expiration.\n'
                            f'Check your receipt details for more information.'
                        ),
                        from_email='m.cholakov09@gmail.com',
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Sent 30-day warranty expiry reminder to {user.email}')
                    )
