from django.contrib import admin

from . import models

# Register your models here.
admin.site.register(models.UserAdditional)

admin.site.register(models.Subscription)