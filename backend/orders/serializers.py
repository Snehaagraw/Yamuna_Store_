from django.db import transaction
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
            "country",
            "order_notes",
            "total_amount",
            "shipping_fee",
            "shipping_carrier",
            "total_weight",
            "payment_method",
            "transaction_id",
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
        items_data = self.initial_data.get("items", [])
        validated_data.pop("items", None)

        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["customer"] = request.user

        with transaction.atomic():
            # Step 1: Concurrency protection — acquire row-level locks and validate stock
            validated_order_items = []
            for item_data in items_data:
                raw_product_id = item_data.get("product_id") or item_data.get("product")
                quantity = int(item_data.get("quantity", 1))
                size_name = item_data.get("size")

                # If size not directly in item_data, check if included in name e.g. "Gopi Dress (M)"
                if not size_name and item_data.get("name") and "(" in item_data.get("name") and ")" in item_data.get("name"):
                    try:
                        size_name = item_data.get("name").split("(")[-1].split(")")[0].strip()
                    except Exception:
                        size_name = None

                product_instance = None
                if raw_product_id:
                    # select_for_update() locks the database row until the transaction commits
                    product_instance = Product.objects.select_for_update().filter(id=raw_product_id).first()
                    if product_instance:
                        if product_instance.stock_status == "Out of Stock":
                            raise serializers.ValidationError(
                                f"Sorry, '{product_instance.name}' is currently out of stock."
                            )

                        if size_name and product_instance.size_inventory:
                            current_size_stock = int(product_instance.size_inventory.get(size_name, 0))
                            if current_size_stock < quantity:
                                raise serializers.ValidationError(
                                    f"Insufficient stock for '{product_instance.name}' ({size_name}). "
                                    f"Only {current_size_stock} available, but {quantity} requested."
                                )

                validated_order_items.append({
                    "product": product_instance,
                    "product_name": item_data.get("name") or item_data.get("product_name") or "Devotional Attire",
                    "price": item_data.get("price", 0),
                    "quantity": quantity,
                    "size_name": size_name,
                    "image_url": item_data.get("image") or item_data.get("image_url") or "",
                })

            # Step 2: Create order record
            order = Order.objects.create(**validated_data)

            # Step 3: Create order items and safely deduct stock
            for item in validated_order_items:
                OrderItem.objects.create(
                    order=order,
                    product=item["product"],
                    product_name=item["product_name"],
                    price=item["price"],
                    quantity=item["quantity"],
                    image_url=item["image_url"],
                )

                if item["product"] and item["size_name"]:
                    item["product"].deduct_size_stock(item["size_name"], quantity=item["quantity"])

            # Step 4: Automatically save or update customer's delivery address
            if request and request.user and request.user.is_authenticated:
                try:
                    from accounts.models import CustomerAddress
                    addr_obj, _ = CustomerAddress.objects.get_or_create(user=request.user)
                    addr_obj.name = validated_data.get("customer_name") or addr_obj.name
                    addr_obj.phone = validated_data.get("customer_phone") or addr_obj.phone
                    addr_obj.address = validated_data.get("shipping_address") or addr_obj.address
                    addr_obj.city = validated_data.get("city") or addr_obj.city
                    addr_obj.state = validated_data.get("state") or addr_obj.state
                    addr_obj.pincode = validated_data.get("pincode") or addr_obj.pincode
                    addr_obj.country = validated_data.get("country") or addr_obj.country
                    addr_obj.save()
                except Exception:
                    pass

            return order
