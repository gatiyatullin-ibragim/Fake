from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

import requests
from django.conf import settings
from django.core.files.base import ContentFile

from products.models import ProductImage
from .image_generator import generate_product_image


def build_prompt(product):
    return f"""
    high quality product photo, {product.name},
    brand: {product.brand},
    category: {product.category},
    clean white background,
    studio lighting,
    ecommerce style,
    ultra realistic,
    4k
    """

def generate_and_save_image(product, replace_primary=True):
    prompt = build_prompt(product)

    generated_image_url = generate_product_image(prompt)

    image_response = requests.get(generated_image_url, timeout=60)
    if image_response.status_code != 200:
        raise Exception(f"Failed to download generated image: {image_response.status_code}")

    parsed_path = Path(urlparse(generated_image_url).path)
    extension = parsed_path.suffix.lower() or '.jpg'
    if extension not in {'.jpg', '.jpeg', '.png', '.webp'}:
        extension = '.jpg'

    filename = f"product_{product.id}_{uuid4().hex[:12]}{extension}"

    if replace_primary:
        ProductImage.objects.filter(product=product, is_primary=True).update(is_primary=False)

    product_image = ProductImage(product=product, is_primary=replace_primary)
    product_image.image_url.save(filename, ContentFile(image_response.content), save=False)
    product_image.save()

    backend_base = settings.BACKEND_BASE_URL.rstrip('/')
    local_image_url = product_image.image_url.url
    absolute_image_url = f"{backend_base}{local_image_url}" if local_image_url.startswith('/') else f"{backend_base}/{local_image_url}"

    if replace_primary:
        product.image = absolute_image_url
        product.save(update_fields=['image'])

    return absolute_image_url