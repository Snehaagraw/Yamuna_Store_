import sys
import traceback
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

def custom_500(request):
    exc_type, exc_value, _ = sys.exc_info()
    return JsonResponse({
        "error": "Server Error (500)",
        "exception_type": str(exc_type),
        "exception_value": str(exc_value),
        "traceback": traceback.format_exc(),
    }, status=500)

handler500 = custom_500

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("products.urls")),
    path("api/", include("orders.urls")),
    path("api/auth/", include("accounts.urls")),
]