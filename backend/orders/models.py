import uuid
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class Order(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("Cash on Delivery", "Cash on Delivery"),
        ("UPI", "UPI"),
        ("Online", "Online"),
    ]

    order_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        editable=False,
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True)

    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    order_notes = models.TextField(blank=True)

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default="UPI",
    )

    payment_status = models.CharField(
        max_length=50,
        default="Pending",
    )

    order_status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.order_number:
            date_str = timezone.now().strftime("%Y%m%d")
            today_prefix = f"YS-{date_str}-"

            # Find the highest existing sequence number for today
            today_orders = Order.objects.filter(order_number__startswith=today_prefix)
            last_order = today_orders.order_by("-order_number").first()

            if last_order:
                try:
                    last_seq = int(last_order.order_number.split("-")[-1])
                    next_seq = last_seq + 1
                except (ValueError, IndexError):
                    next_seq = today_orders.count() + 1
            else:
                next_seq = 1

            candidate_number = f"{today_prefix}{next_seq:03d}"
            # Ensure uniqueness
            while Order.objects.filter(order_number=candidate_number).exists():
                next_seq += 1
                candidate_number = f"{today_prefix}{next_seq:03d}"

            self.order_number = candidate_number

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} (₹{self.total_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )

    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"
