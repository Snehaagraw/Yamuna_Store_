from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminLoginView,
    CustomerLoginView,
    CustomerProfileView,
    CustomerRegisterView,
    CustomerResetPasswordView,
    AdminCustomerListView,
    AdminCustomerDetailView,
)

urlpatterns = [
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("customer-login/", CustomerLoginView.as_view(), name="customer-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("register/", CustomerRegisterView.as_view(), name="customer-register"),
    path("profile/", CustomerProfileView.as_view(), name="customer-profile"),
    path("reset-password/", CustomerResetPasswordView.as_view(), name="customer-reset-password"),
    path("customers/", AdminCustomerListView.as_view(), name="admin-customers-list"),
    path("customers/<int:pk>/", AdminCustomerDetailView.as_view(), name="admin-customers-detail"),
]