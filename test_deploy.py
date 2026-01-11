# test_deploy.py в корне проекта
import os
import sys

print("Current directory:", os.getcwd())
print("Python path:", sys.path)
print("Files in current dir:", os.listdir('.'))

try:
    sys.path.insert(0, '/app/backend')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pet_project.settings')
    from django.core.wsgi import get_wsgi_application
    app = get_wsgi_application()
    print("✅ SUCCESS: Django app loaded")
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()