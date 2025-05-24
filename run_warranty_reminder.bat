@echo off
cd /d "C:\Users\User\Desktop\SmartReceipt\DjangoProject\backend"
call venv\Scripts\activate.bat
python manage.py send_warranty_emails >> reminder_log.txt 2>&1
deactivate
