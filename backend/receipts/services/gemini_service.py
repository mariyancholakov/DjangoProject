import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

class GeminiService:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def extract_receipt_data(self, raw_text: str) -> dict:
        prompt = f"""
        You are an AI specialized in receipt analysis. Analyze the following OCR text from a Bulgarian receipt:

        ### Instructions:

        1. **STORE NAME**
        - Fix OCR spelling mistakes
        - Remove unnecessary special characters and spaces
        - Keep original store name if recognizable (match known Bulgarian chains)

        2. **PRODUCTS**
        - Its possible that there are no products
        - Identify all products
        - Correct misread names
        - For each product extract:
            - `name`: product name
            - `price`: price in BGN (2 decimal places)
            - `category`: one of these categories:
                - `"food"` (food, groceries, beverages)
                - `"electronics"` (electronics, devices, accessories)
                - `"clothing"` (clothes, shoes, accessories)
                - `"home"` (household items, furniture)
                - `"pharmacy"` (medications, health products)
                - `"transport"` (transport tickets, fuel)
                - `"entertainment"` (movies, games, activities)
                - `"education"` (books, courses)
                - `"utilities"` (bills, utilities)
                - `"services"` (services)
                - `"finances"` (banking, insurance)
                - `"other"` (anything else)

        3. **TOTAL AMOUNT**
        - Find the final paid amount
        - Include VAT if shown
        - Format as number with 2 decimal places

        4. **DATE**
        - Find the date (even with errors like "21-О4-2025")
        - Convert to `DD-MM-YYYY` format
        - Use current date if none found

        5. **RECEIPT CATEGORY**
        - Determine overall category based on most common product type

        ### Input OCR text:
        \"\"\"
        {raw_text}
        \"\"\"

        ### Output:
        Return ONLY a valid JSON object in this exact format:
        {{
        "store_name": "string",
        "total_amount": "number with 2 decimals",
        "date": "DD-MM-YYYY",
        "category": "food | electronics | clothing | home | pharmacy | transport | entertainment | education | utilities | services | finances | other",
        "products": [
            {{
            "name": "string",
            "price": "number with 2 decimals",
            "category": "food | electronics | clothing | home | pharmacy | transport | entertainment | education | utilities | services | finances | other"
            }}
        ]
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("Empty response from Gemini")

            json_match = re.search(r'\{[\s\S]*\}', response.text)
            if not json_match:
                raise ValueError("No JSON found in response")

            data = json.loads(json_match.group())
            
            self.validate_receipt_data(data)
            
            data['category'] = self.determine_receipt_category(data['products'])
            
            return data

        except Exception as e:
            print(f"Gemini processing error: {str(e)}")
            return None

    def validate_receipt_data(self, data):
        required_fields = ['store_name', 'total_amount', 'date', 'products']
        if not all(field in data for field in required_fields):
            raise ValueError("Missing required fields in receipt data")
            
        if not isinstance(data['products'], list):
            raise ValueError("Products must be a list")
            
        for product in data['products']:
            if not all(field in product for field in ['name', 'price', 'category']):
                raise ValueError("Invalid product data structure")

    def determine_receipt_category(self, products):
        if not products:
            return 'other'
            
        categories = [p['category'] for p in products]
        return max(set(categories), key=categories.count)
