# backend/chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_chat, name='create-chat'),
    path('list/', views.get_user_chats, name='user-chats'),
    path('<int:chat_id>/messages/', views.get_chat_messages, name='chat-messages'),
    path('<int:chat_id>/send/', views.send_message, name='send-message'),
    path('<int:chat_id>/delete/', views.delete_chat, name='delete-chat'),
]