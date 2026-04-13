from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product


@api_view(['GET'])
def get_products(request):
	products = Product.objects.all()
	data = [
		{
			'id': p.id,
			'name': p.name,
			'description': p.description,
			'price': str(p.price),
			'image': p.image,
			'category': p.category,
			'in_stock': p.in_stock,
			'brand': p.brand,
		}
		for p in products
	]
	return Response(data)
