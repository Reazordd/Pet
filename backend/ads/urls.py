from rest_framework import routers
from django.urls import path, include
from .views import PetViewSet, CategoryViewSet

router = routers.DefaultRouter()
router.register(r'pets', PetViewSet, basename='pet')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]
