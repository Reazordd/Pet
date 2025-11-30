# backend/history/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.get_view_history, name='history-list'),
    path('add/<int:pet_id>/', views.add_to_history, name='history-add'),
]