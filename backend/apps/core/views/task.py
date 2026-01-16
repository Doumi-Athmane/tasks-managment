from datetime import datetime, timedelta
from rest_framework.response import Response 
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import connection
from django.db.transaction import atomic
from django.db.models import Max 
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from django.utils import timezone

from apps.core.models import Task, TaskHistory, TaskComment
from apps.core.serializers.task import TaskSerializer, TaskHistorySerializer, TaskCommentSerializer, TasksListSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination #We can customize pagination if needed
    filter_backends = [DjangoFilterBackend]

    def get_serializer_class(self):
        if self.action == 'list':
            return TasksListSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @atomic
    @action(detail=True, methods=['PATCH'])
    def assign(self, request, pk=None):
        """
        Assign a user to a task.
        """
        task = Task.objects.select_for_update().get(pk=pk) # Lock the task row for update
        if task.status in [Task.Status.CLOSED, Task.Status.DELETED]: # Cannot assign closed or deleted tasks
            return Response({'error': 'Cannot assign a closed or deleted task'}, status=status.HTTP_400_BAD_REQUEST)
        user_id = request.data.get('assigned_to')
        if not user_id:
            return Response({'error': 'user to assign is required'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(pk=user_id) if user_id else None
        task.history_record( # Log the assignment in task history
            changed_by=request.user,
            previous_status=task.status,
            new_status=Task.Status.ASSIGNED,
            assigned_to=user
        )
        task.assigned_to = user
        task.assigned_by = request.user
        task.assigned_at = timezone.now()
        task.status = Task.Status.ASSIGNED
        task.save()
        return Response(TasksListSerializer(task).data)
    
    @atomic
    @action(detail=True, methods=['PATCH'])
    def unassign(self, request, pk=None):
        """
        Unassign a user from a task.
        """
        task = Task.objects.select_for_update().get(pk=pk) # Lock the task row for update
        if task.status != Task.Status.ASSIGNED:# Only assigned tasks can be unassigned
            return Response({'error': 'Only assigned tasks can be unassigned'}, status=status.HTTP_400_BAD_REQUEST)
        task.history_record(
            changed_by=request.user,
            previous_status=task.status,
            new_status=Task.Status.OPEN
        )
        task.assigned_to = None
        task.assigned_by = None
        task.assigned_at = None
        task.status = Task.Status.OPEN
        task.save()
        return Response(TasksListSerializer(task).data)
    
    @atomic
    @action(detail=True, methods=['PATCH'])
    def close(self, request, pk=None):
        """
        Close a task.
        """
        task = Task.objects.select_for_update().get(pk=pk) # Lock the task row for update
        if task.status != Task.Status.ASSIGNED: # Only assigned tasks can be closed
            return Response({'error': 'Only assigned tasks can be closed'}, status=status.HTTP_400_BAD_REQUEST)
        task.history_record(
            changed_by=request.user,
            previous_status=task.status,
            new_status=Task.Status.CLOSED
        )
        task.status = Task.Status.CLOSED
        task.closed_by = request.user
        task.closed_at = timezone.now()
        task.save()
        return Response(TasksListSerializer(task).data)
    
    @atomic
    @action(detail=True, methods=['PATCH'])
    def delete_task(self, request, pk=None):
        """
        Delete a task. (Soft delete by changing status to DELETED)
        """
        task = Task.objects.select_for_update().get(pk=pk)
        if task.status == Task.Status.DELETED:
            return Response({'error': 'Task is already deleted'}, status=status.HTTP_400_BAD_REQUEST)
        task.history_record(
            changed_by=request.user,
            previous_status=task.status,
            new_status=Task.Status.DELETED
        )
        task.status = Task.Status.DELETED
        task.deleted_by = request.user
        task.deleted_at = timezone.now()
        task.save()
        return Response(TasksListSerializer(task).data)

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """
        Add a comment to a task.
        """
        task = get_object_or_404(Task, pk=pk)
        request.data['task'] = task.id
        serializer = TaskCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, commented_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get the history of a task.
        """
        task = get_object_or_404(Task, pk=pk)
        history = task.history.all()
        serializer = TaskHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """
        Get all comments for a task.
        """
        task = get_object_or_404(Task, pk=pk)
        comments = task.comments.all()
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)