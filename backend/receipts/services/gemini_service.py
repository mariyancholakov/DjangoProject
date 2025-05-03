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
        You are a highly accurate document understanding AI. Your task is to analyze the following text extracted from a Bulgarian receipt (with OCR errors possible). Perform intelligent corrections, standardization, and structured extraction.

        ### Instructions:

        1. **STORE NAME**
        - Fix OCR spelling mistakes (e.g., "ЧиЧО ТОМ" ➝ "Чичо Том")
        - Remove unnecessary special characters and spaces
        - Keep the original known store name if recognizable (match known chains if possible)

        2. **PRODUCTS**
        - Identify the list of products from the text
        - Correct distorted or misread names (e.g., "БАТЕРИИ РИЗ АН ВЕО" ➝ "Батерии RIZON VEO")
        - For each product, extract:
            - `name` (string, cleaned up)
            - `price` (float, 2 decimal places)
            - `category`, choose from:
            - `"food"` (groceries, beverages, snacks, etc.)
            - `"electronics"` (devices, accessories, batteries, etc.)
            - `"clothing"` (apparel, shoes, accessories)
            - `"other"` (everything else, including unknown items)
        - Ignore non-product items like payment methods, receipt numbers, bags, rounding adjustments, etc.

        3. **TOTAL AMOUNT**
        - Find the final total amount paid (usually at the end of receipt)
        - Include VAT if applicable
        - Format as float with 2 decimal places (e.g. 6.80)

        4. **DATE**
        - Look for a date in the receipt (even distorted like "Й2-45-2025")
        - Convert to `DD-MM-YYYY` format
        - If no valid date is found, use today’s date

        5. **CATEGORY**
        - Based on the most frequent product category, determine the overall receipt category

        ### Input (OCR-processed receipt text):
        \"\"\"
        {raw_text}
        \"\"\"

        ### Output:
        Respond ONLY with a valid JSON object in this exact format:
        {{
        "store_name": "string",
        "total_amount": "number with 2 decimals",
        "date": "DD-MM-YYYY",
        "category": "food | electronics | clothing | other",
        "products": [
            {{
            "name": "string",
            "price": "number with 2 decimals",
            "category": "food | electronics | clothing | other"
            }}
            ...
        ]
        }}
        """


        try:
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise ValueError("Empty response from Gemini")

            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response.text)
            if not json_match:
                raise ValueError("No JSON found in response")

            data = json.loads(json_match.group())
            
            # Validate data structure
            self.validate_receipt_data(data)
            
            # Determine overall receipt category
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
