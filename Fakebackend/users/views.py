from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserPreference


@api_view(['GET'])
def get_preferences(request):
    """Возвращает теги юзера. Участник 1 использует для ранжирования."""
    user = request.user if request.user.is_authenticated else User.objects.get_or_create(username='guest')[0]
    if not user:
        return Response({})
    pref, _ = UserPreference.objects.get_or_create(user=user)
    return Response(pref.get_tags())


@api_view(['POST'])
def reset_preferences(request):
    """Сброс истории интересов."""
    user = request.user if request.user.is_authenticated else User.objects.get_or_create(username='guest')[0]
    if not user:
        return Response({'error': 'Нет пользователя'})
    pref, _ = UserPreference.objects.get_or_create(user=user)
    pref.reset_tags()
    pref.save()
    return Response({'status': 'ok', 'message': 'История интересов очищена'})