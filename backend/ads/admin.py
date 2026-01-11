# backend/ads/admin.py
from django.contrib import admin
from django.contrib import messages
from .models import Pet, PetImage, Favorite
from notifications.models import Notification


class PetImageInline(admin.TabularInline):
    model = PetImage
    extra = 1


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    fields = (
        'user', 'name', 'species', 'breed', 'birth_date', 'price',
        'offer_type', 'city', 'city_slug', 'description', 'is_active',
        'moderation_status', 'rejection_reason', 'last_raised_at', 'created_at'
    )
    readonly_fields = ('created_at', 'last_raised_at', 'city_slug')

    list_display = ('name', 'species', 'breed', 'price', 'city', 'city_slug', 'user', 'moderation_status', 'is_active', 'created_at')
    list_filter = ('species', 'offer_type', 'moderation_status', 'is_active', 'created_at')
    search_fields = ('name', 'breed', 'city', 'user__username')
    inlines = [PetImageInline]

    actions = ['approve_pets', 'reject_pets']

    def approve_pets(self, request, queryset):
        count = 0
        for pet in queryset:
            if pet.moderation_status != 'approved':
                pet.moderation_status = 'approved'
                pet.is_active = True  # ← ДОБАВЛЕНО!
                pet.save(update_fields=['moderation_status', 'is_active'])
                # Создаём уведомление
                Notification.objects.create(
                    recipient=pet.user,
                    actor=request.user,
                    verb='moderation',
                    description='✅ Ваше объявление одобрено и опубликовано'
                )
                count += 1
        self.message_user(request, f"{count} объявлений одобрено.", messages.SUCCESS)

    approve_pets.short_description = "Одобрить выбранные"

    def reject_pets(self, request, queryset):
        count = 0
        for pet in queryset:
            if pet.moderation_status != 'rejected':
                pet.moderation_status = 'rejected'
                pet.rejection_reason = 'Не соответствует правилам'
                pet.is_active = False  # ← Опционально: деактивировать отклонённые
                pet.save(update_fields=['moderation_status', 'rejection_reason', 'is_active'])
                Notification.objects.create(
                    recipient=pet.user,
                    actor=request.user,
                    verb='moderation',
                    description='❌ Ваше объявление отклонено: Не соответствует правилам'
                )
                count += 1
        self.message_user(request, f"{count} объявлений отклонено.", messages.WARNING)

    reject_pets.short_description = "Отклонить выбранные"


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet', 'created_at')
    search_fields = ('user__username', 'pet__name')