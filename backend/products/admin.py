from django.contrib import admin

from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock_status",
        "is_best_seller",
        "is_new_collection",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "category",
        "stock_status",
        "is_best_seller",
        "is_new_collection",
    )

    search_fields = ("name", "description")

    readonly_fields = ("created_at", "updated_at")

    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "image", "alt_text")
    search_fields = ("product__name",)