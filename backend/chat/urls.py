from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, SendMessageView

router = DefaultRouter()
router.register("chats", ChatViewSet, basename="chat")

urlpatterns = [
    path("", include(router.urls)),
    path("chats/<int:chat_id>/messages/send/", SendMessageView.as_view(), name="chat-send"),
]
