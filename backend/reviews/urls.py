# backend/reviews/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('user/<int:user_id>/reviews/', views.get_reviews_for_user, name='user-reviews'),
    path('user/<int:user_id>/given-reviews/', views.get_given_reviews, name='given-reviews'),  # ← новое
    path('user/<int:user_id>/review/', views.create_or_update_review, name='create-or-update-review'),
]