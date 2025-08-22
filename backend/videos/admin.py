from django.contrib import admin
from . import models


@admin.register(models.Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "channel", "status", "views", "createdAt")
    search_fields = ("title", "description", "channel__username")
    list_filter = ("status", "is_running")
    date_hierarchy = "createdAt"
    ordering = ("-createdAt",)
    list_select_related = ("channel",)
    autocomplete_fields = ("channel",)
    readonly_fields = ("video_embedding",)


@admin.register(models.UserVideoRelation)
class UserVideoRelationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "video", "grade")
    list_select_related = ("user", "video")
    autocomplete_fields = ("user", "video")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("user", "video")


@admin.register(models.CommentVideo)
class CommentVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "channel", "video", "createdAt")
    search_fields = ("text", "channel__username", "video__title")
    date_hierarchy = "createdAt"
    list_select_related = ("channel", "video", "video__channel")
    autocomplete_fields = ("channel", "video", "parent")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("channel", "video", "video__channel")


@admin.register(models.UserCommentRelation)
class UserCommentRelationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "comment", "grade")
    list_select_related = ("user", "comment")
    autocomplete_fields = ("user", "comment")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("user", "comment__video", "comment__channel")


@admin.register(models.WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "viewer", "video", "watch_time")
    date_hierarchy = "watch_time"
    list_select_related = ("viewer", "video")
    autocomplete_fields = ("viewer", "video")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("viewer", "video__channel")