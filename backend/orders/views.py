import hashlib
import hmac
import os
import uuid
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order
from .serializers import OrderSerializer

try:
    import razorpay
except ImportError:
    razorpay = None


def get_razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
    if not key_id or not key_secret:
        return None, key_id, key_secret
    if razorpay:
        return razorpay.Client(auth=(key_id, key_secret)), key_id, key_secret
    return None, key_id, key_secret


class CreateRazorpayOrderView(APIView):
    """
    Step 1: Backend - Create Order
    POST /api/orders/create-razorpay-order/ or /api/create-order/
    Calls Razorpay API to generate an official order_id.
    Validates amount >= 100 paise.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_amount = request.data.get("amount")
        raw_amount_paise = request.data.get("amount_paise") or request.data.get("amountInPaise")

        if raw_amount_paise is not None:
            try:
                amount_in_paise = int(raw_amount_paise)
            except (ValueError, TypeError):
                return Response({"error": "Invalid amount_paise format"}, status=status.HTTP_400_BAD_REQUEST)
        elif raw_amount is not None:
            try:
                amount_in_paise = int(round(float(raw_amount) * 100))
            except (ValueError, TypeError):
                return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Minimum amount: 100 paise (INR 1.00)
        if amount_in_paise < 100:
            return Response(
                {"error": "Amount must be at least 100 paise (INR 1.00)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        currency = request.data.get("currency", "INR")
        receipt = request.data.get("receipt") or f"rcpt_{uuid.uuid4().hex[:10]}"

        client, key_id, key_secret = get_razorpay_client()
        if not client:
            return Response(
                {"error": "Razorpay client not configured or missing credentials"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": receipt,
                "notes": {
                    "store": "Yamuna Store Vrindavan",
                    "customer_name": str(request.data.get("customer_name", ""))[:40],
                }
            }
            rzp_order = client.order.create(data=order_data)
            return Response({
                "order_id": rzp_order["id"],
                "amount": rzp_order["amount"],
                "currency": rzp_order["currency"],
                "key_id": key_id,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Razorpay order creation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyRazorpayPaymentView(APIView):
    """
    Step 3: Backend - Verify Signature
    POST /api/orders/verify-razorpay-payment/ or /api/verify-payment/
    Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    Compare generated signature with razorpay_signature.
    Return success only if signatures match.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id") or request.data.get("order_id")
        payment_id = request.data.get("razorpay_payment_id") or request.data.get("payment_id")
        signature = request.data.get("razorpay_signature") or request.data.get("signature")

        if not order_id or not payment_id or not signature:
            return Response(
                {"error": "Missing required signature fields: order_id, payment_id, signature"},
                status=status.HTTP_400_BAD_REQUEST
            )

        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
        if not key_secret:
            return Response(
                {"error": "Razorpay secret key not configured on server"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Generate HMAC-SHA256 signature
        message = f"{order_id}|{payment_id}".encode("utf-8")
        generated_signature = hmac.new(key_secret.encode("utf-8"), message, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(generated_signature, signature):
            return Response(
                {"error": "Signature mismatch. Payment verification failed.", "status": "failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: If order_number is passed, update existing order in database
        order_number = request.data.get("order_number")
        if order_number:
            order = Order.objects.filter(order_number=order_number).first()
            if order:
                order.payment_status = "Paid"
                order.transaction_id = payment_id
                order.payment_method = "Razorpay (Online Verified)"
                order.save()

        return Response({
            "status": "success",
            "message": "Payment signature verified successfully",
            "payment_id": payment_id,
            "order_id": order_id,
        }, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        # Allow open checkout endpoints
        if self.action in ["create_razorpay_order", "verify_razorpay_payment"]:
            return [permissions.AllowAny()]

        # Must be logged in to create or view personal orders, or fetch secure wire details
        if self.action in ["create", "list", "retrieve", "bank_details"]:
            return [permissions.IsAuthenticated()]

        # Only staff can update status or delete orders
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=["post"], url_path="create-razorpay-order", permission_classes=[permissions.AllowAny])
    def create_razorpay_order(self, request):
        """
        Creates Razorpay order via OrderViewSet router endpoint
        """
        return CreateRazorpayOrderView().post(request)

    @action(detail=False, methods=["post"], url_path="verify-razorpay-payment", permission_classes=[permissions.AllowAny])
    def verify_razorpay_payment(self, request):
        """
        Verifies Razorpay payment signature via OrderViewSet router endpoint
        """
        return VerifyRazorpayPaymentView().post(request)

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
