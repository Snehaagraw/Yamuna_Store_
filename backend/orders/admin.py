from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "price", "quantity", "image_url")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "customer_name",
        "customer_phone",
        "total_amount",
        "payment_method",
        "order_status",
        "created_at",
    )
    list_filter = ("order_status", "payment_method", "created_at")
    search_fields = ("order_number", "customer_name", "customer_phone", "customer_email")
    readonly_fields = ("order_number", "created_at", "updated_at")
    inlines = [OrderItemInline]
