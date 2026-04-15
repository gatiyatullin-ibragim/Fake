from django.contrib import admin
from .models import UserPreference


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'address', 'updated_at']
    search_fields = ['user__username', 'user__email', 'address']
    readonly_fields = ['updated_at']