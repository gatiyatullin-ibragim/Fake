import json

from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import UserPreference

ALLOWED_ORIGIN = 'http://localhost:4200'


def cors_headers(response: HttpResponse) -> HttpResponse:
    response['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN
    response['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


def preflight_response() -> HttpResponse:
    return cors_headers(HttpResponse())


def parse_json_body(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def user_data(user: User) -> dict:
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email or ''
    }


def get_user_preferences(user: User) -> UserPreference:
    preference, _ = UserPreference.objects.get_or_create(user=user)
    return preference


@csrf_exempt
@require_http_methods(['OPTIONS', 'POST'])
def register(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    data = parse_json_body(request)
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    password2 = data.get('password2') or ''

    if not username or not password:
        return cors_headers(JsonResponse({'error': 'Имя пользователя и пароль обязательны'}, status=400))
    if password != password2:
        return cors_headers(JsonResponse({'error': 'Пароли не совпадают'}, status=400))
    if User.objects.filter(username=username).exists():
        return cors_headers(JsonResponse({'error': 'Имя пользователя уже занято'}, status=400))

    user = User.objects.create_user(username=username, email=email, password=password)
    get_user_preferences(user)
    django_login(request, user)
    return cors_headers(JsonResponse({'user': user_data(user)}))


@csrf_exempt
@require_http_methods(['OPTIONS', 'POST'])
def login_view(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    data = parse_json_body(request)
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return cors_headers(JsonResponse({'error': 'Логин и пароль обязательны'}, status=400))

    user = authenticate(request, username=username, password=password)
    if user is None:
        return cors_headers(JsonResponse({'error': 'Неверные учетные данные'}, status=401))

    get_user_preferences(user)
    django_login(request, user)
    return cors_headers(JsonResponse({'user': user_data(user)}))


@csrf_exempt
@require_http_methods(['OPTIONS', 'POST'])
def logout_view(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    django_logout(request)
    return cors_headers(JsonResponse({'success': True}))


@require_http_methods(['OPTIONS', 'GET'])
def current_user(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    if not request.user.is_authenticated:
        return cors_headers(JsonResponse({'authenticated': False}, status=401))

    return cors_headers(JsonResponse({'user': user_data(request.user)}))


@require_http_methods(['OPTIONS', 'GET'])
def preferences(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    if not request.user.is_authenticated:
        return cors_headers(JsonResponse({'error': 'Требуется авторизация'}, status=401))

    preference = get_user_preferences(request.user)
    return cors_headers(JsonResponse({'preferences': preference.counts}))


@csrf_exempt
@require_http_methods(['OPTIONS', 'POST'])
def reset_preferences(request):
    if request.method == 'OPTIONS':
        return preflight_response()

    if not request.user.is_authenticated:
        return cors_headers(JsonResponse({'error': 'Требуется авторизация'}, status=401))

    preference = get_user_preferences(request.user)
    preference.reset()
    return cors_headers(JsonResponse({'preferences': preference.counts}))
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
>>>>>>> main
