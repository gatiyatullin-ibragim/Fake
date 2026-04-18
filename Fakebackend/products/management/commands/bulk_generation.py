from django.core.management.base import BaseCommand

from products.models import Product
from products.services.product_service import generate_and_save_image


class Command(BaseCommand):
    help = "Generate and save images for products using Leonardo API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--product-id",
            type=int,
            help="Generate image only for one product id",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Process only first N products (0 = all)",
        )
        parser.add_argument(
            "--replace-primary",
            action="store_true",
            help="Replace product.image with generated image (default: keep generated as additional image)",
        )

    def handle(self, *args, **options):
        product_id = options.get("product_id")
        limit = options.get("limit") or 0
        replace_primary = bool(options.get("replace_primary"))

        queryset = Product.objects.all().order_by("id")
        if product_id:
            queryset = queryset.filter(id=product_id)
        if limit > 0:
            queryset = queryset[:limit]

        products = list(queryset)
        if not products:
            self.stdout.write(self.style.WARNING("No products found for generation"))
            return

        success = 0
        failed = 0

        for product in products:
            try:
                image_url = generate_and_save_image(product, replace_primary=replace_primary)
                success += 1
                self.stdout.write(self.style.SUCCESS(f"[{product.id}] {product.name} -> {image_url}"))
            except Exception as exc:
                failed += 1
                self.stdout.write(self.style.ERROR(f"[{product.id}] {product.name} -> ERROR: {exc}"))

        self.stdout.write(
            self.style.NOTICE(
                f"Done. Total: {len(products)}, success: {success}, failed: {failed}"
            )
        )
