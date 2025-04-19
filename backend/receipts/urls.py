from django.urls import path
from .views import ReceiptListCreateAPIView, ReceiptRetrieveUpdateDeleteAPIView

urlpatterns = [
    path("receipts/", ReceiptListCreateAPIView.as_view(), name="receipt-list-create"),
    path("receipts/<int:pk>/", ReceiptRetrieveUpdateDeleteAPIView.as_view(), name="receipt-retrieve-update-delete")
]