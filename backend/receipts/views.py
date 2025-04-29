from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from .models import Receipt, Product
from .serializers import ReceiptSerializer
from django.http import JsonResponse
from .services.gemini_service import GeminiService
from .services.ocr_service import OCRService
from datetime import datetime
import os

# Create your views here.

class ReceiptListCreateAPIView(generics.ListCreateAPIView):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    
    def create(self, request, *args, **kwargs):
        raw_text = request.data.get('raw_text')
        if not raw_text:
            return Response(
                {'error': 'raw_text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        gemini_service = GeminiService()
        receipt_data = gemini_service.extract_receipt_data(raw_text)
        
        if not receipt_data:
            return Response(
                {'error': 'Failed to extract receipt data'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            date = datetime.strptime(receipt_data['date'], '%d-%m-%Y').date()
            
            receipt = Receipt.objects.create(
                title=f"Receipt from {receipt_data['store_name']}",
                store_name=receipt_data['store_name'],
                total_amount=receipt_data['total_amount'],
                date=date,
                category="other",
                warranty_months=None,
                image=request.data.get('image')
            )

            for product_data in receipt_data['products']:
                Product.objects.create(
                    receipt=receipt,
                    name=product_data['name'],
                    price=product_data['price']
                )

            serializer = self.get_serializer(receipt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ReceiptRetrieveUpdateDeleteAPIView(APIView):
    def get(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk)
        except Receipt.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk)
        except Receipt.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReceiptSerializer(receipt, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk)
            Product.objects.filter(receipt=receipt).delete()
            receipt.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def process_receipt(request):
    if request.method == 'POST':
        ocr_text = request.POST.get('ocr_text')
        gemini_service = GeminiService()
        extracted_data = gemini_service.extract_receipt_data(ocr_text)
        return JsonResponse({"extracted_data": extracted_data})


class OCRView(APIView):
    def post(self, request):
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        image_file = request.FILES['image']
        temp_path = f'media/temp/{image_file.name}'
        
        try:
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            with open(temp_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)

            ocr_service = OCRService()
            text = ocr_service.extract_text(temp_path)
            os.remove(temp_path)

            if text:
                return Response({'text': text})
            return Response(
                {'error': 'Failed to extract text'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

