# backend/chat/consumers.py


import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import Chat, Message
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer для чатов.
    Подключение: ws://HOST/ws/chat/<chat_id>/?token=<access_token>
    """

    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"].get("chat_id")
        # Получаем пользователя по токену
        self.user = await self._get_user_from_query()
        if not self.user:
            await self.close()
            return

        # Проверяем что пользователь в чате
        allowed = await self._user_in_chat(self.chat_id, self.user.id)
        if not allowed:
            await self.close()
            return

        self.room_group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            return

        text = data.get("text", "").strip()
        if not text:
            return

        # Сохраняем сообщение в БД
        message = await self._create_message(text)
        serialized = MessageSerializer(message).data

        # Рассылаем в группу
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat.message", "message": serialized}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"]
        }))

    # ---- DB helpers ----
    @database_sync_to_async
    def _get_user_from_query(self):
        qs = self.scope.get("query_string", b"").decode()
        # ожидаем token=<access_token>
        token = None
        for part in qs.split("&"):
            if part.startswith("token="):
                token = part.split("=", 1)[1]
                break
        if not token:
            return None
        try:
            at = AccessToken(token)
            user_id = at["user_id"]
            return User.objects.get(pk=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def _user_in_chat(self, chat_id, user_id):
        try:
            chat = Chat.objects.get(pk=chat_id)
            return chat.users.filter(pk=user_id).exists()
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def _create_message(self, text):
        chat = Chat.objects.get(pk=self.chat_id)
        return Message.objects.create(chat=chat, sender=self.user, text=text)
