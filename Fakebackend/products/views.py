from decimal import Decimal, InvalidOperation
from collections import Counter
from urllib.parse import urlencode

from django.conf import settings
from django.db import connection
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, Product
from users.models import UserPreference
from .services.product_service import generate_and_save_image


def build_generated_images(product: Product) -> list[str]:
	backend_base = settings.BACKEND_BASE_URL

	urls = []
	for item in product.images.order_by('-created_at'):
		url = item.image_url.url
		if url.startswith('http://') or url.startswith('https://'):
			urls.append(url)
		else:
			urls.append(f"{backend_base.rstrip('/')}{url}")
	return urls


def serialize_product(p: Product) -> dict:
	return {
		'id': p.id,
		'name': p.name,
		'description': p.description,
		'price': str(p.price),
		'image': p.image,
		'generated_images': build_generated_images(p),
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


def build_interest_scores(request) -> dict:
	scores = {}

	if request.user and request.user.is_authenticated:
		pref, _ = UserPreference.objects.get_or_create(user=request.user)
		for tag, value in (pref.counts or {}).items():
			scores[tag] = scores.get(tag, 0) + int(value)

	interests_param = request.query_params.get('interests', '')
	if interests_param:
		for raw_tag in interests_param.split(','):
			tag = raw_tag.strip()
			if not tag:
				continue
			scores[tag] = scores.get(tag, 0) + 5

	return scores


def recommend_products(request, base_products: list[Product]) -> list[Product]:
	if not base_products:
		return []

	interest_scores = build_interest_scores(request)

	if interest_scores:
		scored = sorted(
			base_products,
			key=lambda p: (
				score_by_preferences(p, interest_scores),
				int(p.in_stock),
				p.id,
			),
			reverse=True,
		)
		return scored

	tag_popularity = Counter(
		tag
		for product in base_products
		for tag in (product.tags or [])
	)

	return sorted(
		base_products,
		key=lambda p: (
			sum(tag_popularity.get(tag, 0) for tag in (p.tags or [])),
			int(p.in_stock),
			p.id,
		),
		reverse=True,
	)


def get_interest_scores(request) -> dict:
	interests_param = request.query_params.get('interests', '')
	if interests_param:
		return {tag.strip(): 1 for tag in interests_param.split(',') if tag.strip()}

	if request.user and request.user.is_authenticated:
		pref, _ = UserPreference.objects.get_or_create(user=request.user)
		return pref.counts or {}

	return {}


def search_products(query: str) -> list[Product]:
	query = (query or '').strip()
	if not query:
		return list(Product.objects.all())

	query_terms = [token.lower() for token in query.split() if token]
	fts_query = ' '.join(f'{token}*' for token in query.split() if token)
	if not fts_query:
		return list(Product.objects.all())

	products = list(
		Product.objects.values('id', 'name', 'description', 'brand', 'category', 'tags')
	)

	with connection.cursor() as cursor:
		cursor.execute(
			'''
			CREATE VIRTUAL TABLE IF NOT EXISTS product_search
			USING fts5(product_id UNINDEXED, name, description, brand, category, tags)
			'''
		)
		cursor.execute('DELETE FROM product_search')
		cursor.executemany(
			'''
			INSERT INTO product_search(product_id, name, description, brand, category, tags)
			VALUES (%s, %s, %s, %s, %s, %s)
			''',
			[
				(
					product['id'],
					product['name'],
					product['description'],
					product['brand'],
					product['category'],
					' '.join(product['tags'] or []),
				)
				for product in products
			],
		)
		cursor.execute(
			'''
			SELECT product_id
			FROM product_search
			WHERE product_search MATCH %s
			ORDER BY bm25(product_search)
			''',
			[fts_query],
		)
		matched_ids = [row[0] for row in cursor.fetchall()]

	if not matched_ids:
		return []

	products_by_id = Product.objects.in_bulk(matched_ids)
	matched_products = [products_by_id[product_id] for product_id in matched_ids if product_id in products_by_id]

	return [
		product
		for product in matched_products
		if all(
			term in ' '.join([
				product.name,
				product.description,
				product.brand,
				product.category,
				' '.join(product.tags or []),
			]).lower()
			for term in query_terms
		)
	]


def parse_positive_int(raw_value, default_value: int) -> int:
	try:
		value = int(raw_value)
	except (TypeError, ValueError):
		return default_value
	return value if value > 0 else default_value


def build_paginated_response(request, products: list[Product], default_page_size: int = 24, max_page_size: int = 48) -> dict:
	page = parse_positive_int(request.query_params.get('page', 1), 1)
	page_size = parse_positive_int(request.query_params.get('page_size', default_page_size), default_page_size)
	page_size = min(page_size, max_page_size)

	total = len(products)
	start = (page - 1) * page_size
	end = start + page_size

	if start >= total and total > 0:
		page = max(1, ((total - 1) // page_size) + 1)
		start = (page - 1) * page_size
		end = start + page_size

	results = [serialize_product(p) for p in products[start:end]]

	base_url = request.build_absolute_uri(request.path)
	params = request.query_params.copy()

	def build_page_url(target_page: int):
		params['page'] = str(target_page)
		params['page_size'] = str(page_size)
		return f"{base_url}?{urlencode(params, doseq=True)}"

	next_url = build_page_url(page + 1) if end < total else None
	previous_url = build_page_url(page - 1) if page > 1 else None

	return {
		'count': total,
		'next': next_url,
		'previous': previous_url,
		'page': page,
		'page_size': page_size,
		'results': results,
	}


@api_view(['GET'])
def get_categories(request):
	categories = Category.objects.all().order_by('name')
	return Response([
		{'id': category.id, 'name': category.name, 'slug': category.slug}
		for category in categories
	])


@api_view(['GET'])
def get_products(request):
	products = search_products(request.query_params.get('q', ''))
	category_slug = (request.query_params.get('category', '') or '').strip().lower()
	if category_slug:
		products = [p for p in products if (p.category or '').lower() == category_slug]

	interest_scores = get_interest_scores(request)

	products.sort(key=lambda p: score_by_preferences(p, interest_scores), reverse=True)
	return Response(build_paginated_response(request, products))


@api_view(['GET'])
def get_recommendations(request):
	base_products = search_products(request.query_params.get('q', ''))
	recommended = recommend_products(request, base_products)

	limit_raw = request.query_params.get('limit', '12')
	try:
		limit = max(1, min(int(limit_raw), 50))
	except ValueError:
		limit = 12

	return Response([serialize_product(p) for p in recommended[:limit]])


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

	if category:
		category_slug = slugify(category)
		Category.objects.get_or_create(
			slug=category_slug,
			defaults={'name': category.replace('-', ' ').title()},
		)
		category = category_slug

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


@api_view(["POST"])
def generate_product_image_view(request, product_id):
    try:
        product = Product.objects.get(id=product_id)

        image_url = generate_and_save_image(product)

        return Response({
            "status": "success",
            "image_url": image_url
        })

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=500)