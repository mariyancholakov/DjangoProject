import json
from datetime import datetime
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Receipt, Product, ReceiptImage
from .serializers import ReceiptSerializer, UserSerializer
from django.http import JsonResponse
from .services.gemini_service import GeminiService
from .services.ocr_service import OCRService
import os
from django.db.models import Sum
from django.db.models.functions import ExtractYear, ExtractMonth, ExtractDay

# Create your views here.

class ReceiptListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user).prefetch_related('images', 'products')

    def create(self, request, *args, **kwargs):
        try:
            receipt_data = request.data
            
            date_str = receipt_data.get('date')
            try:
                date = datetime.strptime(date_str, '%d-%m-%Y').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use DD-MM-YYYY'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            receipt = Receipt.objects.create(
                user=request.user,
                title=f"Receipt from {receipt_data['store_name']}",
                store_name=receipt_data['store_name'],
                total_amount=receipt_data['total_amount'],
                date=date,
                category=receipt_data.get('category', 'other'),
                warranty_months=receipt_data.get('warranty_months', 0)
            )

            if 'images' in request.FILES:
                for image_file in request.FILES.getlist('images'):
                    ReceiptImage.objects.create(
                        receipt=receipt,
                        image=image_file
                    )

            products = receipt_data.get('products')
            if products:
                if isinstance(products, str):
                    products = json.loads(products)
                for product_data in products:
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

class ReceiptRetrieveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk)
        except Receipt.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk, user=request.user)
            
            receipt.title = request.data.get('title', receipt.title)
            receipt.store_name = request.data.get('store_name', receipt.store_name)
            receipt.total_amount = request.data.get('total_amount', receipt.total_amount)
            receipt.category = request.data.get('category', receipt.category)
            receipt.warranty_months = request.data.get('warranty_months', receipt.warranty_months)
            
            date_str = request.data.get('date')
            if date_str:
                try:
                    receipt.date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            
            receipt.save()

            if 'products' in request.data:
                Product.objects.filter(receipt=receipt).delete()

                products_data = request.data['products']
                if isinstance(products_data, str):
                    products_data = json.loads(products_data)
                    
                for product_data in products_data:
                    Product.objects.create(
                        receipt=receipt,
                        name=product_data['name'],
                        price=product_data['price']
                    )

            serializer = ReceiptSerializer(receipt)
            return Response(serializer.data)

        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
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


class ProcessReceiptView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        raw_text = request.data.get('raw_text')
        if not raw_text:
            return Response(
                {'error': 'raw_text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            gemini_service = GeminiService()
            receipt_data = gemini_service.extract_receipt_data(raw_text)
            
            if not receipt_data:
                return Response(
                    {'error': 'Failed to process receipt'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response(receipt_data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
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
        if 'images' not in request.FILES:
            return Response(
                {'error': 'No images provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        temp_files = []
        try:
            images = request.FILES.getlist('images')
            if len(images) == 1:
                image_file = images[0]
                temp_path = f'media/temp/{image_file.name}'
                
                os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                with open(temp_path, 'wb+') as destination:
                    for chunk in image_file.chunks():
                        destination.write(chunk)
                
                ocr_service = OCRService()
                text = ocr_service.extract_text(temp_path)
                
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                
                if text:
                    return Response({'text': text})
                return Response(
                    {'error': 'Failed to extract text from image'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            for image_file in images:
                temp_path = f'media/temp/{image_file.name}'
                temp_files.append(temp_path)
                
                os.makedirs(os.path.dirname(temp_path), exist_ok=True)
                with open(temp_path, 'wb+') as destination:
                    for chunk in image_file.chunks():
                        destination.write(chunk)

            ocr_service = OCRService()
            combined_text = ocr_service.extract_text_from_multiple_images(temp_files)

            if combined_text:
                return Response({'text': combined_text})
            
            return Response(
                {'error': 'Failed to extract text from images'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        finally:
            for temp_path in temp_files:
                if os.path.exists(temp_path):
                    os.remove(temp_path)


class ReceiptStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        category = request.query_params.get('category', None)
        date_from = request.query_params.get('from', None)
        date_to = request.query_params.get('to', None)

        queryset = Receipt.objects.filter(user=request.user)

        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        if category:
            queryset = queryset.filter(category=category)

        if period == 'day':
            stats = queryset.annotate(
                period=ExtractDay('date')
            ).values('period').annotate(
                total_amount=Sum('total_amount')
            ).order_by('period')
        elif period == 'month':
            stats = queryset.annotate(
                period=ExtractMonth('date')
            ).values('period').annotate(
                total_amount=Sum('total_amount')
            ).order_by('period')
        elif period == 'year':
            stats = queryset.annotate(
                period=ExtractYear('date')
            ).values('period').annotate(
                total_amount=Sum('total_amount')
            ).order_by('period')

        category_stats = queryset.values('category').annotate(
            total_amount=Sum('total_amount')
        ).order_by('-total_amount')

        return Response({
            'time_based': list(stats),
            'category_based': list(category_stats)
        })


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            response.data['username'] = user.username
        return response


class RegisterView(APIView):
    def post(self, request):
        try:
            data = request.data
            if User.objects.filter(username=data['username']).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.create(
                username=data['username'],
                password=make_password(data['password'])
            )
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username
        })
