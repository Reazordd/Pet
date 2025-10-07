# pets/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.PetListView.as_view(), name='pet-list'),
]
