# backend/ads/admin.py
from django.contrib import admin
from .models import Pet, PetImage, Favorite

class PetImageInline(admin.TabularInline):
    model = PetImage
    extra = 1

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'breed', 'price', 'city', 'user', 'is_approved', 'is_hidden', 'created_at')
    list_filter = ('species', 'offer_type', 'is_approved', 'is_hidden', 'created_at')
    search_fields = ('name', 'breed', 'city', 'user__username')
    readonly_fields = ('created_at',)
    inlines = [PetImageInline]  # ← фото теперь видны

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet', 'created_at')
    search_fields = ('user__username', 'pet__name')