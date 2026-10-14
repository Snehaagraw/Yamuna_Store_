from django.contrib.auth.models import User
from django.db.models import Sum, Q
from rest_framework import permissions, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView


from .models import CustomerAddress


class AuthRateThrottle(AnonRateThrottle):
    scope = "auth"


def get_user_saved_address(user):
    """
    Returns the user's saved delivery address dictionary.
    If no CustomerAddress record exists yet, checks for past orders
    and initializes CustomerAddress from the most recent order.
    """
    if not user or not user.is_authenticated:
        return None

    address_obj = getattr(user, "address", None)
    if address_obj:
        return address_obj.to_dict()

    try:
        from orders.models import Order
        latest_order = Order.objects.filter(customer=user).order_by("-created_at").first()
        if not latest_order and user.email:
            latest_order = Order.objects.filter(customer_email__iexact=user.email).order_by("-created_at").first()

        if latest_order:
            country_val = getattr(latest_order, "country", "India") or "India"
            address_obj = CustomerAddress.objects.create(
                user=user,
                name=latest_order.customer_name,
                phone=latest_order.customer_phone,
                country=country_val,
                address=latest_order.shipping_address,
                city=latest_order.city,
                state=latest_order.state,
                pincode=latest_order.pincode,
            )
            return address_obj.to_dict()
    except Exception:
        pass

    return None


# -----------------------------------------------------------------------------
# ADMIN AUTHENTICATION
# -----------------------------------------------------------------------------

class AdminLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get("username", "").strip()

        # Support flexible login by username or email (case-insensitive)
        matched_user = (
            User.objects.filter(username__iexact=identifier).first()
            or User.objects.filter(email__iexact=identifier, is_staff=True).first()
            or User.objects.filter(email__iexact=identifier).first()
        )
        if matched_user:
            attrs["username"] = matched_user.username

        data = super().validate(attrs)

        if not self.user.is_staff:
            raise AuthenticationFailed(
                "This account does not have administrator access."
            )

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "is_staff": self.user.is_staff,
        }

        return data


class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminLoginSerializer
    throttle_classes = [AuthRateThrottle]


# -----------------------------------------------------------------------------
# CUSTOMER AUTHENTICATION
# -----------------------------------------------------------------------------

class CustomerLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get("username", "").strip()

        # Support flexible login by username, email, or first_name (case-insensitive)
        matched_user = (
            User.objects.filter(username__iexact=identifier).first()
            or User.objects.filter(email__iexact=identifier).first()
            or User.objects.filter(first_name__iexact=identifier).first()
        )
        if matched_user:
            attrs["username"] = matched_user.username

        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "is_staff": self.user.is_staff,
            "saved_address": get_user_saved_address(self.user),
        }

        return data


class CustomerLoginView(TokenObtainPairView):
    serializer_class = CustomerLoginSerializer
    throttle_classes = [AuthRateThrottle]


class CustomerRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()
        first_name = request.data.get("name", "").strip() or request.data.get("first_name", "").strip()

        if not username:
            # If username is omitted, use email as username
            username = email

        if not username or not password:
            return Response(
                {"error": "Please provide a valid username/email and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"error": "An account with this username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": "An account with this email address already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create new customer user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            is_staff=False,
        )

        # Reconnect any previous orders placed with this email
        try:
            from orders.models import Order
            if email:
                Order.objects.filter(customer__isnull=True, customer_email__iexact=email).update(customer=user)
        except Exception:
            pass

        # Generate JWT tokens so user is immediately logged in
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff,
                    "saved_address": get_user_saved_address(user),
                },
                "message": "Account created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "saved_address": get_user_saved_address(user),
            }
        )

    def put(self, request):
        user = request.user
        first_name = request.data.get("first_name")
        if first_name is not None:
            user.first_name = first_name.strip()
            user.save()

        address_data = request.data.get("saved_address") or request.data
        address_obj, _ = CustomerAddress.objects.get_or_create(user=user)

        if "country" in address_data:
            address_obj.country = str(address_data.get("country") or "India").strip() or "India"
        if "name" in address_data:
            address_obj.name = str(address_data.get("name") or "").strip()
        if "phone" in address_data:
            address_obj.phone = str(address_data.get("phone") or "").strip()
        if "address" in address_data:
            address_obj.address = str(address_data.get("address") or "").strip()
        if "city" in address_data:
            address_obj.city = str(address_data.get("city") or "").strip()
        if "state" in address_data:
            address_obj.state = str(address_data.get("state") or "").strip()
        if "pincode" in address_data:
            address_obj.pincode = str(address_data.get("pincode") or "").strip()

        address_obj.save()

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "saved_address": address_obj.to_dict(),
                "message": "Delivery address saved successfully.",
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        return self.put(request)


class CustomerResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("email", "").strip() or request.data.get("username", "").strip()
        new_password = request.data.get("new_password", "").strip() or request.data.get("password", "").strip()

        if not identifier or not new_password:
            return Response(
                {"error": "Please provide your email/username and a new password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 6:
            return Response(
                {"error": "Password should be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = (
            User.objects.filter(username__iexact=identifier).first()
            or User.objects.filter(email__iexact=identifier).first()
            or User.objects.filter(first_name__iexact=identifier).first()
        )

        if not user:
            return Response(
                {"error": "No account found matching this email or username."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password updated successfully. You can now sign in with your new password."},
            status=status.HTTP_200_OK,
        )


class AdminCustomerListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from orders.models import Order

        customers = User.objects.filter(is_staff=False).order_by("-date_joined")
        customer_list = []

        for user in customers:
            user_orders = Order.objects.filter(
                Q(customer=user) | (Q(customer__isnull=True) & Q(customer_email__iexact=user.email))
            ).order_by("-created_at")

            order_count = user_orders.count()
            total_spent = user_orders.aggregate(total=Sum("total_amount"))["total"] or 0
            latest_order = user_orders.first()
            user_address = getattr(user, "address", None)

            customer_phone = (user_address.phone if (user_address and user_address.phone) else None) or (latest_order.customer_phone if latest_order else "N/A")
            customer_city = (user_address.city if (user_address and user_address.city) else None) or (latest_order.city if latest_order else "N/A")
            customer_state = (user_address.state if (user_address and user_address.state) else None) or (latest_order.state if latest_order else "")
            customer_country = (user_address.country if (user_address and user_address.country) else None) or (getattr(latest_order, "country", "India") if latest_order else "India")

            customer_list.append({
                "id": user.id,
                "name": user.first_name or user.username,
                "username": user.username,
                "email": user.email,
                "date_joined": user.date_joined,
                "order_count": order_count,
                "total_spent": float(total_spent),
                "last_order_date": latest_order.created_at if latest_order else None,
                "phone": customer_phone,
                "city": customer_city,
                "state": customer_state,
                "country": customer_country,
            })

        return Response(customer_list, status=status.HTTP_200_OK)


class AdminCustomerDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk, is_staff=False)
        except User.DoesNotExist:
            return Response(
                {"error": "Customer account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        customer_name = user.first_name or user.username
        user.delete()

        return Response(
            {"message": f"Customer '{customer_name}' has been deleted successfully."},
            status=status.HTTP_200_OK,
        )