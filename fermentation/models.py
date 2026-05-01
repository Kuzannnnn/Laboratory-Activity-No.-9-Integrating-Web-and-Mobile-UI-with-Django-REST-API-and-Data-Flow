from django.db import models

class Batch(models.Model):
    # Field to match your "Batch 001", "002" chips
    batch_number = models.CharField(max_length=10, unique=True) 
    start_date = models.DateTimeField(auto_now_add=True)
    
    # Sensor Data
    temp = models.FloatField(default=0.0)
    ph = models.FloatField(default=7.0)
    gas_level = models.FloatField(default=0.0) # For Objective 1
    
    # Expert System State
    stage = models.CharField(max_length=50, default="INITIAL")
    is_motor_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Batch {self.batch_number} - {self.stage}"