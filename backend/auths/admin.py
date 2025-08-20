import json
from django.contrib import admin
from django.utils.html import format_html, mark_safe
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "avatar_tag",
        "username",
        "email",
        "subscriberCount",
        "baseStars",
        "is_staff",
    )
    list_display_links = ("username",)
    search_fields = ("username", "email")
    list_filter = ("is_staff", "is_superuser", "is_active")

    readonly_fields = ("user_embeddings_pretty", "avatar_preview")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Персональная информация", {
            "fields": ("first_name", "last_name", "email", "bio", "avatar", "avatar_preview")
        }),
        ("Статистика", {
            "fields": ("baseStars", "subscriberCount", "user_embeddings_pretty")
        }),
        ("Права доступа", {
            "fields": ("is_active", "is_staff", "is_superuser")
        }),
        ("Даты", {"fields": ("last_login", "date_joined")}),
    )

    def avatar_tag(self, obj):
        if obj.avatar and hasattr(obj.avatar, "url"):
            return format_html(
                '<img src="{}" style="width:40px; height:40px; border-radius:50%;" />',
                obj.avatar.url
            )
        return "—"
    avatar_tag.short_description = "Аватар"

    def avatar_preview(self, obj):
        if obj.avatar and hasattr(obj.avatar, "url"):
            return format_html(
                '<img src="{}" style="max-width:150px; max-height:150px; border-radius:8px;" />',
                obj.avatar.url
            )
        return "—"
    avatar_preview.short_description = "Предпросмотр аватара"

    def user_embeddings_pretty(self, obj):
        if not obj.user_embeddings:
            return "—"
        try:
            pretty = json.dumps(obj.user_embeddings, ensure_ascii=False, indent=2)
            return mark_safe(f"<pre>{pretty}</pre>")
        except Exception:
            return str(obj.user_embeddings)
    user_embeddings_pretty.short_description = "Кластеры эмбеддингов"
