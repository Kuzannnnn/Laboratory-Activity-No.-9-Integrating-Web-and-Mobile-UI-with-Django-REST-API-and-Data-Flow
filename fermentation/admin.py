from django.contrib import admin
from .models import Batch

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    # This displays these columns in the list view (Objective 5: Management)
    list_display = ('batch_number', 'stage', 'temp', 'ph', 'gas_level', 'start_date')
    
    # This adds a sidebar to filter by stage (Objective 2: Classification)
    list_filter = ('stage',)
    
    # This allows you to search for specific batch IDs
    search_fields = ('batch_number',)
    
    # This makes the dashboard look more like a professional "Batch Log"
    ordering = ('-start_date',)