from rest_framework.permissions import BasePermission, SAFE_METHODS

class EditUserPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool((request.user.is_authenticated and request.user == obj) or request.method in SAFE_METHODS)
