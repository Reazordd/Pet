# backend/reviews/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('user/<int:user_id>/reviews/', views.get_reviews_for_user, name='user-reviews'),
    path('user/<int:user_id>/review/', views.create_review, name='create-review'),
]