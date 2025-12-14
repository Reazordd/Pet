# backend/notifications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.get_notifications, name='notifications-list'),
    path('unread-count/', views.get_unread_count, name='notifications-unread-count'),
    path('mark-read/<int:notification_id>/', views.mark_as_read, name='notification-mark-read'),
    path('mark-all-read/', views.mark_all_as_read, name='notification-mark-all-read'),
]