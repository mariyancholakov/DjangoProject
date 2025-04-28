from django.urls import path
from .views import OCRView, ReceiptListCreateAPIView, ReceiptRetrieveUpdateDeleteAPIView 

urlpatterns = [
    path('ocr/', OCRView.as_view(), name='ocr'),
    path("receipts/", ReceiptListCreateAPIView.as_view(), name="receipt-list-create"),
    path("receipts/<int:pk>/", ReceiptRetrieveUpdateDeleteAPIView.as_view(), name="receipt-retrieve-update-delete")
]