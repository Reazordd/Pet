# backend/chat/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer

class ChatViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(users=user).prefetch_related('users', 'messages')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    user_ids = request.data.get('users', [])

    if not isinstance(user_ids, list) or len(user_ids) != 2 or request.user.id not in user_ids:
        return Response({'error': 'Specify exactly 2 users, including yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    other_user_id = [uid for uid in user_ids if uid != request.user.id][0]

    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'Other user not found'}, status=status.HTTP_404_NOT_FOUND)

    # Проверим, не существует ли уже чат
    chats = Chat.objects.filter(users=request.user).filter(users=other_user)
    if chats.exists():
        chat = chats.first()
        return Response(ChatSerializer(chat).data)

    # Создадим новый чат
    chat = Chat.objects.create()
    chat.users.set([request.user, other_user])
    chat.save()

    return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    chats = Chat.objects.filter(users=request.user).prefetch_related('users', 'messages')
    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)