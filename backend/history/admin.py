# backend/history/admin.py
from django.contrib import admin
from .models import ViewHistory

@admin.register(ViewHistory)
class ViewHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'pet', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user__username', 'pet__name')
    readonly_fields = ('viewed_at',)