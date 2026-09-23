from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "image_url",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer",
            "customer_name",
            "customer_phone",
            "customer_email",
            "shipping_address",
            "city",
            "state",
            "pincode",
            "order_notes",
            "total_amount",
            "payment_method",
            "payment_status",
            "order_status",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "order_number",
            "customer",
            "created_at",
            "updated_at",
        ]

    def get_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

    def create(self, validated_data):
        # Extract items raw data from the request payload
        items_data = self.initial_data.get("items", [])
        validated_data.pop("items", None)

        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["customer"] = request.user

        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            raw_product_id = item_data.get("product_id") or item_data.get("product")
            product_instance = None
            if raw_product_id:
                product_instance = Product.objects.filter(id=raw_product_id).first()

            OrderItem.objects.create(
                order=order,
                product=product_instance,
                product_name=item_data.get("name") or item_data.get("product_name") or "Devotional Attire",
                price=item_data.get("price", 0),
                quantity=item_data.get("quantity", 1),
                image_url=item_data.get("image") or item_data.get("image_url") or "",
            )

        return order
