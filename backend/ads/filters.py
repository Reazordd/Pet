import django_filters
from .models import Pet


class PetFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    breed = django_filters.CharFilter(lookup_expr='iexact')
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Pet
        fields = ['breed', 'category', 'is_active', 'price_min', 'price_max']
