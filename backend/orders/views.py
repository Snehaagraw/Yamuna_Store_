from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Must be logged in to create or view orders
        if self.action in ["create", "list", "retrieve"]:
            return [permissions.IsAuthenticated()]

        # Only staff can update status or delete orders
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()

        is_personal_request = self.request.query_params.get("mine") == "true" or not user.is_staff

        if is_personal_request:
            # Customer only sees their personal orders
            filter_condition = Q(customer=user)
            if user.email:
                filter_condition |= (Q(customer__isnull=True) & Q(customer_email__iexact=user.email))
            queryset = Order.objects.filter(filter_condition).prefetch_related("items")
        else:
            # Staff managing orders from Admin Dashboard sees all store orders
            queryset = Order.objects.all().prefetch_related("items")

        order_number = self.request.query_params.get("order_number")
        if order_number:
            queryset = queryset.filter(order_number=order_number)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(customer=self.request.user)
        else:
            serializer.save()
