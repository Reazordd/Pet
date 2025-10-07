from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User
from ads.models import Pet, Category, Notification


class NotificationInline(admin.TabularInline):
    model = Notification
    extra = 0
    readonly_fields = ('message', 'notification_type', 'created_at')
    can_delete = False
    verbose_name = "Уведомление"
    verbose_name_plural = "Уведомления"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'phone', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['username', 'email', 'phone']
    ordering = ['-date_joined']
    inlines = [NotificationInline]

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'address', 'avatar'),
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ['name', 'breed', 'price', 'user', 'is_active', 'created_at']
    list_display_links = ['name']
    list_filter = ['is_active', 'breed', 'category']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    list_editable = ['price', 'is_active']
    ordering = ['-created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_short', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['message', 'user__username']
    readonly_fields = ['created_at']

    def message_short(self, obj):
        return (obj.message[:50] + '...') if len(obj.message) > 50 else obj.message

    message_short.short_description = 'Сообщение'


# Настройки интерфейса
admin.site.site_header = 'PetMarket Administration'
admin.site.site_title = 'PetMarket Admin'
admin.site.index_title = 'Добро пожаловать в админку PetMarket'
