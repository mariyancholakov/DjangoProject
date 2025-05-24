import pytesseract
import cv2
import numpy as np
from PIL import Image

class OCRService:
    def __init__(self):
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def preprocess_image(self, image_path):
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
        gray = cv2.fastNlMeansDenoising(gray, h=30)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return thresh

    def extract_text(self, image_path):
        try:
            processed_image = self.preprocess_image(image_path)
            config = '--oem 3 --psm 6'
            text = pytesseract.image_to_string(processed_image, lang='bul+eng', config=config)
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {str(e)}")
            return None

    def extract_text_from_multiple_images(self, image_paths):
        try:
            combined_text = []
            for image_path in image_paths:
                processed_image = self.preprocess_image(image_path)
                config = '--oem 3 --psm 6'
                text = pytesseract.image_to_string(processed_image, lang='bul+eng', config=config)
                if text.strip():
                    combined_text.append(text.strip())
            
            return '\n'.join(combined_text)
        except Exception as e:
            print(f"OCR Error: {str(e)}")
            return None
