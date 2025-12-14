# backend/chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from notifications.models import Notification

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    user_ids = request.data.get('users', [])
    if not isinstance(user_ids, list) or len(user_ids) != 2 or request.user.id not in user_ids:
        return Response(
            {'error': 'Specify exactly 2 users, including yourself.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    other_user_id = [uid for uid in user_ids if uid != request.user.id][0]
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'Other user not found'}, status=status.HTTP_404_NOT_FOUND)

    chats = Chat.objects.filter(users=request.user).filter(users=other_user)
    if chats.exists():
        chat = chats.first()
        return Response(ChatSerializer(chat, context={'request': request}).data)

    chat = Chat.objects.create()
    chat.users.set([request.user, other_user])
    chat.save()
    return Response(ChatSerializer(chat, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    chats = Chat.objects.filter(users=request.user).prefetch_related('users', 'messages')
    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    messages = chat.messages.all()
    serializer = MessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = MessageSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        message = serializer.save(chat=chat, sender=request.user)

        # 🔥 Создаём уведомление для собеседника
        other_user = chat.users.exclude(id=request.user.id).first()
        if other_user:
            Notification.objects.create(
                recipient=other_user,
                actor=request.user,
                verb='message',
                description=f'Новое сообщение: "{message.content[:50]}..."'
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_to_user(request):
    recipient_id = request.data.get('recipient_id')
    content = request.data.get('content', '').strip()

    if not recipient_id:
        return Response({'error': 'Укажите recipient_id'}, status=400)
    if not content:
        return Response({'error': 'Сообщение не может быть пустым'}, status=400)

    try:
        recipient = User.objects.get(id=recipient_id)
    except User.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=404)

    if recipient == request.user:
        return Response({'error': 'Нельзя писать самому себе'}, status=400)

    chat = Chat.objects.filter(users=request.user).filter(users=recipient).first()
    if not chat:
        chat = Chat.objects.create()
        chat.users.set([request.user, recipient])
        chat.save()

    message = Message.objects.create(chat=chat, sender=request.user, content=content)

    # 🔥 Уведомление в этом режиме тоже создаём
    Notification.objects.create(
        recipient=recipient,
        actor=request.user,
        verb='message',
        description=f'Новое сообщение: "{message.content[:50]}..."'
    )

    return Response({'success': 'Сообщение отправлено'}, status=201)