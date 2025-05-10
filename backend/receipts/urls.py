import os
from django.urls import path
from .views import (
    ReceiptListCreateAPIView,
    ReceiptRetrieveUpdateDeleteAPIView,
    OCRView,
    ProcessReceiptView,
    ReceiptStatisticsView,
    RegisterView,
    LoginView,
    UserView
)

urlpatterns = [
    path('ocr/', OCRView.as_view(), name='ocr'),
    path('receipts/', ReceiptListCreateAPIView.as_view(), name='receipt-list'),
    path('receipts/<int:pk>/', ReceiptRetrieveUpdateDeleteAPIView.as_view(), name='receipt-detail'),
    path('process/', ProcessReceiptView.as_view(), name='process'),
    path('statistics/', ReceiptStatisticsView.as_view(), name='receipt-statistics'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserView.as_view(), name='user'),
]