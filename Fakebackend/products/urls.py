from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_products, name='products'),
    path('<int:pk>/', views.get_product_detail, name='product-detail'),
    path('similar/<int:pk>/', views.get_similar_products, name='product-similar'),
    path('track-click/', views.track_click, name='track-click'),
    path('track-view/', views.track_click, name='track-view'),
]
