from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import UserPreference


def user_data(user: User) -> dict:
    preference = get_user_preferences(user)
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email or '',
        'address': preference.address or '',
    }


def get_user_preferences(user: User) -> UserPreference:
    preference, _ = UserPreference.objects.get_or_create(user=user)
    return preference


def token_pair_for_user(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    address = (data.get('address') or '').strip()
    password = data.get('password') or ''
    password2 = data.get('password2') or ''

    if not username or not password:
        return Response({'error': 'Имя пользователя и пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)
    if password != password2:
        return Response({'error': 'Пароли не совпадают'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Имя пользователя уже занято'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    preference = get_user_preferences(user)
    preference.address = address
    preference.save(update_fields=['address', 'updated_at'])
    tokens = token_pair_for_user(user)
    return Response({'user': user_data(user), **tokens})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return Response({'error': 'Логин и пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)

    get_user_preferences(user)
    tokens = token_pair_for_user(user)
    return Response({'user': user_data(user), **tokens})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = (request.data or {}).get('refresh')
    if refresh_token:
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response({'error': 'Некорректный refresh токен'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'success': True})


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def current_user(request):
    if request.method in ['PUT', 'PATCH']:
        data = request.data or {}
        request.user.email = (data.get('email') or request.user.email or '').strip()
        request.user.save(update_fields=['email'])

        preference = get_user_preferences(request.user)
        if 'address' in data:
            preference.address = (data.get('address') or '').strip()
            preference.save(update_fields=['address', 'updated_at'])

    return Response({'user': user_data(request.user)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def preferences(request):
    preference = get_user_preferences(request.user)
    return Response({'preferences': preference.counts})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_preferences(request):
    preference = get_user_preferences(request.user)
    preference.reset()
    return Response({'preferences': preference.counts})
