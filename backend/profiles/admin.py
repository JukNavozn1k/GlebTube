from django.contrib import admin
from . import models


@admin.register(models.WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "viewer", "video", "watch_time")
    list_select_related = ("viewer", "video")  # убираем N+1

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("viewer", "video__channel")  
        # подтягиваем автора видео тоже, если он часто нужен


@admin.register(models.Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "subscriber", "channel", "active")
    list_select_related = ("subscriber", "channel")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("subscriber", "channel")
