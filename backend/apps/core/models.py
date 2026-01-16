from django.db import models

class Task(models.Model):

    class Status(models.IntegerChoices):
        OPEN = 1
        ASSIGNED = 2
        CLOSED = 3
        DELETED = 4

    class Priority(models.IntegerChoices):
        CRITICAL = 0
        HIGH = 1
        MEDIUM = 2
        LOW = 3
        MINOR = 4

    title = models.CharField(max_length=200, null=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='assigned_tasks', null=True, blank=True)
    assigned_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='tasks_assigned', null=True, blank=True)
    closed_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='tasks_closed', null=True, blank=True)
    deleted_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='tasks_deleted', null=True, blank=True)
    status = models.IntegerField(choices=Status.choices, default=Status.OPEN)
    priority = models.IntegerField(choices=Priority.choices, default=Priority.MINOR)


    def history_record(self, changed_by, previous_status, new_status, assigned_to=None):
        TaskHistory.objects.create(
            task=self,
            changed_by=changed_by,
            previous_status=previous_status,
            new_status=new_status,
            assigned_to=assigned_to
        )



class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='history_assigned_tasks', null=True, blank=True)
    previous_status = models.IntegerField(choices=Task.Status.choices)
    new_status = models.IntegerField(choices=Task.Status.choices)

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    commented_at = models.DateTimeField(auto_now_add=True)
    commented_by = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    comment = models.TextField()