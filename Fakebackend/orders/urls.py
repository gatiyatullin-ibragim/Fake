from django.urls import path
from . import views

urlpatterns = [
    path('',          views.get_orders,      name='orders'),
    path('create/',   views.create_order,    name='order-create'),
    path('<int:pk>/', views.get_order_detail, name='order-detail'),
]