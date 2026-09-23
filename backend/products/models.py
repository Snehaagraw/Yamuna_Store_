from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("Gopi Dress", "Gopi Dress"),
        ("Sarees", "Sarees"),
        ("Kurties", "Kurties"),
        ("Dupattas", "Dupattas"),
        ("Dhoti Kurta", "Dhoti Kurta"),
    ]

    STOCK_CHOICES = [
        ("In Stock", "In Stock"),
        ("Out of Stock", "Out of Stock"),
    ]

    name = models.CharField(max_length=255)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    fabric = models.CharField(
        max_length=100,
        blank=True
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_CHOICES,
        default="In Stock"
    )

    is_best_seller = models.BooleanField(
        default=False
    )

    is_new_collection = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="products/"
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.product.name} - Image"