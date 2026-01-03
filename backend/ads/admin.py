# backend/ads/admin.py
from django.contrib import admin
from .models import Pet, PetImage, Favorite


class PetImageInline(admin.TabularInline):
    model = PetImage
    extra = 1


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    # 🔥 Явно указываем все поля, чтобы избежать кэша старой формы
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

    # Действия для модерации
    actions = ['approve_pets', 'reject_pets']

    def approve_pets(self, request, queryset):
        updated = queryset.update(moderation_status='approved')
        self.message_user(request, f"{updated} объявлений одобрено.")

    approve_pets.short_description = "Одобрить выбранные"

    def reject_pets(self, request, queryset):
        updated = queryset.update(moderation_status='rejected')
        self.message_user(request, f"{updated} объявлений отклонено.")

    reject_pets.short_description = "Отклонить выбранные"


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet', 'created_at')
    search_fields = ('user__username', 'pet__name')