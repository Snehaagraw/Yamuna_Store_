from django.db import models
from django.utils.text import slugify


SECTION_CHOICES = [
    ("women", "Women"),
    ("men", "Men"),
    ("kids", "Kids"),
]


class Category(models.Model):
    name = models.CharField(
        max_length=100
    )

    section = models.CharField(
        max_length=20,
        choices=SECTION_CHOICES,
        default="women",
        db_index=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["section", "name"]
        unique_together = [("name", "section")]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.section}-{self.name}" if self.section else self.name)
            slug = base_slug or "category"
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_section_display()} · {self.name}"


class Product(models.Model):
    STOCK_CHOICES = [
        ("In Stock", "In Stock"),
        ("Out of Stock", "Out of Stock"),
    ]

    name = models.CharField(max_length=255)

    section = models.CharField(
        max_length=20,
        choices=SECTION_CHOICES,
        default="women",
        db_index=True
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
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

    weight = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    colors = models.JSONField(
        default=list,
        blank=True
    )

    sizes = models.JSONField(
        default=list,
        blank=True
    )

    size_inventory = models.JSONField(
        default=dict,
        blank=True
    )

    size_prices = models.JSONField(
        default=dict,
        blank=True
    )

    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_CHOICES,
        default="In Stock",
        db_index=True
    )

    is_best_seller = models.BooleanField(
        default=False,
        db_index=True
    )

    is_new_collection = models.BooleanField(
        default=False,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["section", "stock_status"]),
            models.Index(fields=["section", "category"]),
            models.Index(fields=["category", "stock_status"]),
            models.Index(fields=["is_best_seller"]),
            models.Index(fields=["is_new_collection"]),
        ]

    def save(self, *args, **kwargs):
        if self.category and hasattr(self.category, "section") and not self.section:
            self.section = self.category.section
        super().save(*args, **kwargs)

    def deduct_size_stock(self, size_name, quantity=1):
        """
        Deduct stock for a specific size. If all sizes reach 0, update stock_status to 'Out of Stock'.
        """
        if not self.size_inventory or not size_name:
            return

        current_stock = int(self.size_inventory.get(size_name, 0))
        new_stock = max(0, current_stock - quantity)
        self.size_inventory[size_name] = new_stock

        if self.sizes and all(int(self.size_inventory.get(s, 0)) <= 0 for s in self.sizes):
            self.stock_status = "Out of Stock"

        if self.pk:
            self.save(update_fields=["size_inventory", "stock_status"])
        else:
            self.save()

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


class Review(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True
    )
    name = models.CharField(
        max_length=150
    )
    location = models.CharField(
        max_length=150,
        blank=True,
        default="India"
    )
    rating = models.PositiveSmallIntegerField(
        default=5
    )
    title = models.CharField(
        max_length=200,
        blank=True
    )
    comment = models.TextField()
    is_verified = models.BooleanField(
        default=True
    )
    is_featured = models.BooleanField(
        default=False
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Customer Review"
        verbose_name_plural = "Customer Reviews"

    def __str__(self):
        prod_title = self.product.name if self.product else "Storewide"
        return f"{self.rating}★ by {self.name} on {prod_title}"