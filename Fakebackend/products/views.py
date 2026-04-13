from decimal import Decimal, InvalidOperation

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product
from users.models import UserPreference


def serialize_product(p: Product) -> dict:
	return {
		'id': p.id,
		'name': p.name,
		'description': p.description,
		'price': str(p.price),
		'image': p.image,
		'category': {
			'name': p.category,
			'slug': p.category.lower().replace(' ', '-'),
		},
		'in_stock': p.in_stock,
		'brand': p.brand,
		'tags': p.tags or [],
	}


def score_by_preferences(product: Product, preference_scores: dict) -> int:
	if not preference_scores:
		return 0
	score = 0
	for tag in (product.tags or []):
		score += int(preference_scores.get(tag, 0))
	return score


def get_interest_scores(request) -> dict:
	interests_param = request.query_params.get('interests', '')
	if interests_param:
		return {tag.strip(): 1 for tag in interests_param.split(',') if tag.strip()}

	if request.user and request.user.is_authenticated:
		pref, _ = UserPreference.objects.get_or_create(user=request.user)
		return pref.counts or {}

	return {}


@api_view(['GET'])
def get_products(request):
	products = list(Product.objects.all())
	interest_scores = get_interest_scores(request)

	products.sort(key=lambda p: score_by_preferences(p, interest_scores), reverse=True)
	return Response([serialize_product(p) for p in products])


@api_view(['GET'])
def get_product_detail(request, pk: int):
	product = get_object_or_404(Product, pk=pk)
	return Response(serialize_product(product))


@api_view(['GET'])
def get_similar_products(request, pk: int):
	product = get_object_or_404(Product, pk=pk)
	base_tags = set(product.tags or [])

	if not base_tags:
		return Response([])

	others = Product.objects.exclude(pk=pk)
	scored = []
	for other in others:
		shared = base_tags.intersection(set(other.tags or []))
		if shared:
			scored.append((len(shared), other))

	scored.sort(key=lambda pair: pair[0], reverse=True)
	return Response([serialize_product(item[1]) for item in scored[:8]])


@api_view(['POST'])
def track_click(request):
	product_id = request.data.get('product_id')
	if not product_id:
		return Response({'error': 'product_id обязателен'}, status=400)

	product = get_object_or_404(Product, pk=product_id)

	if not request.user or not request.user.is_authenticated:
		return Response({'tracked': False, 'reason': 'not_authenticated'})

	pref, _ = UserPreference.objects.get_or_create(user=request.user)
	pref.increment_tags(product.tags or [])

	return Response({'tracked': True, 'preferences': pref.counts})


@api_view(['POST'])
def create_product(request):
	data = request.data or {}

	name = (data.get('name') or '').strip()
	description = (data.get('description') or '').strip()
	image = (data.get('image') or '').strip()
	category = (data.get('category') or '').strip()
	brand = (data.get('brand') or '').strip()
	in_stock = bool(data.get('in_stock', True))
	tags = data.get('tags') or []
	price_raw = data.get('price')

	if not name:
		return Response({'error': 'Поле name обязательно'}, status=400)

	try:
		price = Decimal(str(price_raw))
	except (InvalidOperation, TypeError):
		return Response({'error': 'Поле price должно быть числом'}, status=400)

	if not isinstance(tags, list):
		return Response({'error': 'Поле tags должно быть массивом'}, status=400)

	normalized_tags = [str(tag).strip() for tag in tags if str(tag).strip()]

	product = Product.objects.create(
		name=name,
		description=description,
		price=price,
		image=image,
		category=category,
		in_stock=in_stock,
		brand=brand,
		tags=normalized_tags,
	)

	return Response(serialize_product(product), status=201)
