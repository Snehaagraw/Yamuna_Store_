from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(
        many=True,
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

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "description",
            "price",
            "fabric",
            "colors",
            "stock_status",
            "is_best_seller",
            "is_new_collection",
            "images",
            "image_files",
            "remove_image_ids",
        ]

    def create(self, validated_data):
        image_files = validated_data.pop(
            "image_files",
            []
        )

        validated_data.pop(
            "remove_image_ids",
            []
        )

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

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Capture the actual ProductImage objects
        # before deleting their database records.
        images_to_remove = list(
            ProductImage.objects.filter(
                product=instance,
                id__in=remove_image_ids
            )
        )

        self.context["images_to_remove"] = images_to_remove

        # Delete selected database records.
        ProductImage.objects.filter(
            product=instance,
            id__in=remove_image_ids
        ).delete()

        # Add newly uploaded images.
        for image_file in image_files:
            ProductImage.objects.create(
                product=instance,
                image=image_file
            )

        return instance