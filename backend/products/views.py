import os

import cloudinary.uploader

from rest_framework import permissions, status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [permissions.IsAdminUser()]

    def _delete_cloudinary_image(self, product_image):
        """
        Delete the actual image from Cloudinary.

        django-cloudinary-storage stores the Cloudinary
        public ID in the image field's name, usually like:

        products/example-image.jpg

        Cloudinary's destroy method expects the public ID
        without the file extension.
        """

        if not product_image.image:
            return

        image_name = product_image.image.name

        if not image_name:
            return

        public_id = os.path.splitext(
            image_name
        )[0]

        try:
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="image"
            )

            print(
                f"Cloudinary deletion result for "
                f"{public_id}: {result}"
            )

        except Exception as error:
            print(
                f"Cloudinary deletion failed for "
                f"{public_id}: {error}"
            )

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
            self._delete_cloudinary_image(
                product_image
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

        # Get all image records before the database
        # product is deleted.
        product_images = list(
            product.images.all()
        )

        # Delete actual Cloudinary files first.
        for product_image in product_images:
            self._delete_cloudinary_image(
                product_image
            )

        # Django CASCADE will now remove the
        # ProductImage database records.
        product.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )