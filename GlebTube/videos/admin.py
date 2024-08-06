from django.contrib import admin

# Register your models here.
from . import models

# Register your models here.
admin.site.register(models.Video)
admin.site.register(models.UserVideoRelation)
admin.site.register(models.UserCommentRelation)

admin.site.register(models.CommentVideo)
