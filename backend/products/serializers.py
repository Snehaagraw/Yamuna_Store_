from rest_framework import serializers

from .models import Category, Product, ProductImage, Review


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    def get_product_count(self, obj):
        if hasattr(obj, "annotated_product_count"):
            return obj.annotated_product_count
        return obj.products.count()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "section",
            "slug",
            "image",
            "is_active",
            "created_at",
            "updated_at",
            "product_count",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "product_count",
        ]


class CategoryNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "section",
            "slug",
            "image",
            "is_active",
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(
        many=True,
        read_only=True
    )

    section = serializers.CharField(
        required=False,
        default="women"
    )

    category = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    category_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    category_details = CategoryNestedSerializer(
        source="category",
        read_only=True
    )

    image_files = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    remove_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    colors = serializers.JSONField(
        required=False,
        default=list
    )

    sizes = serializers.JSONField(
        required=False,
        default=list
    )

    size_inventory = serializers.JSONField(
        required=False,
        default=dict
    )

    size_prices = serializers.JSONField(
        required=False,
        default=dict
    )

    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews.exists():
            return 5.0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "section",
            "category",
            "category_id",
            "category_details",
            "description",
            "price",
            "fabric",
            "weight",
            "colors",
            "sizes",
            "size_inventory",
            "size_prices",
            "stock_status",
            "is_best_seller",
            "is_new_collection",
            "images",
            "image_files",
            "remove_image_ids",
            "average_rating",
            "reviews_count",
        ]

    def to_internal_value(self, data):
        import json

        # Convert QueryDict (or mutable mapping) to a plain Python dict
        # so DRF's JSONField does not misinterpret Python lists/dicts as HTML strings
        if hasattr(data, "getlist"):
            new_data = {}
            for key in data.keys():
                if key in ["image_files", "remove_image_ids"]:
                    new_data[key] = data.getlist(key)
                else:
                    new_data[key] = data.get(key)
            data = new_data
        elif isinstance(data, dict):
            data = dict(data)

        for field_name in ["colors", "sizes"]:
            val = data.get(field_name)
            if isinstance(val, str):
                val_str = val.strip()
                if val_str:
                    try:
                        parsed = json.loads(val_str)
                        if isinstance(parsed, list):
                            data[field_name] = [
                                str(item).strip() for item in parsed if str(item).strip()
                            ]
                        elif parsed:
                            data[field_name] = [str(parsed).strip()]
                        else:
                            data[field_name] = []
                    except Exception:
                        data[field_name] = [
                            s.strip() for s in val_str.split(",") if s.strip()
                        ]
                else:
                    data[field_name] = []
            elif isinstance(val, list):
                data[field_name] = [
                    str(item).strip() for item in val if str(item).strip()
                ]
            elif val is None and field_name in data:
                data[field_name] = []

        size_inv = data.get("size_inventory")
        if isinstance(size_inv, str):
            val_str = size_inv.strip()
            if val_str:
                try:
                    parsed = json.loads(val_str)
                    if isinstance(parsed, dict):
                        data["size_inventory"] = {
                            str(k).strip(): int(v) for k, v in parsed.items()
                        }
                    else:
                        data["size_inventory"] = {}
                except Exception:
                    data["size_inventory"] = {}
            else:
                data["size_inventory"] = {}
        elif isinstance(size_inv, dict):
            data["size_inventory"] = {
                str(k).strip(): int(v) for k, v in size_inv.items()
            }
        elif size_inv is None and "size_inventory" in data:
            data["size_inventory"] = {}

        size_pr = data.get("size_prices")
        if isinstance(size_pr, str):
            val_str = size_pr.strip()
            if val_str:
                try:
                    parsed = json.loads(val_str)
                    if isinstance(parsed, dict):
                        data["size_prices"] = {
                            str(k).strip(): float(v)
                            for k, v in parsed.items()
                            if v is not None and str(v).strip() != ""
                        }
                    else:
                        data["size_prices"] = {}
                except Exception:
                    data["size_prices"] = {}
            else:
                data["size_prices"] = {}
        elif isinstance(size_pr, dict):
            data["size_prices"] = {
                str(k).strip(): float(v)
                for k, v in size_pr.items()
                if v is not None and str(v).strip() != ""
            }
        elif size_pr is None and "size_prices" in data:
            data["size_prices"] = {}

        if "remove_image_ids" in data:
            rem_ids = data.get("remove_image_ids")
            if isinstance(rem_ids, list):
                data["remove_image_ids"] = [
                    int(i) for i in rem_ids if str(i).isdigit()
                ]
            elif isinstance(rem_ids, str):
                try:
                    parsed = json.loads(rem_ids)
                    if isinstance(parsed, list):
                        data["remove_image_ids"] = [
                            int(i) for i in parsed if str(i).isdigit()
                        ]
                    elif str(parsed).isdigit():
                        data["remove_image_ids"] = [int(parsed)]
                except Exception:
                    data["remove_image_ids"] = [
                        int(i.strip()) for i in rem_ids.split(",") if i.strip().isdigit()
                    ]

        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["section"] = instance.section
        ret["category"] = instance.category.name if instance.category else ""
        ret["category_id"] = instance.category.id if instance.category else None
        return ret

    def _resolve_category(self, validated_data):
        category_val = validated_data.pop("category", None)
        category_id_val = validated_data.pop("category_id", None)
        section_val = validated_data.get("section", "women")

        target = category_id_val if category_id_val is not None else category_val

        if target is None:
            return None

        if isinstance(target, Category):
            return target

        target_str = str(target).strip()
        if not target_str:
            return None

        if target_str.isdigit():
            cat = Category.objects.filter(id=int(target_str)).first()
            if cat:
                return cat

        cat = Category.objects.filter(name__iexact=target_str, section__iexact=section_val).first()
        if not cat:
            cat = Category.objects.filter(name__iexact=target_str).first()
        if cat:
            return cat

        cat, _ = Category.objects.get_or_create(name=target_str, defaults={"section": section_val})
        return cat

    def create(self, validated_data):
        image_files = validated_data.pop(
            "image_files",
            []
        )

        validated_data.pop(
            "remove_image_ids",
            []
        )

        cat_instance = self._resolve_category(validated_data)
        validated_data["category"] = cat_instance

        product = Product.objects.create(
            **validated_data
        )

        for image_file in image_files:
            ProductImage.objects.create(
                product=product,
                image=image_file
            )

        return product

    def update(self, instance, validated_data):
        image_files = validated_data.pop(
            "image_files",
            []
        )

        remove_image_ids = validated_data.pop(
            "remove_image_ids",
            []
        )

        if "category" in validated_data or "category_id" in validated_data:
            cat_instance = self._resolve_category(validated_data)
            validated_data["category"] = cat_instance

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        images_to_remove = list(
            ProductImage.objects.filter(
                product=instance,
                id__in=remove_image_ids
            )
        )

        self.context["images_to_remove"] = images_to_remove

        ProductImage.objects.filter(
            product=instance,
            id__in=remove_image_ids
        ).delete()

        for image_file in image_files:
            ProductImage.objects.create(
                product=instance,
                image=image_file
            )

        return instance


class ReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "product",
            "product_name",
            "name",
            "location",
            "rating",
            "title",
            "comment",
            "is_verified",
            "is_featured",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at"]