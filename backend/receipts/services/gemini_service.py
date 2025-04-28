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
        Analyze this receipt text in Bulgarian and extract the following information.
        Return ONLY a valid JSON object with this exact structure:
        {{
            "store_name": "store name here",
            "products": [
                {{"name": "product name", "price": numeric_price}},
            ],
            "total_amount": numeric_total,
            "date": "date in DD-MM-YYYY format",
            "items_count": numeric_count
        }}

        Receipt text:
        {raw_text}
        """

        try:
            response = self.model.generate_content(prompt)
            
            if not response.text:
                return {}

            json_text = re.search(r'\{.*\}', response.text, re.DOTALL)
            if not json_text:
                return {}
                
            data = json.loads(json_text.group())
            
            required_fields = ['store_name', 'products', 'total_amount', 'date', 'items_count']
            if not all(field in data for field in required_fields):
                return {}

            return data

        except Exception as e:
            print(f"Error processing receipt: {str(e)}")
            return {}
