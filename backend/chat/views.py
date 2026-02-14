# backend/chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from ads.models import Pet
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from notifications.models import Notification

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_chat(request):
    target_user_id = request.data.get('target_user_id')
    pet_id = request.data.get('pet_id')

    if not target_user_id:
        return Response({'error': 'target_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_user_id = int(target_user_id)
        pet_id = int(pet_id) if pet_id else None
    except (TypeError, ValueError):
        return Response({'error': 'Invalid ID format'}, status=status.HTTP_400_BAD_REQUEST)

    if request.user.id == target_user_id:
        return Response({'error': 'You cannot start a chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        other_user = User.objects.get(id=target_user_id)
        pet = Pet.objects.get(id=pet_id) if pet_id else None
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Pet.DoesNotExist:
        return Response({'error': 'Pet not found'}, status=status.HTTP_404_NOT_FOUND)

    chat = Chat.objects.filter(users=request.user).filter(users=other_user)
    if pet:
        chat = chat.filter(pet=pet)
    else:
        chat = chat.filter(pet__isnull=True)
    chat = chat.first()

    if chat:
        serializer = ChatSerializer(chat, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    chat = Chat.objects.create(pet=pet)
    chat.users.set([request.user, other_user])
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_chats(request):
    chats = Chat.objects.filter(users=request.user).prefetch_related(
        'messages',
        'messages__sender'
    )
    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    messages = chat.messages.select_related('sender').order_by('created_at')
    serializer = MessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    content = request.data.get('content', '').strip() or None
    file = request.FILES.get('file')

    if not content and not file:
        return Response({'error': 'Message or file is required'}, status=status.HTTP_400_BAD_REQUEST)

    message = Message.objects.create(
        chat=chat,
        sender=request.user,
        content=content,
        file=file
    )

    other_user = chat.users.exclude(id=request.user.id).first()
    if other_user:
        preview = content[:50] if content else '[Фото]'
        # ✅ ВСЕГДА создаём уведомление (пока не решим спам)
        Notification.objects.create(
            recipient=other_user,
            actor=request.user,
            verb='message',
            description=f'Новое сообщение: "{preview}..."'
        )

    serializer = MessageSerializer(message, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_chat(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    chat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_detail(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)
    if request.user not in chat.users.all():
        return Response({'error': 'Access denied'}, status=403)
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_chat_as_read(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, users=request.user)
    # ✅ Корректно помечаем сообщения от собеседника как прочитанные
    chat.messages.filter(
        ~Q(sender=request.user),
        is_read=False
    ).update(is_read=True)
    return Response({'status': 'ok'})