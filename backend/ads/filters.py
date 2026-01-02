# backend/ads/filters.py
import django_filters
from .models import Pet

class PetFilter(django_filters.FilterSet):
    species = django_filters.ChoiceFilter(choices=Pet.SPECIES_CHOICES)
    offer_type = django_filters.ChoiceFilter(choices=Pet.OFFER_TYPE_CHOICES)
    city = django_filters.CharFilter(lookup_expr='icontains')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    breed = django_filters.CharFilter(lookup_expr='icontains')  # 🔥 ДОБАВЛЕНО

    class Meta:
        model = Pet
        fields = ['species', 'offer_type', 'city', 'min_price', 'max_price', 'breed']