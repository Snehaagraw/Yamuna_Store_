import os
import threading

import cloudinary.uploader

from django.db.models import Count, Q
from rest_framework import permissions, status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Category, Product, Review
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer


def _async_destroy_cloudinary(public_id):
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image"
        )
        print(
            f"Background Cloudinary deletion result for {public_id}: {result}"
        )
    except Exception as error:
        print(
            f"Background Cloudinary deletion failed for {public_id}: {error}"
        )


def delete_cloudinary_image(image_field):
    """
    Delete an image asset from Cloudinary asynchronously in a background thread
    so the HTTP response returns immediately without stalling the worker process.
    """
    if not image_field or not image_field.name:
        return

    public_id = os.path.splitext(image_field.name)[0]
    threading.Thread(
        target=_async_destroy_cloudinary,
        args=(public_id,),
        daemon=True
    ).start()


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        include_all = (
            self.request.query_params.get("all") == "true"
            or (user and user.is_authenticated and user.is_staff)
        )
        qs = Category.objects.annotate(annotated_product_count=Count("products"))
        if not include_all:
            qs = qs.filter(is_active=True)

        section = self.request.query_params.get("section")
        if section and section.lower() != "all":
            qs = qs.filter(section__iexact=section.lower())

        return qs.order_by("section", "name")

    def perform_destroy(self, instance):
        if instance.image:
            delete_cloudinary_image(instance.image)
        instance.delete()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        old_image = instance.image
        new_image = request.data.get("image")

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        updated_instance = serializer.save()

        # If a new image was uploaded and an old image existed, delete old Cloudinary image
        if new_image and old_image and old_image != updated_instance.image:
            delete_cloudinary_image(old_image)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = (
            Product.objects.select_related("category")
            .prefetch_related("images")
            .order_by("-created_at")
        )

        section = self.request.query_params.get("section")
        if section and section.lower() != "all":
            qs = qs.filter(section__iexact=section.lower())

        category = self.request.query_params.get("category")
        if category and category.lower() != "all":
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(
                    Q(category__name__iexact=category)
                    | Q(category__slug__iexact=category)
                )

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(fabric__icontains=search)
            )

        return qs

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [permissions.IsAdminUser()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop(
            "partial",
            False
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        images_to_remove = serializer.context.get(
            "images_to_remove",
            []
        )

        for product_image in images_to_remove:
            delete_cloudinary_image(
                product_image.image
            )

        updated_instance = self.get_object()

        response_serializer = self.get_serializer(
            updated_instance
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()

        product_images = list(
            product.images.all()
        )

        for product_image in product_images:
            delete_cloudinary_image(
                product_image.image
            )

        product.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Review.objects.all()
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)

        featured = self.request.query_params.get("featured")
        if featured in ["true", "1"]:
            qs = qs.filter(is_featured=True)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(is_verified=True)