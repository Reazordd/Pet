# backend/forum/admin.py

from django.contrib import admin
from .models import ForumCategory, ForumTopic, ForumComment


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(ForumTopic)
class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "is_approved", "is_pinned", "created_at")
    list_filter = ("is_approved", "is_locked", "category")
    search_fields = ("title", "content", "author__username")
    actions = ["approve_topics", "disapprove_topics", "pin_topics", "unpin_topics"]
    ordering = ("-created_at",)

    @admin.action(description="✅ Одобрить выбранные темы")
    def approve_topics(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description="🚫 Скрыть выбранные темы")
    def disapprove_topics(self, request, queryset):
        queryset.update(is_approved=False)

    @admin.action(description="📌 Закрепить выбранные темы")
    def pin_topics(self, request, queryset):
        queryset.update(is_pinned=True)

    @admin.action(description="📍 Открепить выбранные темы")
    def unpin_topics(self, request, queryset):
        queryset.update(is_pinned=False)


@admin.register(ForumComment)
class ForumCommentAdmin(admin.ModelAdmin):
    list_display = ("author", "topic", "is_approved", "created_at")
    list_filter = ("is_approved",)
    search_fields = ("text", "author__username")
    actions = ["approve_comments", "hide_comments"]

    @admin.action(description="✅ Одобрить комментарии")
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)

    @admin.action(description="🚫 Скрыть комментарии")
    def hide_comments(self, request, queryset):
        queryset.update(is_approved=False)
