# backend/ads/management/commands/init_categories.py

from django.core.management.base import BaseCommand
from ads.models import Category
from django.utils.text import slugify

DEFAULT_CATEGORIES = [
    ("Собаки", "Собаки всех пород и размеров", "🐶"),
    ("Кошки", "Кошки и котята любых пород", "🐱"),
    ("Птицы", "Попугаи, канарейки, голуби и другие птицы", "🐦"),
    ("Рыбы", "Аквариумные и декоративные рыбы", "🐠"),
    ("Грызуны", "Хомяки, морские свинки, крысы и т.д.", "🐹"),
    ("Рептилии", "Черепахи, ящерицы, змеи и прочие", "🦎"),
    ("Прочие животные", "Насекомые, экзотика и другие", "🐾"),
]

class Command(BaseCommand):
    help = "Создает базовые категории животных (без дубликатов)"

    def handle(self, *args, **options):
        created_count = 0
        for name, desc, icon in DEFAULT_CATEGORIES:
            slug = slugify(name)
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "description": desc, "icon": icon},
            )
            if created:
                created_count += 1
        self.stdout.write(self.style.SUCCESS(f"✅ Добавлено {created_count} категорий"))
