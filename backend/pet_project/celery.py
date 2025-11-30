# backend/pet_project/celery.py
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pet_project.settings")

app = Celery("pet_project")
# load config from django settings, CELERY_ prefix will be used
app.config_from_object("django.conf:settings", namespace="CELERY")

# autodiscover tasks in INSTALLED_APPS
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f"Debug task executed: {self.request!r}")
