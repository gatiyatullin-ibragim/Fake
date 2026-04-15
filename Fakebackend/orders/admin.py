from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['get_cost']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'is_paid', 'total_price', 'created_at']
    list_filter = ['status', 'is_paid']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product_name', 'price', 'quantity']
    search_fields = ['product_name', 'order__user__username']