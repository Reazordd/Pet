# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, PhoneNumber


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "get_phone", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "phone_number__number")  # поиск по номеру через связь
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {
            "fields": ("first_name", "last_name", "email", "avatar", "bio", "location")
        }),
        (_("Permissions"), {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        (_("PetMarket Status"), {
            "fields": ("is_trusted_seller", "avito_delivery_count", "is_company_verified", "is_blocked")
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "is_active", "is_staff"),
        }),
    )

    readonly_fields = ("date_joined", "last_login")

    def get_phone(self, obj):
        """Отображает номер телефона из связанной модели PhoneNumber"""
        try:
            return obj.phone_number.number
        except PhoneNumber.DoesNotExist:
            return "—"
    get_phone.short_description = "Телефон"
    get_phone.admin_order_field = "phone_number__number"

    def avatar_preview(self, obj):
        if obj.avatar:
            return f'<img src="{obj.avatar.url}" width="40" height="40" style="border-radius:50%;" />'
        return "—"
    avatar_preview.allow_tags = True
    avatar_preview.short_description = "Аватар"


@admin.register(PhoneNumber)
class PhoneNumberAdmin(admin.ModelAdmin):
    list_display = ("user", "number", "verified", "created_at")
    list_filter = ("verified", "created_at")
    search_fields = ("number", "user__username", "user__email")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


# Настройка заголовков админки
admin.site.site_header = "🐾 PetMarket Admin"
admin.site.site_title = "PetMarket"
admin.site.index_title = "Добро пожаловать в админку!"