from django.contrib import admin
from .models import CustomerAddress


@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "phone", "city", "state", "pincode", "updated_at")
    search_fields = ("user__username", "user__email", "name", "phone", "city", "pincode")
