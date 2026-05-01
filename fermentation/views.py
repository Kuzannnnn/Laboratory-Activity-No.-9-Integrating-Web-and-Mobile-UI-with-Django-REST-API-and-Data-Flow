from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Batch
from django.utils import timezone

# --- Task 3 & 5: Retrieve Data (GET) ---
@api_view(['GET'])
def get_latest_batch(request):
    """
    Fetches telemetry for the dashboard. 
    Matches path: 'latest-batch/'
    """
    batch_id = request.GET.get('batch_id')
    all_batches = list(Batch.objects.values('batch_number', 'stage'))
    
    if batch_id:
        batch = Batch.objects.filter(batch_number=batch_id).first()
    else:
        batch = Batch.objects.order_by('-start_date').first()
    
    if not batch:
        return Response({
            "all_batches": all_batches,
            "stage": "OFFLINE", 
            "action": "Select a vat to monitor."
        }, status=status.HTTP_200_OK)

    # Expert System Logic (Task 1 & 7)
    temp = float(batch.temp)
    days_elapsed = (timezone.now() - batch.start_date).days # Restored for UI display
    
    if temp >= 55:
        inferred_stage = "THERMOPHILIC"
        prescribed_action = "Pathogen sterilization active."
        motor_active = True
    elif 35 <= temp < 55:
        inferred_stage = "ACTIVE"
        prescribed_action = "Optimal microbial processing."
        motor_active = True
    else:
        inferred_stage = "INITIAL"
        prescribed_action = "Monitoring incubation..."
        motor_active = False

    return Response({
        "all_batches": all_batches,
        "batch_number": batch.batch_number,
        "temp": temp,
        "stage": inferred_stage,
        "action": prescribed_action,
        "motor": motor_active,
        "days_elapsed": days_elapsed # Added to response
    })

# --- Task 4 & 6: Create Data with Auth (POST) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Gatekeeper for Task 6
def create_batch(request):
    """
    Creates a new batch record.
    Matches path: 'create-batch/'
    """
    try:
        num = request.data.get('batch_number')
        if not num:
            return Response({"error": "Batch number required"}, status=status.HTTP_400_BAD_REQUEST)
        
        batch = Batch.objects.create(
            batch_number=num, 
            temp=25.0, 
            ph=7.0, 
            stage="INITIAL"
        )
        return Response({
            "message": "Batch Created", 
            "batch_number": batch.batch_number
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- Task 7: Update Data (PATCH) ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_batch(request, batch_id):
    """
    Updates an existing batch record (e.g., manual motor override).
    Matches path: 'update-batch/<str:batch_id>/'
    """
    batch = Batch.objects.filter(batch_number=batch_id).first()
    if not batch:
        return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Example: If the mobile app sends a manual stage override
    if 'stage' in request.data:
        batch.stage = request.data.get('stage')
        batch.save()
        return Response({"message": "Batch Updated", "stage": batch.stage}, status=status.HTTP_200_OK)
        
    return Response({"message": "No updates applied"}, status=status.HTTP_200_OK)

# --- Task 7: Delete Data (DELETE) ---
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_batch(request, batch_id):
    """
    Removes a batch record.
    Matches path: 'delete-batch/<str:batch_id>/'
    """
    batch = Batch.objects.filter(batch_number=batch_id).first()
    if batch:
        batch.delete()
        return Response({"message": "Batch Deleted"}, status=status.HTTP_200_OK)
    return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)