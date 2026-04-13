from decimal import Decimal

from django.core.management.base import BaseCommand

from products.models import Product


SEED_PRODUCTS = [
    {
        "name": "Футболка Classic White",
        "description": "Белая футболка в спортивном стиле.",
        "price": Decimal("12990"),
        "image": "https://placehold.co/600x600/ffffff/111111?text=Classic+White",
        "category": "t-shirts",
        "brand": "Nike",
        "tags": ["white", "sport", "nike", "tshirt"],
    },
    {
        "name": "Худи Urban Black",
        "description": "Черное худи для повседневного образа.",
        "price": Decimal("18990"),
        "image": "https://placehold.co/600x600/111111/ffffff?text=Urban+Black",
        "category": "outerwear",
        "brand": "Adidas",
        "tags": ["black", "casual", "adidas", "hoodie"],
    },
    {
        "name": "Кроссовки Air Sprint",
        "description": "Легкие кроссовки для бега и зала.",
        "price": Decimal("34990"),
        "image": "https://placehold.co/600x600/eeeeee/111111?text=Air+Sprint",
        "category": "sneakers",
        "brand": "Nike",
        "tags": ["white", "running", "nike", "sneakers"],
    },
    {
        "name": "Шорты Court Pro",
        "description": "Шорты для тренировок и баскетбола.",
        "price": Decimal("9990"),
        "image": "https://placehold.co/600x600/222222/ffffff?text=Court+Pro",
        "category": "shorts",
        "brand": "Jordan",
        "tags": ["black", "basketball", "jordan", "shorts"],
    },
    {
        "name": "Куртка Street Wind",
        "description": "Легкая ветровка в уличном стиле.",
        "price": Decimal("25990"),
        "image": "https://placehold.co/600x600/2d6cdf/ffffff?text=Street+Wind",
        "category": "outerwear",
        "brand": "Puma",
        "tags": ["blue", "street", "puma", "jacket"],
    },
    {
        "name": "Футболка Minimal Grey",
        "description": "Серая футболка базового кроя.",
        "price": Decimal("11990"),
        "image": "https://placehold.co/600x600/c8c8c8/111111?text=Minimal+Grey",
        "category": "t-shirts",
        "brand": "Reebok",
        "tags": ["grey", "casual", "reebok", "tshirt"],
    },
]


class Command(BaseCommand):
    help = "Seed demo products with tags for preference-based ranking"

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for item in SEED_PRODUCTS:
            product, was_created = Product.objects.update_or_create(
                name=item["name"],
                defaults={
                    "description": item["description"],
                    "price": item["price"],
                    "image": item["image"],
                    "category": item["category"],
                    "in_stock": True,
                    "brand": item["brand"],
                    "tags": item["tags"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Seed complete: created={created}, updated={updated}"))
