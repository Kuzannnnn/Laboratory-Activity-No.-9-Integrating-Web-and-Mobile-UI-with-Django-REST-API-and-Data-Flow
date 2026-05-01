from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token # <-- Required for the login endpoint
from . import views

urlpatterns = [
    # Task 3 & 5: Retrieve Data (GET)
    path('latest-batch/', views.get_latest_batch, name='latest_batch'),
    
    # Task 4 & 6: Create Data (POST)
    path('create-batch/', views.create_batch, name='create_batch'), 
    
    # Task 7: Update Data (PATCH) - Added for manual motor override
    path('update-batch/<str:batch_id>/', views.update_batch, name='update_batch'),
    
    # Task 7: Delete Data (DELETE)
    path('delete-batch/<str:batch_id>/', views.delete_batch, name='delete_batch'),
    
    # Task 6: Authentication Login Endpoint (POST)
    path('login/', obtain_auth_token, name='api_login'),
]