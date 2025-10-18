import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, Message
from .serializers import MessageSerializer
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """Реальное общение в чате (аналог диалогов Авито)"""

    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.user = await self.get_user_from_token()

        if not self.user or not await self.user_in_chat(self.chat_id):
            await self.close()
            return

        self.room_group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Принимаем сообщение и рассылаем всем в чате"""
        data = json.loads(text_data)
        text = data.get("text", "").strip()
        if not text:
            return

        message = await self.create_message(text)
        serialized = MessageSerializer(message).data

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": serialized},
        )

    async def chat_message(self, event):
        """Отправка данных клиенту"""
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"]
        }))

    @database_sync_to_async
    def get_user_from_token(self):
        """Извлекаем пользователя из JWT токена"""
        query = self.scope["query_string"].decode()
        token_param = query.replace("token=", "")
        if not token_param:
            return None
        try:
            access_token = AccessToken(token_param)
            return User.objects.get(id=access_token["user_id"])
        except Exception:
            return None

    @database_sync_to_async
    def user_in_chat(self, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
            return chat.users.filter(id=self.user.id).exists()
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def create_message(self, text):
        chat = Chat.objects.get(id=self.chat_id)
        return Message.objects.create(chat=chat, sender=self.user, text=text)
