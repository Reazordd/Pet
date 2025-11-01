# backend/chat/views.py
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    queryset = Chat.objects.all()

    def get_queryset(self):
        return Chat.objects.filter(users=self.request.user).prefetch_related("users", "messages")

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get("receiver_id")
        if not receiver_id:
            return Response({"detail": "receiver_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if int(receiver_id) == request.user.id:
            return Response({"detail": "cannot create chat with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        receiver = get_object_or_404(User, id=receiver_id)
        chat = Chat.objects.filter(users=request.user).filter(users=receiver).first()
        if chat:
            return Response(ChatSerializer(chat, context={"request": request}).data)

        chat = Chat.objects.create()
        chat.users.add(request.user, receiver)
        return Response(ChatSerializer(chat, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        chat = self.get_object()
        if request.user not in chat.users.all():
            return Response({"detail": "No access"}, status=status.HTTP_403_FORBIDDEN)
        messages = chat.messages.order_by("created_at")
        return Response(MessageSerializer(messages, many=True).data)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        chat = self.get_object()
        if request.user not in chat.users.all():
            return Response({"detail": "No access"}, status=status.HTTP_403_FORBIDDEN)
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"detail": "Text is required"}, status=status.HTTP_400_BAD_REQUEST)
        message = Message.objects.create(chat=chat, sender=request.user, text=text)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class SendMessageView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def create(self, request, *args, **kwargs):
        chat_id = kwargs.get("chat_id")
        chat = get_object_or_404(Chat, pk=chat_id)
        if request.user not in chat.users.all():
            return Response({"detail": "No access"}, status=status.HTTP_403_FORBIDDEN)
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"detail": "Text required"}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(chat=chat, sender=request.user, text=text)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
