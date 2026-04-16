from products.models import Product
from .product_service import generate_and_save_image

def generate_images_for_all_products():
    products = Product.objects.all()

    for product in products:
        try:
            generate_and_save_image(product)
            print(f"{product.name} - GOTOVO")
        except Exception as e:
            print(f"Error ebaa {product.id}: {e}")