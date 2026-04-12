from django.urls import path
from . import views

urlpatterns = [
    path('preferences/',       views.get_preferences,   name='user-preferences'),
    path('preferences/reset/', views.reset_preferences, name='user-pref-reset'),
]