from django.contrib import admin
from . import models


@admin.register(models.Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "channel", "status", "views", "createdAt")
    search_fields = ("title", "description", "channel__username")
    list_select_related = ("channel",)  
    readonly_fields = ("video_embedding",)


@admin.register(models.UserVideoRelation)
class UserVideoRelationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "video", "grade")
    list_select_related = ("user", "video") 

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("user", "video")


@admin.register(models.CommentVideo)
class CommentVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "channel", "video", "createdAt")
    list_select_related = ("channel", "video")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("channel", "video")


@admin.register(models.UserCommentRelation)
class UserCommentRelationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "comment", "grade")
    list_select_related = ("user", "comment")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("user", "comment__video", "comment__channel")