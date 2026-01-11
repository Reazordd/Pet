# backend/forum/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'topics', views.ForumTopicViewSet, basename='forum-topic')
router.register(r'comments', views.ForumCommentViewSet, basename='forum-comment')

urlpatterns = [
    path('', include(router.urls)),
    # 🔥 Главная страница форума
    path('forum/', views.forum_home, name='forum-home'),
    path('categories/', views.get_categories, name='forum-categories'),
]