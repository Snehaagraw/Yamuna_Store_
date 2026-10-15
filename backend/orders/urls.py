from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CreateRazorpayOrderView, OrderViewSet, VerifyRazorpayPaymentView

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="orders")

urlpatterns = [
    path("create-order/", CreateRazorpayOrderView.as_view(), name="create-order"),
    path("verify-payment/", VerifyRazorpayPaymentView.as_view(), name="verify-payment"),
] + router.urls
