from rest_framework.permissions import BasePermission, SAFE_METHODS

class EditUserPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool((request.user.is_authenticated and (request.user == obj or request.user.is_staff)) or request.method in SAFE_METHODS)

class EditContentPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool((request.user.is_authenticated and (request.user == obj.author or request.user.is_staff)) or request.method in SAFE_METHODS)
