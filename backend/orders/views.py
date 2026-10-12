import os
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Must be logged in to create or view orders, or fetch secure wire details
        if self.action in ["create", "list", "retrieve", "bank_details"]:
            return [permissions.IsAuthenticated()]

        # Only staff can update status or delete orders
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=["get"], url_path="bank-details")
    def bank_details(self, request):
        """
        Secure endpoint: Returns international bank wire transfer instructions
        strictly to authenticated logged-in customers during checkout.
        """
        return Response({
            "accountName": os.getenv("STORE_BANK_ACCOUNT_NAME", "Yamuna Store"),
            "bankName": os.getenv("STORE_BANK_NAME", "State Bank of India"),
            "accountNumber": os.getenv("STORE_BANK_ACCOUNT_NUMBER", "000000000000"),
            "accountType": os.getenv("STORE_BANK_ACCOUNT_TYPE", "Current / Business Account"),
            "ifscCode": os.getenv("STORE_BANK_IFSC", "SBIN0000000"),
            "swiftCode": os.getenv("STORE_BANK_SWIFT", "SBININBBXXX"),
            "branch": os.getenv("STORE_BANK_BRANCH", "Vrindavan Dham Branch, Mathura, Uttar Pradesh, 281121, India"),
            "supportedCurrencies": os.getenv("STORE_BANK_CURRENCIES", "USD ($), EUR (€), GBP (£), AUD (A$), CAD (C$), INR (₹)"),
            "notes": os.getenv("STORE_BANK_NOTES", "Please mention your Order Number in the wire transfer description / remarks."),
        })

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
