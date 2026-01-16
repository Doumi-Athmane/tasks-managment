from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.authentication import views

# Create a router for API views
router = DefaultRouter()

urlpatterns = [
    # Authentication endpoints
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.UserLogoutView.as_view(), name='user-logout'),

    # User management endpoints
    path('users/', views.UserViewSet.as_view(), name='user-list'),
    # Include router URLs
    path('', include(router.urls)),
]