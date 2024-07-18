from django import template
from django.conf import settings

register = template.Library()

@register.filter
def parse_avatar(value):
    if value:
        return value.url
    return settings.DEFAULT_AVATAR_URL
