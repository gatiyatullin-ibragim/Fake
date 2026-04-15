from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import Category, Product


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


ADJECTIVES = [
    "Urban", "Classic", "Storm", "Velocity", "Street", "Aero", "Prime", "Core", "Ultra", "Flex",
    "Dynamic", "Pulse", "Summit", "Gravity", "Fusion", "Edge", "Power", "Icon", "Motion", "Craft",
]

COLORS = [
    "Black", "White", "Grey", "Navy", "Blue", "Green", "Red", "Sand", "Olive", "Burgundy",
]

MODELS = [
    "Runner", "Essential", "Pro", "Lite", "X", "Flow", "Team", "Elite", "Core", "Max",
]

BRANDS = ["Nike", "Adidas", "Puma", "Reebok", "Jordan", "Asics", "New Balance", "Under Armour"]

CATEGORY_OPTIONS = [
    ("t-shirts", ["tshirt", "casual", "cotton", "summer"]),
    ("sneakers", ["sneakers", "running", "sport", "comfort"]),
    ("outerwear", ["jacket", "hoodie", "street", "warm"]),
    ("shorts", ["shorts", "training", "light", "sport"]),
]


def make_generated_product(index: int) -> dict:
    category, category_tags = CATEGORY_OPTIONS[index % len(CATEGORY_OPTIONS)]
    adjective = ADJECTIVES[index % len(ADJECTIVES)]
    color = COLORS[index % len(COLORS)]
    model = MODELS[index % len(MODELS)]
    brand = BRANDS[index % len(BRANDS)]

    name = f"{category.capitalize()} {adjective} {model} {color} #{index + 1}"
    price = Decimal(str(8990 + (index % 18) * 1500))
    description = f"{brand} {category} для повседневного и спортивного стиля. Цвет: {color}."
    image_bg = ["111111", "f5f5f5", "2d6cdf", "1f8f4a", "d62828", "c0b283"][index % 6]
    image_fg = "ffffff" if image_bg != "f5f5f5" else "111111"

    tags = list({
        category,
        color.lower(),
        brand.lower().replace(" ", "-"),
        *category_tags,
        adjective.lower(),
        model.lower(),
    })

    return {
        "name": name,
        "description": description,
        "price": price,
        "image": f"https://placehold.co/600x600/{image_bg}/{image_fg}?text={category}+{index + 1}",
        "category": category,
        "brand": brand,
        "tags": tags,
    }


class Command(BaseCommand):
    help = "Seed demo products and generate a large catalog (100+ supported)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=120,
            help="How many generated products to create (default: 120).",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all existing products before seeding.",
        )

    def handle(self, *args, **options):
        target_count = max(0, int(options["count"]))
        should_reset = bool(options["reset"])

        if should_reset:
            deleted, _ = Product.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Reset catalog: deleted_objects={deleted}"))

        created = 0
        updated = 0

        catalog_payload = list(SEED_PRODUCTS)
        for i in range(target_count):
            catalog_payload.append(make_generated_product(i))

        for item in catalog_payload:
            category_slug = slugify(item["category"])
            Category.objects.get_or_create(
                slug=category_slug,
                defaults={"name": item["category"].replace('-', ' ').title()},
            )

            _, was_created = Product.objects.update_or_create(
                name=item["name"],
                defaults={
                    "description": item["description"],
                    "price": item["price"],
                    "image": item["image"],
                    "category": category_slug,
                    "in_stock": True,
                    "brand": item["brand"],
                    "tags": item["tags"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        total_products = Product.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: created={created}, updated={updated}, total_products={total_products}"
            )
        )
