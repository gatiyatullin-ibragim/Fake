from django.urls import path

from . import views

urlpatterns = [
    path('user/', views.current_user, name='current_user'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('preferences/', views.preferences, name='preferences'),
    path('preferences/reset/', views.reset_preferences, name='reset_preferences'),
]
