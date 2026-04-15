from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Order, OrderItem
from products.models import Product



def serialize_order_item(item):
    return {
        'id': item.id,
        'product_id': item.product.id if item.product else None,
        'product_name': item.product_name,
        'price': str(item.price),
        'quantity': item.quantity,
        'cost': str(item.get_cost()),
        'image': item.product.image if item.product else '',
    }


def serialize_order(order, detailed=False):
    data = {
        'id': order.id,
        'status': order.status,
        'is_paid': order.is_paid,
        'total_price': str(order.total_price),
        'created_at': order.created_at.isoformat(),
        'items_count': order.items.count(),
    }
    if detailed:
        data['items'] = [serialize_order_item(i) for i in order.items.all()]
    return data

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    user = request.user

    items_data = request.data.get('items', [])
    if not items_data:
        return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

    # Создаём заказ
    order = Order.objects.create(user=user)

    errors = []
    for item in items_data:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)
        product_name = item.get('name') or f'Product {product_id}'
        product_price = item.get('price')
        product_image = item.get('image', '')
        product_brand = item.get('brand', '')

        product, _ = Product.objects.get_or_create(
            pk=product_id,
            defaults={
                'name': product_name,
                'description': '',
                'price': Decimal(str(product_price or 0)),
                'image': product_image,
                'category': '',
                'in_stock': True,
                'brand': product_brand,
            },
        )

        if product_price is None:
            product_price = product.price

        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product_name,
            price=Decimal(str(product_price)),
            quantity=quantity,
        )

    if not order.items.exists():
        order.delete()
        return Response({'error': 'Ни один товар не добавлен', 'details': errors},
                        status=status.HTTP_400_BAD_REQUEST)

    return Response(serialize_order(order, detailed=True), status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user)
    return Response([serialize_order(o) for o in orders])



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, pk):
    try:
        order = Order.objects.get(pk=pk, user=request.user)
        return Response(serialize_order(order, detailed=True))
    except Order.DoesNotExist:
        return Response({'error': 'Заказ не найден'}, status=status.HTTP_404_NOT_FOUND)