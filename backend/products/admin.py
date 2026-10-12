from django.contrib import admin

from .models import Category, Product, ProductImage, Review



class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "section",
        "slug",
        "is_active",
        "product_count",
        "created_at",
        "updated_at",
    )
    list_filter = ("section", "is_active")
    search_fields = ("name", "slug")

    def product_count(self, obj):
        return obj.products.count()

    product_count.short_description = "Products"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "section",
        "category",
        "price",
        "stock_status",
        "is_best_seller",
        "is_new_collection",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "section",
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


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "product",
        "rating",
        "location",
        "is_verified",
        "is_featured",
        "created_at",
    )
    list_filter = ("rating", "is_verified", "is_featured", "created_at")
    search_fields = ("name", "location", "title", "comment", "product__name")
    readonly_fields = ("created_at", "updated_at")