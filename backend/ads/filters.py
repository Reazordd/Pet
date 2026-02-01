# backend/ads/filters.py
import django_filters
from datetime import date
from django.db.models import Q
from .models import Pet

# 🔥 Добавляем маппинг для поиска по "Собаки", "Кошки" и т.д.
SPECIES_LABELS = {
    'dog': 'Собаки',
    'cat': 'Кошки',
    'bird': 'Птицы',
    'rodent': 'Грызуны',
    'fish': 'Рыбы',
    'reptile': 'Рептилии',
    'other': 'Другое',
}

class PetFilter(django_filters.FilterSet):
    species = django_filters.ChoiceFilter(choices=Pet.SPECIES_CHOICES)
    offer_type = django_filters.ChoiceFilter(choices=Pet.OFFER_TYPE_CHOICES)
    city = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    breed = django_filters.CharFilter(lookup_expr='icontains')

    age_group = django_filters.ChoiceFilter(
        method='filter_by_age_group',
        choices=[
            ('puppy', 'До 1 года'),
            ('young', '1–3 года'),
            ('adult', '3–7 лет'),
            ('senior', 'Старше 7 лет'),
        ]
    )

    search = django_filters.CharFilter(method='filter_by_search')

    def filter_by_age_group(self, queryset, name, value):
        today = date.today()
        if value == 'puppy':
            return queryset.filter(birth_date__gt=today.replace(year=today.year - 1))
        elif value == 'young':
            return queryset.filter(
                birth_date__lte=today.replace(year=today.year - 1),
                birth_date__gt=today.replace(year=today.year - 3)
            )
        elif value == 'adult':
            return queryset.filter(
                birth_date__lte=today.replace(year=today.year - 3),
                birth_date__gt=today.replace(year=today.year - 7)
            )
        elif value == 'senior':
            return queryset.filter(birth_date__lte=today.replace(year=today.year - 7))
        return queryset

    def filter_by_search(self, queryset, name, value):
        if value:
            # 🔥 Ищем совпадения по меткам категорий
            matching_species = []
            for key, label in SPECIES_LABELS.items():
                if value.lower() in label.lower():
                    matching_species.append(key)

            return queryset.filter(
                Q(name__icontains=value) |
                Q(description__icontains=value) |
                Q(breed__icontains=value) |
                Q(city__icontains=value) |
                Q(species__in=matching_species)  # ← КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
            )
        return queryset

    class Meta:
        model = Pet
        fields = ['species', 'offer_type', 'city', 'min_price', 'max_price', 'breed', 'age_group', 'search']